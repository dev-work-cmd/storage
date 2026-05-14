// Owns the dashboard loading state for nested dashboard route transitions.
// Preserves the page rhythm while server data streams in.
// Must stay lightweight and static.
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-lg border border-zinc-200 bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-32 rounded-lg border border-zinc-200 bg-white"
            key={index}
          />
        ))}
      </div>
      <div className="h-72 rounded-lg border border-zinc-200 bg-white" />
    </div>
  );
}
