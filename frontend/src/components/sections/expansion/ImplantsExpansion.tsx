import { getMessages } from "next-intl/server";
import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import bridgePhoto from "../../../assets/photos/v7/full-arch-bridge.jpg";
import { Ask, Film, Frame, Steps, SubHeading } from "./parts";

type Support = { key: "graft" | "sinus"; title: string; lead: string; points: string[]; stages: string[] };

// V7 expansion of the implant page (D-091): advanced implantology after the page's own content, before the international
// band. Full arch (All-on-4 / All-on-6), single and multiple implants with the confirmed implant systems, immediate
// loading, and the supporting procedures (bone grafting, sinus lift). Short teaching films rendered for the site (D-092) and licensed photographs.
export async function ImplantsExpansion() {
  const { expansion } = await getMessages();
  const { implants } = expansion;
  const fa = implants.fullArch;
  const single = implants.single;
  const immediate = implants.immediate;
  const support = implants.support as Omit<typeof implants.support, "items"> & { items: Support[] };
  const ask = expansion.ask;

  return (
    <>
      <Section tone="ice" labelledBy="xp-implants-title">
        <SectionHeader id="xp-implants-title" eyebrow={implants.eyebrow} title={implants.title} lead={implants.lead} />

        <div className="xp-split mt-16 lg:mt-24" data-xp="full-arch">
          <div className="xp-arch">
            <div className="xp-film-pair">
              <Film name="fullarch" className="xp-four" />
              <Film name="fullarch6" className="xp-six" />
            </div>
            <Steps label={expansion.stage} steps={fa.stages} />
            <fieldset className="xp-controls">
              <legend className="text-small font-semibold text-navy-900">{fa.toggle}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {fa.concepts.map((concept, i) => (
                  <label key={concept.key} className="xp-chip">
                    <input type="radio" name="xp-full-arch" value={concept.key} defaultChecked={i === 0} className="sr-only" />
                    {concept.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="mt-4 text-small text-slate-600">{fa.caption}</p>
          </div>

          <div>
            <SubHeading id="xp-full-arch" label={fa.label} title={fa.title} lead={fa.lead} />
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              {fa.concepts.map((concept) => (
                <div key={concept.key} data-concept={concept.key} className="border-t border-sky-200 pt-5">
                  <dt className="text-h3 font-semibold">
                    {concept.label} <span className="font-normal text-slate-600">· {concept.title}</span>
                  </dt>
                  <dd className="mt-2 text-slate-600">{concept.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-navy-900">{fa.compare}</p>
            <h4 className="mt-10 text-h3 font-semibold">{fa.whoTitle}</h4>
            <ul className="mt-4 divide-y divide-sky-200 border-y border-sky-200">
              {fa.who.map((item) => (
                <li key={item} className="flex gap-4 py-4">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-6 shrink-0 fill-none stroke-blue-700 stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span className="text-navy-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h4 className="mt-20 text-h3 font-semibold">{fa.stepsTitle}</h4>
        <ol className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {fa.steps.map((step, i) => (
            <li key={step.title} data-reveal="" style={{ "--i": i } as CSSProperties} className="border-t border-sky-200 pt-6">
              <p className="eyebrow text-blue-700">0{i + 1}</p>
              <p className="mt-3 text-h3 font-semibold">{step.title}</p>
              <p className="mt-2 text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <article className="xp-card xp-card-media">
            <Frame src={bridgePhoto} sizes="(min-width: 64rem) 22rem, 92vw" className="xp-card-photo" />
            <div>
              <h4 className="text-h3 font-semibold">{fa.temporaryTitle}</h4>
              <p className="mt-3 text-slate-600">{fa.temporary}</p>
            </div>
          </article>
          <article className="xp-card">
            <h4 className="text-h3 font-semibold">{fa.limitsTitle}</h4>
            <p className="mt-3 text-slate-600">{fa.limits}</p>
          </article>
        </div>
        <Ask>{ask}</Ask>
      </Section>

      <Section labelledBy="xp-single">
        <div className="xp-split xp-split-photo">
          <Film name="implant" className="xp-film-single" />
          <div>
            <SubHeading id="xp-single" label={single.label} title={single.title} lead={single.lead} />
            <dl className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {single.points.map((point) => (
                <div key={point.title} className="border-t border-sky-200 pt-5">
                  <dt className="font-semibold text-navy-900">{point.title}</dt>
                  <dd className="mt-2 text-slate-600">{point.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="xp-brands mt-20">
          <div className="max-w-2xl">
            <h4 className="text-h3 font-semibold">{single.brandsTitle}</h4>
            <p className="mt-3 text-slate-600">{single.brandsLead}</p>
          </div>
          <ul className="xp-brand-list mt-10">
            {single.brands.map((brand) => (
              <li key={brand.name}>
                <span lang="en" className="xp-brand-name">
                  {brand.name}
                </span>
                <span className="xp-brand-origin">{brand.origin}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-small text-slate-600">{single.brandsNote}</p>
          <p className="xp-guarantee mt-10">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 fill-none stroke-blue-700 stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]">
              <path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>{single.guarantee}</span>
          </p>
        </div>
        <Ask>{ask}</Ask>
      </Section>

      <Section tone="ice" labelledBy="xp-immediate">
        <SubHeading id="xp-immediate" label={immediate.label} title={immediate.title} lead={immediate.lead} />
        <dl className="mt-12 grid gap-8 md:grid-cols-3">
          {immediate.kinds.map((kind, i) => (
            <div key={kind.title} className="xp-kind" data-kind={i}>
              <dt className="text-h3 font-semibold">{kind.title}</dt>
              <dd className="mt-3 text-slate-600">{kind.text}</dd>
            </div>
          ))}
        </dl>
        <h4 className="mt-20 text-h3 font-semibold">{immediate.timelineTitle}</h4>
        <ol className="xp-timeline mt-10" data-reveal="draw">
          {(immediate.timeline as { title: string; text: string; conditional?: boolean }[]).map((step, i) => (
            <li key={step.title} style={{ "--i": i } as CSSProperties} data-conditional={step.conditional ? "" : undefined}>
              <span aria-hidden="true" className="xp-node" />
              <p className="font-semibold text-navy-900">{step.title}</p>
              {step.conditional && <p className="xp-tag">{immediate.conditional}</p>}
              <p className="mt-1 text-small text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-3xl text-navy-900">{immediate.limits}</p>
        <Ask>{ask}</Ask>
      </Section>

      <Section labelledBy="xp-support">
        <SubHeading id="xp-support" label={support.label} title={support.title} lead={support.lead} />
        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-12">
          {support.items.map((item) => (
            <article key={item.key} aria-labelledby={`xp-${item.key}`} className="xp-support">
              <Film name={item.key} />
              <Steps label={expansion.stage} steps={item.stages} />
              <h4 id={`xp-${item.key}`} className="xp-h3 mt-8 font-display font-light">
                {item.title}
              </h4>
              <p className="mt-4 text-lead text-slate-600">{item.lead}</p>
              <ul className="mt-6 grid gap-3">
                {item.points.map((point) => (
                  <li key={point} className="xp-point">
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-10 text-small text-slate-600">{support.caption}</p>
        <p className="mt-6 max-w-3xl text-navy-900">{support.limits}</p>
        <Ask>{ask}</Ask>
      </Section>
    </>
  );
}
