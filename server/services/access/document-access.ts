// Owns public document access-policy decisions for verification and file delivery.
// Centralizes existence, revocation, expiration, PIN, and counter updates.
// Must be reused by file streaming routes before any processed PDF is returned.
import "server-only";

import { verify } from "@node-rs/argon2";
import { AuditEvent, AuditOutcome, Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export type PublicAccessMode = "verify" | "open" | "download";
type DeniedReason = Extract<
  PublicDocumentAccessResult,
  { status: "denied" }
>["reason"];

export type RequestMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

export type PublicDocumentAccessResult =
  | {
      status: "allowed";
      mode: PublicAccessMode;
      document: {
        id: string;
        publicId: string;
        title: string;
        originalFilename: string;
        processedFilePath: string;
        qrMode: "VERIFY" | "OPEN" | "DOWNLOAD";
        requiresPin: boolean;
        expiresAt: Date | null;
        maxAccessCount: number | null;
        processedAt: Date | null;
      };
      fileRoute: string | null;
    }
  | {
      status: "pin_required";
      mode: PublicAccessMode;
      document: {
        publicId: string;
        title: string;
        qrMode: "VERIFY" | "OPEN" | "DOWNLOAD";
        processedAt: Date | null;
      };
    }
  | {
      status: "denied";
      mode: PublicAccessMode;
      reason:
        | "not_found"
        | "disabled"
        | "revoked"
        | "expired"
        | "access_limit"
        | "pin_invalid"
        | "not_processed";
      message: string;
      documentTitle?: string;
    };

function buildFileRoute(publicId: string, mode: PublicAccessMode) {
  return `/api/documents/${encodeURIComponent(
    publicId,
  )}/file?mode=${mode}`;
}

function eventForMode(mode: PublicAccessMode) {
  if (mode === "download") {
    return AuditEvent.DOCUMENT_DOWNLOADED;
  }

  if (mode === "open") {
    return AuditEvent.DOCUMENT_OPENED;
  }

  return AuditEvent.ACCESS_ALLOWED;
}

export async function evaluatePublicDocumentAccess(input: {
  publicId: string;
  mode: PublicAccessMode;
  followDocumentQrMode?: boolean;
  pin?: string;
  pinVerified?: boolean;
  metadata?: RequestMetadata;
  recordAccess?: boolean;
}): Promise<PublicDocumentAccessResult> {
  const document = await prisma.document.findUnique({
    where: {
      publicId: input.publicId,
    },
    select: {
      id: true,
      publicId: true,
      title: true,
      originalFilename: true,
      processedFilePath: true,
      status: true,
      qrMode: true,
      expiresAt: true,
      maxAccessCount: true,
      accessCount: true,
      requiresPin: true,
      pinHash: true,
      isEnabled: true,
      isRevoked: true,
      deletedAt: true,
      processedAt: true,
    },
  });

  if (!document || document.deletedAt) {
    return {
      status: "denied",
      mode: input.mode,
      reason: "not_found",
      message: "This verification link is not available.",
    };
  }

  const accessMode: PublicAccessMode =
    input.followDocumentQrMode &&
    input.mode === "verify" &&
    document.qrMode === "DOWNLOAD"
      ? "download"
      : input.mode;
  const shouldRecordAccess =
    (input.recordAccess ?? true) &&
    !(
      input.followDocumentQrMode &&
      input.mode === "verify" &&
      accessMode !== "verify"
    );

  const deny = async (
    reason: DeniedReason,
    message: string,
  ): Promise<PublicDocumentAccessResult> => {
    await prisma.document.update({
      where: { id: document.id },
      data: {
        scanCount: { increment: 1 },
        accessFailureCount: { increment: 1 },
        auditLogs: {
          create: {
            event: AuditEvent.ACCESS_DENIED,
            outcome: AuditOutcome.FAILURE,
            ipAddress: input.metadata?.ipAddress,
            userAgent: input.metadata?.userAgent,
            metadata: { reason },
          },
        },
      },
    });

    return {
      status: "denied",
      mode: accessMode,
      reason,
      message,
      documentTitle: document.title,
    };
  };

  if (!document.isEnabled) {
    return deny("disabled", "This document is not currently available.");
  }

  if (document.isRevoked) {
    return deny("revoked", "This document access has been revoked.");
  }

  if (document.expiresAt && document.expiresAt <= new Date()) {
    return deny("expired", "This document access has expired.");
  }

  if (
    document.maxAccessCount !== null &&
    document.accessCount >= document.maxAccessCount
  ) {
    return deny("access_limit", "This document access limit has been reached.");
  }

  if (document.status !== "PROCESSED" || !document.processedFilePath) {
    return deny("not_processed", "This document is not ready for public access.");
  }

  if (document.requiresPin && accessMode !== "verify" && !input.pinVerified) {
    if (!input.pin) {
      return {
        status: "pin_required",
        mode: accessMode,
        document: {
          publicId: document.publicId,
          title: document.title,
          qrMode: document.qrMode,
          processedAt: document.processedAt,
        },
      };
    }

    const isValidPin = document.pinHash
      ? await verify(document.pinHash, input.pin)
      : false;

    if (!isValidPin) {
      return deny("pin_invalid", "The PIN was not accepted.");
    }
  }

  const increments: Prisma.DocumentUpdateManyMutationInput = {
    scanCount: { increment: 1 },
    accessSuccessCount: { increment: 1 },
    lastAccessedAt: new Date(),
  };

  if (accessMode !== "verify") {
    increments.accessCount = { increment: 1 };
  }

  if (accessMode === "open") {
    increments.openCount = { increment: 1 };
  }

  if (accessMode === "download") {
    increments.downloadCount = { increment: 1 };
  }

  if (shouldRecordAccess) {
    if (accessMode !== "verify" && document.maxAccessCount !== null) {
      const updated = await prisma.document.updateMany({
        where: {
          id: document.id,
          accessCount: {
            lt: document.maxAccessCount,
          },
        },
        data: increments,
      });

      if (updated.count !== 1) {
        return deny(
          "access_limit",
          "This document access limit has been reached.",
        );
      }

      await prisma.auditLog.create({
        data: {
          documentId: document.id,
          event: eventForMode(accessMode),
          outcome: AuditOutcome.SUCCESS,
          ipAddress: input.metadata?.ipAddress,
          userAgent: input.metadata?.userAgent,
          metadata: {
            mode: accessMode,
          },
        },
      });
    } else {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          ...increments,
          auditLogs: {
            create: {
              event: eventForMode(accessMode),
              outcome: AuditOutcome.SUCCESS,
              ipAddress: input.metadata?.ipAddress,
              userAgent: input.metadata?.userAgent,
              metadata: {
                mode: accessMode,
              },
            },
          },
        },
      });
    }
  }

  return {
    status: "allowed",
    mode: accessMode,
    document: {
      id: document.id,
      publicId: document.publicId,
      title: document.title,
      originalFilename: document.originalFilename,
      processedFilePath: document.processedFilePath,
      qrMode: document.qrMode,
      requiresPin: document.requiresPin,
      expiresAt: document.expiresAt,
      maxAccessCount: document.maxAccessCount,
      processedAt: document.processedAt,
    },
    fileRoute:
      accessMode === "verify"
        ? null
        : buildFileRoute(document.publicId, accessMode),
  };
}
