// Owns the loading skeleton for the audit log dashboard route.
// Preserves the page structure while owner-scoped audit data is fetched.
// Must not expose placeholder private data.
export default function AuditLogsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-zinc-200" />
        <div className="h-8 w-64 rounded bg-zinc-200" />
        <div className="h-4 w-full max-w-xl rounded bg-zinc-200" />
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="grid gap-3 border-b border-zinc-100 pb-5 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_11rem_10rem]"
              key={index}
            >
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-zinc-200" />
                <div className="h-3 w-56 rounded bg-zinc-100" />
              </div>
              <div className="h-4 w-32 rounded bg-zinc-100" />
              <div className="h-4 w-28 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
