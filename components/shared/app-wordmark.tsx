// Owns the shared application wordmark used across public and dashboard shells.
// Keeps naming and visual identity centralized for future route groups.
// Must remain presentational so it can be reused from Server Components by default.
export function AppWordmark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(236,223,205,0.78))] shadow-[0_14px_34px_-20px_rgba(96,62,34,0.85)]">
        <span className="font-heading text-lg font-semibold leading-none text-[color:oklch(0.32_0.066_32)]">
          SQ
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.68rem] uppercase tracking-[0.34em] text-[color:oklch(0.5_0.024_38)]">
          Secure PDF QR
        </span>
        <span className="font-heading text-lg font-semibold leading-none text-[color:oklch(0.245_0.026_41)]">
          Storage Platform
        </span>
      </div>
    </div>
  );
}
