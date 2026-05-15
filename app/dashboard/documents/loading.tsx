// Owns the documents page loading skeleton.
// Mirrors the premium dashboard layout so loading does not flash back to an older shape.
// Must not reveal document metadata before the owner-scoped query resolves.
export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <div className="hidden h-32 rounded-[2rem] border border-[#eadfd6] bg-white lg:block" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="h-28 rounded-[1.35rem] border border-[#eadfd6] bg-white"
            key={index}
          />
        ))}
      </div>

      <div className="rounded-[1.6rem] border border-[#eadfd6] bg-[#fcfaf8] p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_11rem_11rem_auto_auto]">
          <div className="h-12 rounded-[1rem] bg-white" />
          <div className="h-12 rounded-[1rem] bg-white" />
          <div className="h-12 rounded-[1rem] bg-white" />
          <div className="h-12 rounded-[1rem] bg-white" />
          <div className="h-12 rounded-[1rem] bg-white" />
        </div>
      </div>

      <div className="hidden rounded-[1.6rem] border border-[#eadfd6] bg-white lg:block">
        <div className="h-16 border-b border-[#eadfd6] bg-[#fcfaf8]" />
        <div className="space-y-px">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-24 bg-white" key={index} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-44 rounded-[1.6rem] border border-[#eadfd6] bg-white"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
