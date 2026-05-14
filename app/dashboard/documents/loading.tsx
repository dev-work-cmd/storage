// Owns the document management index loading state.
// Preserves the list layout while owner-scoped records load.
// Must not show document metadata before authorization completes.
export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-zinc-200" />
        <div className="h-8 w-72 rounded bg-zinc-200" />
        <div className="h-4 w-full max-w-2xl rounded bg-zinc-200" />
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <div className="h-5 w-32 rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-full max-w-md rounded bg-zinc-100" />
        </div>
        <div className="divide-y divide-zinc-200 p-5">
          <div className="h-20 rounded bg-zinc-100" />
          <div className="h-20 rounded bg-zinc-100" />
          <div className="h-20 rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
