"use client";

// Owns the premium owner-facing document index experience.
// Provides client-side search, filtering, sorting, and pagination over safe owner document DTOs.
// Must not fetch or expose anything beyond the server-provided document metadata.
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import {
  ArrowUpDown,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Funnel,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  ScanQrCode,
  Search,
  Shield,
  ShieldOff,
  Table2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OwnerDocumentListItem } from "@/features/documents/server/get-owner-documents";
import { cn } from "@/lib/utils";

type SortKey = "createdAt" | "title" | "scanCount" | "status";
type SortDirection = "asc" | "desc";
type ViewMode = "table" | "cards";
type StatusFilter = "all" | "processed" | "pending" | "failed" | "disabled";
type AccessFilter =
  | "all"
  | "public"
  | "pin"
  | "limited"
  | "expires"
  | "disabled";

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
const SEARCH_DEBOUNCE_MS = 250;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getLifecycleState(document: OwnerDocumentListItem) {
  if (document.isRevoked || !document.isEnabled) {
    return {
      label: "Disabled",
      value: "disabled" as const,
      icon: ShieldOff,
      tone: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (document.status === "FAILED") {
    return {
      label: "Failed",
      value: "failed" as const,
      icon: TriangleAlert,
      tone: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (document.status === "PROCESSED") {
    return {
      label: "Processed",
      value: "processed" as const,
      icon: CheckCircle2,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "Pending",
    value: "pending" as const,
    icon: Clock3,
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  };
}

function getAccessState(document: OwnerDocumentListItem) {
  if (document.isRevoked || !document.isEnabled) {
    return {
      label: "Disabled",
      value: "disabled" as const,
      icon: ShieldOff,
      tone: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (document.requiresPin) {
    return {
      label: "PIN Protected",
      value: "pin" as const,
      icon: Shield,
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (document.maxAccessCount !== null) {
    return {
      label: `Limited (${document.maxAccessCount})`,
      value: "limited" as const,
      icon: Shield,
      tone: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  if (document.expiresAt) {
    return {
      label: `Expires ${new Date(document.expiresAt).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      })}`,
      value: "expires" as const,
      icon: CalendarDays,
      tone: "border-violet-200 bg-violet-50 text-violet-700",
    };
  }

  return {
    label: "Public",
    value: "public" as const,
    icon: Shield,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

function getWorkflowLabel(workflowType: OwnerDocumentListItem["workflowType"]) {
  if (workflowType === "INSERT_NEW_QR") {
    return { label: "Insert QR", icon: QrCode };
  }
  if (workflowType === "REPLACE_EXISTING_QR") {
    return { label: "Replace QR", icon: ScanQrCode };
  }
  return { label: "Stored only", icon: FileText };
}

function SortHeader({
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
        "inline-flex items-center gap-2 rounded-lg px-1 py-1 text-left text-[0.7rem] font-semibold uppercase tracking-[0.22em] transition",
        active ? "text-[#3e2a23]" : "text-[#8a776d] hover:text-[#3e2a23]",
      )}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      <ArrowUpDown
        className={cn(active && direction === "desc" ? "rotate-180" : "")}
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
  icon: LucideIcon;
  label: string;
  tone: string;
}) {
  const Icon = icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tone,
      )}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </span>
  );
}

/** Desktop stat card — full layout with icon + label + large number */
function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}) {
  const Icon = icon;

  return (
    <div className="rounded-[1.35rem] border border-[#eadfd6] bg-white px-4 py-4 shadow-[0_14px_34px_-28px_rgba(96,62,34,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
            tone,
          )}
        >
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a776d]">
            {label}
          </p>
          <p className="mt-2 text-3xl leading-none text-[#241915]">{value}</p>
        </div>
      </div>
    </div>
  );
}

/** Compact mobile stat tile — icon, number, label stacked */
function MobileStatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}) {
  const Icon = icon;

  return (
    <div className="flex min-w-0 flex-col items-center gap-1 rounded-[0.95rem] border border-[#eadfd6] bg-white px-2 py-2 text-center shadow-[0_6px_16px_-14px_rgba(96,62,34,0.16)]">
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-lg border",
          tone,
        )}
      >
        <Icon size={12} strokeWidth={1.9} />
      </span>
      <p className="text-base font-semibold leading-none text-[#241915]">
        {value}
      </p>
      <p className="line-clamp-2 text-[0.55rem] leading-tight uppercase tracking-[0.08em] text-[#8a776d]">
        {label}
      </p>
    </div>
  );
}

