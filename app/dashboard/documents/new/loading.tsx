// Owns the upload route loading state.
// Preserves the form layout shape while dashboard data and server components resolve.
// Must stay generic and avoid implying upload progress after submission.
export default function NewDocumentLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-36 rounded bg-zinc-200" />
        <div className="h-8 w-48 rounded bg-zinc-200" />
        <div className="h-4 w-full max-w-xl rounded bg-zinc-200" />
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <div className="h-5 w-32 rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-full max-w-lg rounded bg-zinc-200" />
        </div>
        <div className="space-y-5 p-5">
          <div className="h-11 rounded bg-zinc-100" />
          <div className="h-32 rounded bg-zinc-100" />
          <div className="h-10 w-32 rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
