// Owns the document preview loading state.
// Preserves preview controls and canvas space while metadata and auth checks resolve.
// Must avoid showing private document details before authorization completes.
export default function DocumentPreviewLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-32 rounded bg-zinc-200" />
        <div className="h-8 w-64 rounded bg-zinc-200" />
        <div className="h-4 w-full max-w-2xl rounded bg-zinc-200" />
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="grid gap-3 border-b border-zinc-200 p-5 sm:grid-cols-3">
          <div className="h-12 rounded bg-zinc-100" />
          <div className="h-12 rounded bg-zinc-100" />
          <div className="h-12 rounded bg-zinc-100" />
        </div>
        <div className="space-y-4 p-5">
          <div className="h-16 rounded-lg border border-zinc-200 bg-zinc-50" />
          <div className="h-[32rem] rounded-lg border border-zinc-200 bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
