// Owns the reusable article structure for public legal pages.
// Keeps legal copy readable and consistent across disclaimer, privacy, and terms.
// Must render static text only; no private document metadata belongs here.
import type { ReactNode } from "react";

type LegalSection = {
  title: string;
  body: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  description,
  sections,
}: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-b border-zinc-200 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          {description}
        </p>
      </header>

      <div className="divide-y divide-zinc-200">
        {sections.map((section) => (
          <section className="py-7" key={section.title}>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-700">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