function DocumentActionsMenu({
  document,
}: {
  document: OwnerDocumentListItem;
}) {
  return (
    <details className="relative">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[0.95rem] border border-[#eadfd6] bg-white text-[#6e5d54] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:border-[#dbc8bb] hover:text-[#241915] [&::-webkit-details-marker]:hidden">
        <MoreHorizontal size={16} strokeWidth={1.8} />
      </summary>
      <div className="absolute right-0 top-12 z-20 w-52 rounded-[1rem] border border-[#eadfd6] bg-white p-2 shadow-[0_20px_50px_-26px_rgba(84,53,28,0.22)]">
        <Link
          className="flex items-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm text-[#4d3b34] transition hover:bg-[#f8f3ee]"
          href={`/dashboard/documents/${document.publicId}`}
        >
          <Pencil size={15} strokeWidth={1.8} />
          Edit document
        </Link>

        <Link
          className="flex items-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm text-[#4d3b34] transition hover:bg-[#f8f3ee]"
          href={`/api/dashboard/documents/${document.publicId}/original`}
          rel="noreferrer"
          target="_blank"
        >
          <FileText size={15} strokeWidth={1.8} />
          Open original PDF
        </Link>
        {document.status === "PROCESSED" ? (
          <Link
            className="flex items-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm text-[#4d3b34] transition hover:bg-[#f8f3ee]"
            href={`/api/dashboard/documents/${document.publicId}/processed`}
            rel="noreferrer"
            target="_blank"
          >
            <FileText size={15} strokeWidth={1.8} />
            Open processed PDF
          </Link>
        ) : null}
        <Link
          className="flex items-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm text-[#4d3b34] transition hover:bg-[#f8f3ee]"
          href="/dashboard/audit"
        >
          <BarChart3 size={15} strokeWidth={1.8} />
          Audit log
        </Link>
      </div>
    </details>
  );
}

export function DocumentList({
  documents,
}: {
  documents: OwnerDocumentListItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(routeQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuery(routeQuery);
  }, [routeQuery]);

  useEffect(() => {
    setPage(1);
  }, [
    deferredQuery,
    statusFilter,
    accessFilter,
    sortKey,
    sortDirection,
    pageSize,
  ]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const enrichedDocuments = documents.map((document) => ({
    ...document,
    access: getAccessState(document),
    lifecycle: getLifecycleState(document),
    workflow: getWorkflowLabel(document.workflowType),
  }));

  const totalDocuments = enrichedDocuments.length;
  const processedCount = enrichedDocuments.filter(
    (d) => d.lifecycle.value === "processed",
  ).length;
  const pendingCount = enrichedDocuments.filter(
    (d) => d.lifecycle.value === "pending",
  ).length;
  const disabledCount = enrichedDocuments.filter(
    (d) => d.access.value === "disabled",
  ).length;
  const totalScans = enrichedDocuments.reduce((sum, d) => sum + d.scanCount, 0);

  const filteredDocuments = enrichedDocuments.filter((document) => {
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            document.title,
            document.originalFilename,
            document.lifecycle.label,
            document.access.label,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    const matchesStatus =
      statusFilter === "all" || document.lifecycle.value === statusFilter;
    const matchesAccess =
      accessFilter === "all" || document.access.value === accessFilter;

    return matchesQuery && matchesStatus && matchesAccess;
  });

  const sortedDocuments = [...filteredDocuments].sort((left, right) => {
    const factor = sortDirection === "asc" ? 1 : -1;
    switch (sortKey) {
      case "title":
        return factor * left.title.localeCompare(right.title);
      case "scanCount":
        return factor * (left.scanCount - right.scanCount);
      case "status":
        return (
          factor * left.lifecycle.label.localeCompare(right.lifecycle.label)
        );
      case "createdAt":
      default:
        return (
          factor *
          (new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime())
        );
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedDocuments.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const shouldShowPagination = sortedDocuments.length > pageSize;
  const paginatedDocuments = sortedDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const rangeStart =
    sortedDocuments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, sortedDocuments.length);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((v) => (v === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === "title" ? "asc" : "desc");
  }

  function commitSearchQuery(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextValue.trim();

    if (trimmed.length > 0) {
      params.set("q", nextValue);
    } else {
      params.delete("q");
    }

    const href = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  useEffect(() => {
    if (query.trim() === routeQuery.trim()) {
      return;
    }

    const timer = window.setTimeout(() => {
      commitSearchQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [pathname, query, routeQuery, searchParams]);

  function clearFilters() {
    setQuery("");
    commitSearchQuery("");
    setStatusFilter("all");
    setAccessFilter("all");
  }

  const hasActiveFilters =
    query.length > 0 || statusFilter !== "all" || accessFilter !== "all";

  // How many page buttons to show (match screenshot: shows 1 2 3 with arrows)
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => i + 1,
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-visible rounded-[2rem] border-[#eadfd6] bg-white shadow-[0_28px_70px_-42px_rgba(84,53,28,0.22)]">
        <CardContent className="p-0">
          <div className="border-b border-[#eadfd6] px-5 py-6 lg:flex lg:items-start lg:justify-between lg:gap-4 lg:px-7 lg:py-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#8a776d]">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl leading-none text-[#241915] lg:text-4xl">
                All documents
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#7c6b63]">
                Review every PDF record, public access status, and scan outcome
                from one protected owner-only view.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 lg:mt-0">
              <Link
                className={buttonVariants({
                  variant: "primary",
                  className: "rounded-[1rem] px-5",
                })}
                href="/dashboard/documents/new"
              >
                <Plus size={18} strokeWidth={1.8} />
                New Document
              </Link>
            </div>
          </div>

          <div className="space-y-5 px-4 py-5 lg:px-7 lg:py-7">
            {/* ── Stats ───────────────────────────────────────── */}
            {/* Desktop: 5-col row */}
            <section className="hidden gap-3 xl:grid xl:grid-cols-5">
              <StatCard
                icon={FileText}
                label="Total documents"
                tone="border-[#eadfd6] bg-[#f8f3ee] text-[#743326]"
                value={totalDocuments.toLocaleString("en")}
              />
              <StatCard
                icon={CheckCircle2}
                label="Processed"
                tone="border-emerald-100 bg-emerald-50 text-emerald-700"
                value={processedCount.toLocaleString("en")}
              />
              <StatCard
                icon={Clock3}
                label="Pending"
                tone="border-amber-100 bg-amber-50 text-amber-700"
                value={pendingCount.toLocaleString("en")}
              />
              <StatCard
                icon={ShieldOff}
                label="Disabled"
                tone="border-red-100 bg-red-50 text-red-700"
                value={disabledCount.toLocaleString("en")}
              />
              <StatCard
                icon={Eye}
                label="Total scans"
                tone="border-[#eadfd6] bg-[#f7f4f1] text-[#6e5d54]"
                value={totalScans.toLocaleString("en")}
              />
            </section>
            {/* Tablet: 2-col grid */}
            <section className="hidden gap-3 sm:grid sm:grid-cols-2 xl:hidden">
              <StatCard
                icon={FileText}
                label="Total documents"
                tone="border-[#eadfd6] bg-[#f8f3ee] text-[#743326]"
                value={totalDocuments.toLocaleString("en")}
              />
              <StatCard
                icon={CheckCircle2}
                label="Processed"
                tone="border-emerald-100 bg-emerald-50 text-emerald-700"
                value={processedCount.toLocaleString("en")}
              />
              <StatCard
                icon={Clock3}
                label="Pending"
                tone="border-amber-100 bg-amber-50 text-amber-700"
                value={pendingCount.toLocaleString("en")}
              />
              <StatCard
                icon={ShieldOff}
                label="Disabled"
                tone="border-red-100 bg-red-50 text-red-700"
                value={disabledCount.toLocaleString("en")}
              />
              <StatCard
                icon={Eye}
                label="Total scans"
                tone="border-[#eadfd6] bg-[#f7f4f1] text-[#6e5d54]"
                value={totalScans.toLocaleString("en")}
              />
            </section>
            {/* Mobile: compact 3-col tile grid (matches screenshot) */}
            <section className="grid grid-cols-3 gap-1.5 sm:hidden">
              <MobileStatTile
                icon={FileText}
                label="Total"
                tone="border-[#eadfd6] bg-[#f8f3ee] text-[#743326]"
                value={totalDocuments.toLocaleString("en")}
              />
              <MobileStatTile
                icon={CheckCircle2}
                label="Processed"
                tone="border-emerald-100 bg-emerald-50 text-emerald-700"
                value={processedCount.toLocaleString("en")}
              />
              <MobileStatTile
                icon={Clock3}
                label="Pending"
                tone="border-amber-100 bg-amber-50 text-amber-700"
                value={pendingCount.toLocaleString("en")}
              />
              <MobileStatTile
                icon={ShieldOff}
                label="Disabled"
                tone="border-red-100 bg-red-50 text-red-700"
                value={disabledCount.toLocaleString("en")}
              />
              <MobileStatTile
                icon={Eye}
                label="Scans"
                tone="border-[#eadfd6] bg-[#f7f4f1] text-[#6e5d54]"
                value={totalScans.toLocaleString("en")}
              />
            </section>

            {/* ── Search / Filter bar ─────────────────────────── */}
            <section className="rounded-[1.6rem] border border-[#eadfd6] bg-[#fcfaf8] p-2.5 sm:p-3.5">
              <div className="space-y-2.5 md:hidden">
                <label className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a776d]"
                    size={16}
                    strokeWidth={1.9}
                  />
                  <input
                    className="h-11 w-full rounded-[0.95rem] border border-[#eadfd6] bg-white pl-10 pr-4 text-sm text-[#241915] outline-none transition placeholder:text-[#9a8b84] focus:border-[#d7c3b6]"
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search documents by title or filename..."
                    type="search"
                    value={query}
                  />
                </label>

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-2">
                  <select
                    className="h-10 min-w-0 rounded-[0.95rem] border border-[#eadfd6] bg-white px-3 text-xs text-[#3e2a23] outline-none"
                    onChange={(e) =>
                      setStatusFilter(e.target.value as StatusFilter)
                    }
                    value={statusFilter}
                  >
                    <option value="all">All status</option>
                    <option value="processed">Processed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="disabled">Disabled</option>
                  </select>

                  <select
                    className="h-10 min-w-0 rounded-[0.95rem] border border-[#eadfd6] bg-white px-3 text-xs text-[#3e2a23] outline-none"
                    onChange={(e) =>
                      setAccessFilter(e.target.value as AccessFilter)
                    }
                    value={accessFilter}
                  >
                    <option value="all">All access</option>
                    <option value="public">Public</option>
                    <option value="pin">PIN Protected</option>
                    <option value="limited">Limited</option>
                    <option value="expires">Expires</option>
                    <option value="disabled">Disabled</option>
                  </select>

                  <button
                    aria-label={hasActiveFilters ? "Clear filters" : "Filters"}
                    className={buttonVariants({
                      variant: "secondary",
                      className: "h-10 w-10 rounded-[0.95rem] px-0",
                    })}
                    onClick={clearFilters}
                    title={hasActiveFilters ? "Clear filters" : "Filters"}
                    type="button"
                  >
                    <Funnel size={16} strokeWidth={1.9} />
                  </button>

                  <div className="grid h-10 grid-cols-2 gap-1.5 rounded-[0.95rem] border border-[#eadfd6] bg-white p-1">
                    <button
                      aria-label="Table view"
                      className={cn(
                        "inline-flex items-center justify-center rounded-[0.7rem] transition",
                        viewMode === "table"
                          ? "bg-[#f8f3ee] text-[#241915]"
                          : "text-[#8a776d]",
                      )}
                      onClick={() => setViewMode("table")}
                      type="button"
                    >
                      <Table2 size={16} strokeWidth={1.9} />
                    </button>
                    <button
                      aria-label="Cards view"
                      className={cn(
                        "inline-flex items-center justify-center rounded-[0.7rem] transition",
                        viewMode === "cards"
                          ? "bg-[#f8f3ee] text-[#241915]"
                          : "text-[#8a776d]",
                      )}
                      onClick={() => setViewMode("cards")}
                      type="button"
                    >
                      <LayoutGrid size={16} strokeWidth={1.9} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:grid md:grid-cols-[minmax(0,1fr)_9rem_9rem_auto_auto] lg:grid-cols-[minmax(0,1fr)_10rem_10rem_auto_auto]">
                <label className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a776d]"
                    size={16}
                    strokeWidth={1.9}
                  />
                  <input
                    className="h-10 w-full rounded-[0.95rem] border border-[#eadfd6] bg-white pl-10 pr-4 text-sm text-[#241915] outline-none transition placeholder:text-[#9a8b84] focus:border-[#d7c3b6]"
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search documents by title or filename..."
                    type="search"
                    value={query}
                  />
                </label>

                <select
                  className="h-10 min-w-0 rounded-[0.95rem] border border-[#eadfd6] bg-white px-3 text-xs text-[#3e2a23] outline-none lg:text-sm"
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  value={statusFilter}
                >
                  <option value="all">All status</option>
                  <option value="processed">Processed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="disabled">Disabled</option>
                </select>

                <select
                  className="h-10 min-w-0 rounded-[0.95rem] border border-[#eadfd6] bg-white px-3 text-xs text-[#3e2a23] outline-none lg:text-sm"
                  onChange={(e) =>
                    setAccessFilter(e.target.value as AccessFilter)
                  }
                  value={accessFilter}
                >
                  <option value="all">All access</option>
                  <option value="public">Public</option>
                  <option value="pin">PIN Protected</option>
                  <option value="limited">Limited</option>
                  <option value="expires">Expires</option>
                  <option value="disabled">Disabled</option>
                </select>

                <button
                  aria-label={hasActiveFilters ? "Clear filters" : "Filters"}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "h-10 w-10 rounded-[0.95rem] px-0",
                  })}
                  onClick={clearFilters}
                  title={hasActiveFilters ? "Clear filters" : "Filters"}
                  type="button"
                >
                  <Funnel size={16} strokeWidth={1.9} />
                </button>

                <div className="grid h-10 grid-cols-2 gap-1.5 rounded-[0.95rem] border border-[#eadfd6] bg-white p-1">
                  <button
                    aria-label="Table view"
                    className={cn(
                      "inline-flex items-center justify-center rounded-[0.7rem] transition",
                      viewMode === "table"
                        ? "bg-[#f8f3ee] text-[#241915]"
                        : "text-[#8a776d]",
                    )}
                    onClick={() => setViewMode("table")}
                    type="button"
                  >
                    <Table2 size={16} strokeWidth={1.9} />
                  </button>
                  <button
                    aria-label="Cards view"
                    className={cn(
                      "inline-flex items-center justify-center rounded-[0.7rem] transition",
                      viewMode === "cards"
                        ? "bg-[#f8f3ee] text-[#241915]"
                        : "text-[#8a776d]",
                    )}
                    onClick={() => setViewMode("cards")}
                    type="button"
                  >
                    <LayoutGrid size={16} strokeWidth={1.9} />
                  </button>
                </div>
              </div>
            </section>

            {/* ── Empty states ────────────────────────────────── */}
            {documents.length === 0 ? (
              <div className="rounded-[1.8rem] border border-dashed border-[#eadfd6] bg-[#fcfaf8] px-6 py-10 text-center">
                <p className="text-lg text-[#241915]">No documents yet.</p>
                <p className="mt-2 text-sm text-[#7c6b63]">
                  Upload your first PDF to start storing documents and managing
                  QR workflows.
                </p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="rounded-[1.8rem] border border-dashed border-[#eadfd6] bg-[#fcfaf8] px-6 py-10 text-center">
                <p className="text-lg text-[#241915]">No matching documents.</p>
                <p className="mt-2 text-sm text-[#7c6b63]">
                  Adjust the search term or filters to see more results.
                </p>
              </div>
            ) : (
              <>
                {/* ── Desktop table (lg+, table mode) ────────── */}
                {viewMode === "table" && (
                  <div className="hidden lg:block">
                    <div className="rounded-[1.6rem] border border-[#eadfd6] bg-white">
                      <div className="overflow-x-auto rounded-[1.6rem]">
                        <table className="w-full table-fixed">
                          <colgroup>
                            <col className="w-[32%]" />
                            <col className="w-[13%]" />
                            <col className="w-[18%]" />
                            <col className="w-[9%]" />
                            <col className="w-[14%]" />
                            <col className="w-[14%]" />
                          </colgroup>
                          <thead className="border-b border-[#eadfd6] bg-[#fcfaf8]">
                            <tr>
                              <th className="px-6 py-4 text-left">
                                <SortHeader
                                  active={sortKey === "title"}
                                  direction={sortDirection}
                                  onClick={() => toggleSort("title")}
                                >
                                  Document
                                </SortHeader>
                              </th>
                              <th className="px-4 py-4 text-left">
                                <SortHeader
                                  active={sortKey === "status"}
                                  direction={sortDirection}
                                  onClick={() => toggleSort("status")}
                                >
                                  Status
                                </SortHeader>
                              </th>
                              <th className="px-4 py-4 text-left text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#8a776d]">
                                Access
                              </th>
                              <th className="px-4 py-4 text-left">
                                <SortHeader
                                  active={sortKey === "scanCount"}
                                  direction={sortDirection}
                                  onClick={() => toggleSort("scanCount")}
                                >
                                  Scans
                                </SortHeader>
                              </th>
                              <th className="px-4 py-4 text-left">
                                <SortHeader
                                  active={sortKey === "createdAt"}
                                  direction={sortDirection}
                                  onClick={() => toggleSort("createdAt")}
                                >
                                  Created
                                </SortHeader>
                              </th>
                              <th className="px-4 py-4 text-left text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#8a776d]">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedDocuments.map((document) => (
                              <tr
                                className="border-b border-[#f0e7e0] last:border-b-0 hover:bg-[#fdfbf9]"
                                key={document.publicId}
                              >
                                {/* Document */}
                                <td className="px-6 py-5 align-top">
                                  <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[1rem] border border-[#f0e7e0] bg-[#fff7f3]">
                                      <FileText size={18} strokeWidth={1.8} />
                                      <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#d34d3f]">
                                        PDF
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <Link
                                        className="block truncate text-sm font-semibold text-[#241915] hover:underline"
                                        href={`/dashboard/documents/${document.publicId}`}
                                      >
                                        {document.title}
                                      </Link>
                                      <p className="mt-1 truncate text-sm text-[#7c6b63]">
                                        {document.originalFilename}
                                      </p>
                                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8a776d]">
                                        <document.workflow.icon
                                          size={13}
                                          strokeWidth={1.8}
                                        />
                                        <span>{document.workflow.label}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                {/* Status */}
                                <td className="px-4 py-5 align-top">
                                  <Badge
                                    icon={document.lifecycle.icon}
                                    label={document.lifecycle.label}
                                    tone={document.lifecycle.tone}
                                  />
                                </td>
                                {/* Access */}
                                <td className="px-4 py-5 align-top">
                                  <Badge
                                    icon={document.access.icon}
                                    label={document.access.label}
                                    tone={document.access.tone}
                                  />
                                </td>
                                {/* Scans */}
                                <td className="px-4 py-5 text-center align-top">
                                  <span className="font-medium text-[#241915]">
                                    {document.scanCount}
                                  </span>
                                </td>
                                {/* Created */}
                                <td className="px-4 py-5 align-top">
                                  <p className="text-sm font-medium text-[#241915]">
                                    {formatDate(document.createdAt)}
                                  </p>
                                  <p className="mt-1 text-sm text-[#7c6b63]">
                                    {formatTime(document.createdAt)}
                                  </p>
                                </td>
                                {/* Actions */}
                                <td className="px-4 py-5 align-top">
                                  <DocumentActionsMenu document={document} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Mobile / cards view ──────────────────────── */}
                <div
                  className={cn(
                    viewMode === "table" ? "grid lg:hidden" : "grid",
                    "gap-3",
                  )}
                >
                  {paginatedDocuments.map((document) => (
                    <div
                      className="rounded-[1.6rem] border border-[#eadfd6] bg-white p-4 shadow-[0_14px_34px_-28px_rgba(96,62,34,0.16)]"
                      key={document.publicId}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[0.9rem] border border-[#f0e7e0] bg-[#fff7f3]">
                          <FileText size={16} strokeWidth={1.8} />
                          <span className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-[#d34d3f]">
                            PDF
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                className="block truncate text-sm font-semibold text-[#241915] hover:underline"
                                href={`/dashboard/documents/${document.publicId}`}
                              >
                                {document.title}
                              </Link>
                              <p className="mt-0.5 text-xs text-[#8a776d]">
                                {formatDate(document.createdAt)} &bull;{" "}
                                {formatTime(document.createdAt)}
                              </p>
                            </div>
                            <DocumentActionsMenu document={document} />
                          </div>
                          <p className="mt-1.5 truncate max-w-40 text-xs text-[#9a8b84]">
                            {document.originalFilename}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge
                          icon={document.lifecycle.icon}
                          label={document.lifecycle.label}
                          tone={document.lifecycle.tone}
                        />
                        <Badge
                          icon={document.access.icon}
                          label={document.access.label}
                          tone={document.access.tone}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#f0e7e0] pt-3">
                        <div className="inline-flex items-center gap-1.5 text-sm text-[#4d3b34]">
                          <Eye size={15} strokeWidth={1.8} />
                          <span className="font-semibold text-[#241915]">
                            {document.scanCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Pagination ──────────────────────────────────── */}
            {shouldShowPagination ? (
              <div className="flex flex-col gap-4 border-t border-[#eadfd6] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#7c6b63]">
                  Showing {rangeStart} to {rangeEnd} of {sortedDocuments.length}{" "}
                  results
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex items-center gap-3 rounded-[1rem] border border-[#eadfd6] bg-white px-4 py-2 text-sm text-[#6e5d54]">
                    <span>Rows per page</span>
                    <select
                      className="bg-transparent text-[#241915] outline-none"
                      onChange={(e) =>
                        setPageSize(
                          Number(
                            e.target.value,
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

                  <div className="flex items-center gap-2">
                    <button
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                        className: "rounded-[1rem] px-4",
                      })}
                      disabled={currentPage <= 1}
                      onClick={() => setPage((v) => Math.max(1, v - 1))}
                      type="button"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                      {visiblePages.map((pageNumber) => (
                        <button
                          className={cn(
                            "inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border text-sm font-medium transition",
                            pageNumber === currentPage
                              ? "border-[#743326] bg-[#743326] text-white shadow-[0_8px_20px_-10px_rgba(116,51,38,0.55)]"
                              : "border-[#eadfd6] bg-white text-[#5f4b42] hover:border-[#d4c0b2]",
                          )}
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          type="button"
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                        className: "rounded-[1rem] px-4",
                      })}
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((v) => Math.min(totalPages, v + 1))
                      }
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
