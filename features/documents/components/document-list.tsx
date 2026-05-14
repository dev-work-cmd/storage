"use client";

// Owns the protected owner document library presentation.
// Provides client-side search, sorting, and pagination for owner-safe document metadata.
// Must remain presentation-only; storage access and authorization stay server-owned.
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import {
  AiSearchIcon,
  ArrowUpDownIcon,
  CheckmarkBadge02Icon,
  Edit01Icon,
  File01Icon,
  FileClockIcon,
  FileCorruptIcon,
  FileSyncIcon,
  QrCodeIcon,
  QrCodeScanIcon,
  Shield01Icon,
  ShieldBanIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OwnerDocumentListItem } from "@/features/documents/server/get-owner-documents";
import { cn } from "@/lib/utils";

type SortKey = "title" | "createdAt" | "status" | "scanCount";
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

function formatDate(date: Date | string | null) {
  if (!date) {
    return "Not set";
  }

  return new Date(date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toTimestamp(date: Date | string | null) {
  if (!date) {
    return 0;
  }

  return new Date(date).getTime();
}

const documentStatusStyles: Record<
  string,
  { className: string; icon: typeof File01Icon; label: string }
> = {
  DRAFT: {
    className:
      "border-[color:oklch(0.89_0.015_74)] bg-[color:oklch(0.97_0.008_80)] text-[color:oklch(0.42_0.024_39)]",
    icon: File01Icon,
    label: "Draft",
  },
  PROCESSING: {
    className:
      "border-[color:oklch(0.88_0.04_76)] bg-[color:oklch(0.96_0.025_81)] text-[color:oklch(0.47_0.05_67)]",
    icon: FileSyncIcon,
    label: "Processing",
  },
  PROCESSED: {
    className:
      "border-[color:oklch(0.88_0.03_145)] bg-[color:oklch(0.96_0.02_145)] text-[color:oklch(0.46_0.06_145)]",
    icon: CheckmarkBadge02Icon,
    label: "Processed",
  },
  FAILED: {
    className:
      "border-[color:oklch(0.88_0.035_28)] bg-[color:oklch(0.96_0.02_28)] text-[color:oklch(0.48_0.08_28)]",
    icon: FileCorruptIcon,
    label: "Failed",
  },
};

const accessStateStyles = {
  Revoked: {
    className:
      "border-[color:oklch(0.88_0.035_28)] bg-[color:oklch(0.96_0.02_28)] text-[color:oklch(0.48_0.08_28)]",
    icon: ShieldBanIcon,
  },
  Enabled: {
    className:
      "border-[color:oklch(0.88_0.03_145)] bg-[color:oklch(0.96_0.02_145)] text-[color:oklch(0.46_0.06_145)]",
    icon: Shield01Icon,
  },
  Disabled: {
    className:
      "border-[color:oklch(0.89_0.015_74)] bg-[color:oklch(0.97_0.008_80)] text-[color:oklch(0.42_0.024_39)]",
    icon: Shield01Icon,
  },
} as const;

function SortButton({
  active,
  children,
  direction,
  onClick,
}: {
  active: boolean;
  children: string;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-[color:oklch(0.97_0.008_80)]",
        active
          ? "text-[color:oklch(0.29_0.038_37)]"
          : "text-[color:oklch(0.49_0.024_39)]",
      )}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      <HugeiconsIcon
        className={cn(
          "transition",
          active && direction === "desc" ? "rotate-180" : "",
        )}
        icon={ArrowUpDownIcon}
        size={14}
        strokeWidth={1.8}
      />
    </button>
  );
}

function Badge({
  icon,
  label,
  tone,
}: {
  icon: typeof File01Icon;
  label: string;
  tone: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tone,
      )}
    >
      <HugeiconsIcon icon={icon} size={14} strokeWidth={1.8} />
      {label}
    </span>
  );
}

