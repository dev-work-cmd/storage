// Owns the dashboard summary query for authenticated owners.
// Returns a small DTO so UI components never receive raw Prisma records.
// Must only read documents owned by the current session user.
import "server-only";

import { DocumentStatus } from "@prisma/client";

import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export type DashboardOverview = {
  metrics: {
    totalDocuments: number;
    processedDocuments: number;
    failedDocuments: number;
    scanCount: number;
  };
  recentDocuments: Array<{
    publicId: string;
    title: string;
    status: DocumentStatus;
    createdAt: Date;
    scanCount: number;
  }>;
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const session = await requireCurrentSession();
  const ownerId = session.user.id;

  const [
    totalDocuments,
    processedDocuments,
    failedDocuments,
    scanAggregate,
    recentDocuments,
  ] = await Promise.all([
    prisma.document.count({
      where: {
        ownerId,
        deletedAt: null,
      },
    }),
    prisma.document.count({
      where: {
        ownerId,
        deletedAt: null,
        status: DocumentStatus.PROCESSED,
      },
    }),
    prisma.document.count({
      where: {
        ownerId,
        deletedAt: null,
        status: DocumentStatus.FAILED,
      },
    }),
    prisma.document.aggregate({
      where: {
        ownerId,
        deletedAt: null,
      },
      _sum: {
        scanCount: true,
      },
    }),
    prisma.document.findMany({
      where: {
        ownerId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        publicId: true,
        title: true,
        status: true,
        createdAt: true,
        scanCount: true,
      },
    }),
  ]);

  return {
    metrics: {
      totalDocuments,
      processedDocuments,
      failedDocuments,
      scanCount: scanAggregate._sum.scanCount ?? 0,
    },
    recentDocuments,
  };
}
