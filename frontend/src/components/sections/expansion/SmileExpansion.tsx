import Image from "next/image";
import { getMessages } from "next-intl/server";
import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import cadDesign from "../../../assets/photos/v7/cad-design.jpg";
import digitalScan from "../../../assets/photos/v7/digital-scan.jpg";
import milling from "../../../assets/photos/v7/milling.jpg";
import smile from "../../../assets/photos/v7/smile-gumline.jpg";
import ceramic from "../../../assets/treatments/crown/ceramic.png";
import design from "../../../assets/treatments/crown/design.png";
import scan from "../../../assets/treatments/crown/scan.png";
import tabs from "../../../assets/treatments/shades/tabs.png";
import shadeMeta from "../../../assets/treatments/shades/meta.json";
import { Ask, Frame, Layer, SubHeading } from "./parts";

// The shade marker glides from a darker to a lighter tab — a few steps, never to the end of the scale (no promise).
const FROM = 6, TO = 3;
const tabX = (i: number) => shadeMeta.tabs[i][0] / 10; // % of the render's width (the frame shows its full width)

// V7 expansion of the smile-design page (D-091): digital dentistry (CAD/CAM and the clinics' own laboratories), laser
// gum contouring and professional whitening, after the page's own content and before the international band.
export async function SmileExpansion() {
  const { expansion } = await getMessages();
  const { cadcam: cad, gum, whitening: white } = expansion.smileDesign;
  const ask = expansion.ask;
  const frames = [
    <Frame key="scan" src={digitalScan} sizes="(min-width: 64rem) 15rem, 70vw" position="62% 40%" className="xp-shot" />,
    <div key="model" className="xp-shot xp-shot-render">
      <Layer src={scan} sizes="(min-width: 64rem) 15rem, 70vw" />
    </div>,
    <Frame key="design" src={cadDesign} sizes="(min-width: 64rem) 15rem, 70vw" position="58% 45%" className="xp-shot" />,
    <Frame key="mill" src={milling} sizes="(min-width: 64rem) 15rem, 70vw" position="45% 50%" className="xp-shot" />,
    <div key="final" className="xp-shot xp-shot-render xp-crown" data-reveal="draw">
      <Layer src={design} sizes="(min-width: 64rem) 15rem, 70vw" className="xp-crown-design" />
      <Layer src={ceramic} sizes="(min-width: 64rem) 15rem, 70vw" className="xp-crown-ceramic" />
    </div>,
  ];

  return (
    <>
      <Section tone="ice" labelledBy="xp-smile-title">
        <SectionHeader id="xp-smile-title" eyebrow={expansion.smileDesign.eyebrow} title={expansion.smileDesign.title} lead={expansion.smileDesign.lead} />
        <div className="mt-16 lg:mt-24">
          <SubHeading id="xp-cadcam" label={cad.label} title={cad.title} lead={cad.lead} />
          <ol className="xp-strip mt-12" aria-labelledby="xp-cadcam">
            {cad.steps.map((step, i) => (
              <li key={step.title} data-reveal="" style={{ "--i": i } as CSSProperties}>
                <div aria-hidden="true">{frames[i]}</div>
                <p className="eyebrow mt-5 text-blue-700">0{i + 1}</p>
                <p className="mt-2 font-semibold text-navy-900">{step.title}</p>
                <p className="mt-1 text-small text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="xp-note mt-12">{cad.timing}</p>
          <p className="mt-4 text-small text-slate-600">{cad.caption}</p>
        </div>
        <Ask>{ask}</Ask>
      </Section>

      <Section labelledBy="xp-gum">
        <div className="xp-split xp-split-photo">
          <figure className="xp-gum">
            <Frame src={smile} sizes="(min-width: 64rem) 36rem, 92vw" className="xp-gum-photo">
              <svg viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="xp-guides" data-reveal="draw">
                <path pathLength={1} data-guide="lip" d="M200 515C380 450 560 395 700 368S980 240 1230 168" />
                <path pathLength={1} data-guide="arc" d="M300 600C450 595 600 570 720 548S950 425 1150 330" />
                <path pathLength={1} data-guide="ratio" d="M555 395H718V560H555Z" />
                <path pathLength={1} data-guide="ratio" d="M540 395V560M733 395V560" opacity="0.5" />
              </svg>
            </Frame>
            <figcaption>
              <ul className="xp-legend mt-5">
                {gum.guides.map((guide, i) => (
                  <li key={guide} data-guide={["lip", "arc", "ratio"][i]}>
                    {guide}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-small text-slate-600">{gum.caption}</p>
            </figcaption>
          </figure>
          <div>
            <SubHeading id="xp-gum" label={gum.label} title={gum.title} lead={gum.lead} />
            <dl className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {gum.points.map((point) => (
                <div key={point.title} className="border-t border-sky-200 pt-5">
                  <dt className="font-semibold text-navy-900">{point.title}</dt>
                  <dd className="mt-2 text-slate-600">{point.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-navy-900">{gum.limits}</p>
          </div>
        </div>
        <Ask>{ask}</Ask>
      </Section>

      <Section tone="ice" labelledBy="xp-whitening">
        <div className="xp-split xp-split-reverse">
          <div>
            <SubHeading id="xp-whitening" label={white.label} title={white.title} lead={white.lead} />
            <dl className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {white.points.map((point) => (
                <div key={point.title} className="border-t border-sky-200 pt-5">
                  <dt className="font-semibold text-navy-900">{point.title}</dt>
                  <dd className="mt-2 text-slate-600">{point.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure>
            <div aria-hidden="true" className="xp-shades" data-reveal="draw" style={{ "--from": tabX(FROM), "--to": tabX(TO) } as CSSProperties}>
              <Image src={tabs} alt="" fill sizes="(min-width: 64rem) 36rem, 92vw" quality={80} className="object-cover" />
              <div className="xp-shade-track">
                <span className="xp-shade-marker" />
              </div>
            </div>
            <figcaption className="mt-4 text-small text-slate-600">{white.scale}</figcaption>
          </figure>
        </div>
        <p className="xp-note mt-12">{white.expectation}</p>
        <Ask>{ask}</Ask>
      </Section>
    </>
  );
}
