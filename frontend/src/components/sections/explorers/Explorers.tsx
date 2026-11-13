"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import "../service-art/service-art.css";
import "./explorers.css";

// The three treatment-page explorers (D-082). Each wraps the treatment's finished studio render (server-rendered, passed
// as children) and adds one small, native control: buttons, a range input, checkboxes. No WebGL, no animation loop; the
// picture changes only through opacity and translate. Teaching illustrations, never a preview of a treatment result.
type Item = { key: string; title: string; text: string };

/** Implant: choose fixture, abutment or crown; the other parts step back and the chosen part is explained. */
export function ImplantAnatomy({ items, hint, children }: { items: Item[]; hint: string; children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const current = items.find((item) => item.key === active);
  return (
    <div className="ex" data-explorer="implants" data-active={active ?? undefined}>
      <div className="ex-art">{children}</div>
      <div className="ex-panel">
        <div role="group" aria-label={hint} className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button key={item.key} type="button" aria-pressed={active === item.key} onClick={() => setActive(active === item.key ? null : item.key)} className="ex-chip">
              {item.title}
            </button>
          ))}
        </div>
        <div aria-live="polite" className="ex-text">
          {current ? (
            <>
              <h3 className="text-h3 font-semibold">{current.title}</h3>
              <p className="mt-2 text-slate-600">{current.text}</p>
            </>
          ) : (
            <p className="text-slate-600">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Veneer: a native range input moves the thin shell between "apart" and "in place" on the front of the tooth. */
export function PorcelainLayers({ items, label, apart, seated, children }: { items: Item[]; label: string; apart: string; seated: string; children: ReactNode }) {
  const [value, setValue] = useState(100);
  const current = items[value < 60 ? 0 : 1];
  return (
    <div className="ex" data-explorer="veneers" style={{ "--p": value / 100 } as CSSProperties}>
      <div className="ex-art">{children}</div>
      <div className="ex-panel">
        <label className="block">
          <span className="font-semibold">{label}</span>
          <input type="range" min={0} max={100} value={value} onChange={(event) => setValue(Number(event.target.value))} aria-valuetext={value < 60 ? apart : seated} className="ex-range mt-4" />
        </label>
        <div aria-hidden="true" className="mt-1 flex justify-between text-small text-slate-600">
          <span>{apart}</span>
          <span>{seated}</span>
        </div>
        <div aria-live="polite" className="ex-text">
          <h3 className="text-h3 font-semibold">{current.title}</h3>
          <p className="mt-2 text-slate-600">{current.text}</p>
        </div>
      </div>
    </div>
  );
}

/** Smile design: each planning guide (midline, smile arc, proportions, gum line) is a checkbox with its explanation. */
export function SmileAnalysis({ items, hint, children }: { items: Item[]; hint: string; children: ReactNode }) {
  const [on, setOn] = useState<string[]>(items.slice(0, 2).map((item) => item.key));
  return (
    <div className="ex" data-explorer="smileDesign" data-guides={on.join(" ")}>
      <div className="ex-art">{children}</div>
      <fieldset className="ex-panel">
        <legend className="font-semibold">{hint}</legend>
        <ul className="mt-4 grid gap-3">
          {items.map((item) => (
            <li key={item.key}>
              <label className="ex-check">
                <input type="checkbox" checked={on.includes(item.key)} onChange={() => setOn(on.includes(item.key) ? on.filter((key) => key !== item.key) : [...on, item.key])} />
                <span>
                  <span className="font-semibold">{item.title}</span>
                  <span className="mt-1 block text-slate-600">{item.text}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}
