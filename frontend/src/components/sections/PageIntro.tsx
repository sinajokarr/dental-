import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Compact page header for inner pages without a hero visual: breadcrumb, H1, lead.
export async function PageIntro({ title, lead, current = title }: { title: string; lead?: string; current?: string }) {
  const page = await getTranslations("treatmentPage");
  return (
    <section aria-labelledby="page-title" className="bg-ice-50 pt-28 pb-12 lg:pt-36 lg:pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <nav aria-label={page("breadcrumb")} className="text-small text-slate-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-blue-700 hover:underline">
                {page("home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-navy-900">
              {current}
            </li>
          </ol>
        </nav>
        <h1 id="page-title" className="hero-rise mt-6 max-w-4xl font-display text-display font-light text-balance [--d:100ms]">
          {title}
        </h1>
        {lead && <p className="hero-rise mt-6 max-w-2xl text-lead text-slate-600 [--d:250ms]">{lead}</p>}
      </div>
    </section>
  );
}
