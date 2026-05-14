// Owns the shared application wordmark used across public and dashboard shells.
// Keeps naming and visual identity centralized for future route groups.
// Must remain presentational so it can be reused from Server Components by default.
export function AppWordmark() {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-[0.32em] text-zinc-500">
        Secure PDF QR
      </span>
      <span className="text-sm font-semibold tracking-tight text-zinc-950">
        Storage Platform
      </span>
    </div>
  );
}