export function DocumentList({
  documents,
}: {
  documents: OwnerDocumentListItem[];
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, sortKey, sortDirection, pageSize]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredDocuments = documents.filter((document) => {
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      document.title,
      document.originalFilename,
      document.status,
      document.qrMode,
      document.isRevoked
        ? "revoked"
        : document.isEnabled
          ? "enabled"
          : "disabled",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sortedDocuments = [...filteredDocuments].sort((left, right) => {
    const directionFactor = sortDirection === "asc" ? 1 : -1;

    switch (sortKey) {
      case "title":
        return directionFactor * left.title.localeCompare(right.title);
      case "status":
        return directionFactor * left.status.localeCompare(right.status);
      case "scanCount":
        return directionFactor * (left.scanCount - right.scanCount);
      case "createdAt":
      default:
        return (
          directionFactor *
          (toTimestamp(left.createdAt) - toTimestamp(right.createdAt))
        );
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedDocuments.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedDocuments = sortedDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "title" ? "asc" : "desc");
  }

  const filteredCount = filteredDocuments.length;
  const rangeStart = filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredCount);

  return (
    <Card>
      <CardHeader className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.52_0.022_39)]">
              Library
            </p>
            <h2 className="mt-2 text-3xl text-[color:oklch(0.245_0.026_41)]">
              All documents
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[color:oklch(0.49_0.024_39)]">
              Search records, inspect lifecycle state, and jump straight into a
              document workspace from one protected owner-only table.
            </p>
          </div>
          <Link
            className={buttonVariants({ variant: "primary", size: "sm" })}
            href="/dashboard/documents/new"
          >
            New document
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem_12rem]">
          <label className="relative block">
            <HugeiconsIcon
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:oklch(0.55_0.022_40)]"
              icon={AiSearchIcon}
              size={18}
              strokeWidth={1.8}
            />
            <input
              className="h-11 w-full rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-white/88 pl-11 pr-4 text-sm text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition placeholder:text-[color:oklch(0.57_0.02_41)] focus:border-[color:oklch(0.78_0.03_49)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, filename, status, or access"
              type="search"
              value={query}
            />
          </label>

          <div className="rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,241,233,0.64))] px-4 py-3 text-sm text-[color:oklch(0.47_0.023_38)]">
            Showing{" "}
            <span className="font-semibold text-zinc-950">{rangeStart}</span> -{" "}
            <span className="font-semibold text-zinc-950">{rangeEnd}</span> of{" "}
            <span className="font-semibold text-zinc-950">{filteredCount}</span>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,241,233,0.64))] px-4 py-3 text-sm text-[color:oklch(0.47_0.023_38)]">
            <span>Rows per page</span>
            <select
              className="rounded-xl border border-[color:oklch(0.89_0.015_74)] bg-white px-3 py-2 text-sm text-zinc-950 outline-none"
              onChange={(event) =>
                setPageSize(
                  Number(
                    event.target.value,
                  ) as (typeof PAGE_SIZE_OPTIONS)[number],
                )
              }
              value={pageSize}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CardHeader>

      <CardContent>
        {documents.length === 0 ? (
          <div className="flex min-h-52 flex-col justify-center rounded-[1.8rem] border border-dashed border-[color:oklch(0.87_0.016_72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(245,239,230,0.5))] p-6">
            <p className="text-sm font-medium text-zinc-950">
              No documents yet.
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              Upload a PDF once, then return anytime to insert a QR or replace
              an existing one from the shared document workspace.
            </p>
          </div>
        ) : filteredCount === 0 ? (
          <div className="flex min-h-40 flex-col justify-center rounded-[1.8rem] border border-dashed border-[color:oklch(0.87_0.016_72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(245,239,230,0.5))] p-6">
            <p className="text-sm font-medium text-zinc-950">
              No documents match your search.
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              Try a different title, filename, status, or access term.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden overflow-hidden rounded-[1.8rem] border border-[color:oklch(0.89_0.015_74)] xl:block">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,241,233,0.76))]">
                    <tr className="border-b border-[color:oklch(0.9_0.012_74)]">
                      <th className="px-6 py-4 text-left">
                        <SortButton
                          active={sortKey === "title"}
                          direction={sortDirection}
                          onClick={() => toggleSort("title")}
                        >
                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon
                              icon={File01Icon}
                              size={14}
                              strokeWidth={1.8}
                            />
                            Document
                          </span>
                        </SortButton>
                      </th>
                      <th className="px-4 py-4 text-left">
                        <SortButton
                          active={sortKey === "status"}
                          direction={sortDirection}
                          onClick={() => toggleSort("status")}
                        >
                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon
                              icon={FileSyncIcon}
                              size={14}
                              strokeWidth={1.8}
                            />
                            Status
                          </span>
                        </SortButton>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:oklch(0.49_0.024_39)]">
                        <span className="inline-flex items-center gap-2">
                          <HugeiconsIcon
                            icon={Shield01Icon}
                            size={14}
                            strokeWidth={1.8}
                          />
                          Access
                        </span>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:oklch(0.49_0.024_39)]">
                        <HugeiconsIcon
                          icon={ViewIcon}
                          size={16}
                          strokeWidth={1.8}
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:oklch(0.49_0.024_39)]">
                        <HugeiconsIcon
                          icon={QrCodeScanIcon}
                          size={16}
                          strokeWidth={1.8}
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:oklch(0.49_0.024_39)]">
                        <HugeiconsIcon
                          icon={CheckmarkBadge02Icon}
                          size={16}
                          strokeWidth={1.8}
                        />
                      </th>
                      <th className="px-4 py-4 text-left">
                        <SortButton
                          active={sortKey === "createdAt"}
                          direction={sortDirection}
                          onClick={() => toggleSort("createdAt")}
                        >
                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon
                              icon={FileClockIcon}
                              size={14}
                              strokeWidth={1.8}
                            />
                            Created
                          </span>
                        </SortButton>
                      </th>
                      <th className="w-16 px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-[color:oklch(0.49_0.024_39)]">
                        Edit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.map((document) => {
                      const documentStatus =
                        documentStatusStyles[document.status] ??
                        documentStatusStyles.DRAFT;
                      const accessState = document.isRevoked
                        ? accessStateStyles.Revoked
                        : document.isEnabled
                          ? accessStateStyles.Enabled
                          : accessStateStyles.Disabled;
                      return (
                        <tr
                          className="border-b border-[color:oklch(0.92_0.01_74)] last:border-b-0 hover:bg-zinc-50"
                          key={document.publicId}
                        >
                          <td className="px-6 py-5 align-top">
                            <Link
                              className="inline-flex max-w-[22rem] items-start gap-3 text-zinc-950"
                              href={`/dashboard/documents/${document.publicId}`}
                            >
                              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[color:oklch(0.9_0.012_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,239,230,0.72))] text-[color:oklch(0.31_0.04_37)]">
                                <HugeiconsIcon
                                  icon={File01Icon}
                                  size={18}
                                  strokeWidth={1.8}
                                />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold hover:underline">
                                  {document.title}
                                </span>
                                <span className="mt-1 block truncate text-xs uppercase tracking-[0.16em] text-[color:oklch(0.5_0.024_38)]">
                                  {document.originalFilename}
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className="px-4 py-5 align-top">
                            <Badge
                              icon={documentStatus.icon}
                              label={documentStatus.label}
                              tone={documentStatus.className}
                            />
                          </td>
                          <td className="px-4 py-5 align-top">
                            <Badge
                              icon={accessState.icon}
                              label={
                                document.isRevoked
                                  ? "Revoked"
                                  : document.isEnabled
                                    ? "Enabled"
                                    : "Disabled"
                              }
                              tone={accessState.className}
                            />
                          </td>
                          <td className="px-4 py-5 align-top text-sm text-[color:oklch(0.46_0.023_39)]">
                            <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-zinc-950">
                              <HugeiconsIcon
                                icon={ViewIcon}
                                size={16}
                                strokeWidth={1.8}
                              />
                              <span className="font-semibold">
                                {document.scanCount}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-sm text-[color:oklch(0.46_0.023_39)]">
                            <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-zinc-950">
                              <HugeiconsIcon
                                icon={QrCodeScanIcon}
                                size={16}
                                strokeWidth={1.8}
                              />
                              <span className="font-semibold">
                                {document.openCount}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-sm text-[color:oklch(0.46_0.023_39)]">
                            <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-zinc-950">
                              <HugeiconsIcon
                                icon={CheckmarkBadge02Icon}
                                size={16}
                                strokeWidth={1.8}
                              />
                              <span className="font-semibold">
                                {document.downloadCount}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-sm text-[color:oklch(0.46_0.023_39)]">
                            {formatDate(document.createdAt)}
                          </td>
                          <td className="px-4 py-5 align-top text-right">
                            <Link
                              aria-label={`Manage ${document.title}`}
                              className={buttonVariants({
                                variant: "secondary",
                                size: "sm",
                                className: "h-10 w-10 rounded-2xl px-0",
                              })}
                              href={`/dashboard/documents/${document.publicId}`}
                              title={`Manage ${document.title}`}
                            >
                              <HugeiconsIcon
                                icon={Edit01Icon}
                                size={18}
                                strokeWidth={1.8}
                              />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 xl:hidden">
              {paginatedDocuments.map((document) => {
                const documentStatus =
                  documentStatusStyles[document.status] ??
                  documentStatusStyles.DRAFT;
                const accessState = document.isRevoked
                  ? accessStateStyles.Revoked
                  : document.isEnabled
                    ? accessStateStyles.Enabled
                    : accessStateStyles.Disabled;

                return (
                  <div
                    className="rounded-[1.6rem] border border-[color:oklch(0.89_0.015_74)] bg-white p-5"
                    key={document.publicId}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          className="block truncate text-base font-semibold text-zinc-950 hover:underline"
                          href={`/dashboard/documents/${document.publicId}`}
                        >
                          {document.title}
                        </Link>
                        <p className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-[color:oklch(0.5_0.024_38)]">
                          {document.originalFilename}
                        </p>
                      </div>
                      <Link
                        aria-label={`Manage ${document.title}`}
                        className={buttonVariants({
                          variant: "secondary",
                          size: "sm",
                          className: "h-10 w-10 shrink-0 rounded-2xl px-0",
                        })}
                        href={`/dashboard/documents/${document.publicId}`}
                        title={`Manage ${document.title}`}
                      >
                        <HugeiconsIcon
                          icon={Edit01Icon}
                          size={18}
                          strokeWidth={1.8}
                        />
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:oklch(0.89_0.015_74)] px-3 py-2 text-[color:oklch(0.46_0.023_39)]">
                        <HugeiconsIcon
                          icon={ViewIcon}
                          size={16}
                          strokeWidth={1.8}
                        />
                        <span className="font-semibold text-zinc-950">
                          {document.scanCount}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:oklch(0.89_0.015_74)] px-3 py-2 text-[color:oklch(0.46_0.023_39)]">
                        <HugeiconsIcon
                          icon={QrCodeScanIcon}
                          size={16}
                          strokeWidth={1.8}
                        />
                        <span className="font-semibold text-zinc-950">
                          {document.openCount}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:oklch(0.89_0.015_74)] px-3 py-2 text-[color:oklch(0.46_0.023_39)]">
                        <HugeiconsIcon
                          icon={CheckmarkBadge02Icon}
                          size={16}
                          strokeWidth={1.8}
                        />
                        <span className="font-semibold text-zinc-950">
                          {document.downloadCount}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-[color:oklch(0.46_0.023_39)]">
                      <p>
                        <span className="font-semibold text-zinc-950">
                          Created:
                        </span>{" "}
                        {formatDate(document.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-[color:oklch(0.9_0.012_74)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[color:oklch(0.49_0.024_39)]">
                Page{" "}
                <span className="font-semibold text-zinc-950">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-950">
                  {totalPages}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
