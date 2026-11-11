"use client";

import { useLocale } from "next-intl";
import { startTransition, useActionState, useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { LOCALE_NAMES } from "@/i18n/locale-names";
import type { ConsultationState, FormError } from "@/lib/lead-response";
import { CITIES, CONTACTS, LANGUAGES, TREATMENTS, readLead, validateLead, type ErrorCode, type FieldErrors, type LeadField } from "@/lib/validate-lead";
import { waLink } from "@/lib/whatsapp";
import { submitConsultation } from "./actions";

// The consultation request (LEAD_MANAGEMENT_AND_FORM_SPEC §2–5). Native controls, works without JavaScript
// (Server Action); with JavaScript it validates first, keeps focus where the visitor needs it and protects
// against double submits.
export type CountryOption = { code: string; name: string; dial: number };

/** Every word the form shows, translated on the server (LeadForm) so no message formatter ships to the browser. */
export type FormCopy = {
  title: string; fullName: string; country: string; choose: string; phone: string; phoneCode: string; treatment: string;
  treatments: Record<(typeof TREATMENTS)[number], string>; consent: ReactNode; consentShort: string; optional: string;
  contact: string; contacts: Record<(typeof CONTACTS)[number], string>; email: string; city: string;
  cities: Record<(typeof CITIES)[number], string>; language: string; message: string; messageHint: string; submit: string;
  sending: string; replyNote: string; summaries: string[]; retry: string; orWhatsapp: string;
  errors: Record<ErrorCode | FormError, string>; success: { title: string; reference: string; next: string; whatsapp: string };
  whatsappGeneral: string; whatsappAfterForm: string; // the latter contains {reference}
};

const ORDER: LeadField[] = ["full_name", "country", "phone", "treatment", "consent", "preferred_contact", "email", "preferred_city", "preferred_language", "message"];
const OPTIONAL = new Set<LeadField>(["preferred_contact", "email", "preferred_city", "preferred_language", "message"]);
const fieldId = (field: LeadField) => `lead-${field.replaceAll("_", "-")}`;

const LABEL = "block font-semibold text-navy-900";
const FIELD =
  "block min-h-13 rounded-sm border border-slate-500 bg-white px-4 text-navy-900 transition-colors " +
  "focus-visible:border-blue-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 aria-invalid:border-red-700";
const CONTROL = `${FIELD} mt-2 w-full`;
const CHOICE =
  "flex min-h-12 cursor-pointer items-center justify-center rounded-sm border border-slate-500 bg-white px-4 py-2 text-center text-small font-semibold " +
  "transition-colors has-checked:border-blue-700 has-checked:bg-sky-100 has-checked:text-blue-700 " +
  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-700";

export function ConsultationForm({ copy, countries, top, defaultTreatment = "" }: { copy: FormCopy; countries: CountryOption[]; top: CountryOption[]; defaultTreatment?: string }) {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(submitConsultation, { status: "idle" } as ConsultationState);
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLHeadingElement>(null);
  const submission = useRef<HTMLInputElement>(null);
  const submissionId = useRef("");
  const phoneCode = useRef<HTMLSelectElement>(null);
  const phoneCodeChosen = useRef(false);

  useEffect(() => {
    // One idempotency key per visitor, made in the browser (the page is prerendered for everyone), so
    // "Try again" never creates a second lead.
    // randomUUID needs a secure context (HTTPS, localhost); without it the server makes the key.
    if (submission.current) submission.current.value = submissionId.current ||= crypto.randomUUID?.() ?? "";
    if (state.status === "success") success.current?.focus();
    else if (state.status === "error") summary.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div data-lead-success="" className="glass-strong rounded-lg p-6 sm:p-10">
        <h3 ref={success} tabIndex={-1} className="font-display text-h2 font-light text-balance outline-none">
          {copy.success.title}
        </h3>
        <p className="mt-8 text-small text-slate-600">{copy.success.reference}</p>
        <p data-reference="" dir="ltr" className="mt-1 text-start text-h3 font-semibold tracking-[0.08em] text-navy-900">
          {state.reference}
        </p>
        <p className="mt-6 text-slate-600">{copy.success.next}</p>
        <a href={waLink(copy.whatsappAfterForm.replace("{reference}", state.reference))} target="_blank" rel="noopener" className={`mt-8 ${buttonClass("whatsapp", "md")}`}>
          <WhatsAppIcon className="size-5 text-[#128C4A]" />
          {copy.success.whatsapp}
        </a>
      </div>
    );
  }

  const errors: FieldErrors = clientErrors ?? (state.status === "error" ? (state.fieldErrors ?? {}) : {});
  const formError = !clientErrors && state.status === "error" ? state.formError : undefined;
  const values = state.status === "error" ? state.values : undefined; // React resets the form after an action
  const invalid = ORDER.filter((field) => errors[field]);
  const labels: Record<LeadField, string> = {
    full_name: copy.fullName, country: copy.country, phone: copy.phone, treatment: copy.treatment, consent: copy.consentShort,
    preferred_contact: copy.contact, email: copy.email, preferred_city: copy.city, preferred_language: copy.language, message: copy.message,
  };
  const aria = (field: LeadField, hint?: string) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": [errors[field] && `${fieldId(field)}-error`, hint].filter(Boolean).join(" ") || undefined,
  });
  const errorText = (field: LeadField) => {
    const code = errors[field];
    return (
      code && (
        <p id={`${fieldId(field)}-error`} className="mt-2 text-small font-medium text-red-700">
          {copy.errors[code]}
        </p>
      )
    );
  };

  // With JavaScript we dispatch the action ourselves: a form `action` submission makes React reset the form
  // afterwards, and a reset <select> does not return to the typed value. Without JavaScript the browser posts
  // the form to the same Server Action.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return; // no double submit
    const data = new FormData(event.currentTarget);
    const found = validateLead(readLead(data));
    if (Object.keys(found).length) {
      setClientErrors(found);
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setClientErrors(null);
    startTransition(() => formAction(data));
  }
  // While the browser-side errors are shown, each field is re-checked when the visitor leaves it.
  const recheck = (event: FocusEvent<HTMLFormElement>) => {
    const field = event.target;
    if (clientErrors && (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement))
      setClientErrors(validateLead(readLead(new FormData(event.currentTarget))));
  };
  const chooseCountry = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!phoneCodeChosen.current && phoneCode.current) phoneCode.current.value = event.target.value;
  };
  const jump = (field: LeadField) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(fieldId(field));
    target?.closest("details")?.setAttribute("open", "");
    target?.focus();
  };

  return (
    <form id="consultation-form" action={formAction} onSubmit={submit} onBlur={recheck} noValidate className="glass-strong relative rounded-lg p-6 sm:p-10">
      <h3 className="text-h3 font-semibold">{copy.title}</h3>

      {(invalid.length > 0 || formError) && (
        <div
          ref={summary}
          tabIndex={-1}
          data-error-summary=""
          role={formError ? "alert" : undefined}
          className="mt-6 rounded-md border border-red-700/40 bg-white p-5 outline-none focus-visible:outline-2 focus-visible:outline-red-700"
        >
          {formError ? (
            <>
              <p className="font-semibold text-red-700">{copy.errors[formError]}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                {formError !== "rate_limited" && (
                  <button type="submit" className={buttonClass("primary", "sm")}>
                    {copy.retry}
                  </button>
                )}
                <a href={waLink(copy.whatsappGeneral)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 underline-offset-4 hover:underline">
                  <WhatsAppIcon className="size-5 text-[#128C4A]" />
                  {copy.orWhatsapp}
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-red-700">{copy.summaries[invalid.length]}</p>
              <ul className="mt-3 grid gap-1">
                {invalid.map((field) => (
                  <li key={field}>
                    <a href={`#${fieldId(field)}`} onClick={jump(field)} className="text-small text-blue-700 underline underline-offset-4">
                      {labels[field]}: {copy.errors[errors[field]!]}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6">
        <div>
          <label htmlFor={fieldId("full_name")} className={LABEL}>
            {copy.fullName}
          </label>
          <input id={fieldId("full_name")} name="full_name" type="text" autoComplete="name" required maxLength={120} defaultValue={values?.full_name} className={CONTROL} {...aria("full_name")} />
          {errorText("full_name")}
        </div>

        <div>
          <label htmlFor={fieldId("country")} className={LABEL}>
            {copy.country}
          </label>
          <select id={fieldId("country")} name="country" autoComplete="country" required defaultValue={values?.country ?? ""} onChange={chooseCountry} className={CONTROL} {...aria("country")}>
            <option value="" disabled>
              {copy.choose}
            </option>
            {top.map((country) => (
              <option key={`top-${country.code}`} value={country.code}>
                {country.name}
              </option>
            ))}
            <option disabled>──────────</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errorText("country")}
        </div>

        <div>
          <label htmlFor={fieldId("phone")} className={LABEL}>
            {copy.phone}
          </label>
          <div dir="ltr" className="mt-2 flex gap-2">
            <select
              ref={phoneCode}
              name="phone_code"
              aria-label={copy.phoneCode}
              autoComplete="tel-country-code"
              defaultValue={values?.phone_code ?? ""}
              onChange={() => (phoneCodeChosen.current = true)}
              className={`${FIELD} w-28 shrink-0 px-3 sm:w-36`}
            >
              <option value="">+</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {`+${country.dial} ${country.name}`}
                </option>
              ))}
            </select>
            <input id={fieldId("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required defaultValue={values?.phone} className={`${FIELD} min-w-0 flex-1`} {...aria("phone")} />
          </div>
          {errorText("phone")}
        </div>

        <fieldset {...aria("treatment")}>
          <legend className={LABEL}>{copy.treatment}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {TREATMENTS.map((value, i) => (
              <label key={value} className={CHOICE}>
                <input
                  type="radio"
                  name="treatment"
                  value={value}
                  id={i === 0 ? fieldId("treatment") : undefined}
                  required
                  defaultChecked={(values?.treatment ?? defaultTreatment) === value}
                  className="sr-only"
                />
                {copy.treatments[value]}
              </label>
            ))}
          </div>
          {errorText("treatment")}
        </fieldset>

        <div>
          <div className="flex items-start gap-3">
            <input id={fieldId("consent")} name="consent" type="checkbox" required defaultChecked={values?.consent === "on"} className="mt-0.5 size-5 shrink-0 accent-blue-700" {...aria("consent")} />
            <label htmlFor={fieldId("consent")} className="text-small text-slate-600">
              {copy.consent}
            </label>
          </div>
          {errorText("consent")}
        </div>

        <details open={invalid.some((field) => OPTIONAL.has(field)) || undefined} className="group border-t border-sky-200 pt-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-blue-700 [&::-webkit-details-marker]:hidden">
            {copy.optional}
            <span aria-hidden="true" className="text-h3 font-light transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-4 grid gap-6">
            <fieldset>
              <legend className={LABEL}>{copy.contact}</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {CONTACTS.map((value) => (
                  <label key={value} className={CHOICE}>
                    <input type="radio" name="preferred_contact" value={value} defaultChecked={(values?.preferred_contact ?? "whatsapp") === value} className="sr-only" />
                    {copy.contacts[value]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={fieldId("email")} className={LABEL}>
                {copy.email}
              </label>
              <input id={fieldId("email")} name="email" type="email" autoComplete="email" dir="ltr" defaultValue={values?.email} className={`${CONTROL} text-start`} {...aria("email")} />
              {errorText("email")}
            </div>

            <fieldset>
              <legend className={LABEL}>{copy.city}</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {CITIES.map((value) => (
                  <label key={value} className={CHOICE}>
                    <input type="radio" name="preferred_city" value={value} defaultChecked={(values?.preferred_city ?? "no_preference") === value} className="sr-only" />
                    {copy.cities[value]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={fieldId("preferred_language")} className={LABEL}>
                {copy.language}
              </label>
              <select id={fieldId("preferred_language")} name="preferred_language" defaultValue={values?.preferred_language ?? locale} className={CONTROL}>
                {LANGUAGES.map((value) => (
                  <option key={value} value={value} lang={value}>
                    {LOCALE_NAMES[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={fieldId("message")} className={LABEL}>
                {copy.message}
              </label>
              <textarea id={fieldId("message")} name="message" rows={4} maxLength={1000} defaultValue={values?.message} className={`${CONTROL} py-3`} {...aria("message", "lead-message-hint")} />
              <p id="lead-message-hint" className="mt-2 text-small text-slate-600">
                {copy.messageHint}
              </p>
              {errorText("message")}
            </div>
          </div>
        </details>
      </div>

      {/* Honeypot (spec §6): invisible to people and assistive technology; bots fill it. */}
      <div aria-hidden="true" className="absolute -start-[200vw] top-0 size-px overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input ref={submission} type="hidden" name="submission_id" />
      <input type="hidden" name="locale" value={locale} />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" aria-busy={pending || undefined} className={`w-full sm:w-auto ${buttonClass("primary", "lg")}`}>
          {pending && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {copy.submit}
        </button>
        <p className="text-small text-slate-600">{copy.replyNote}</p>
      </div>
      <p aria-live="polite" className="sr-only">
        {pending ? copy.sending : ""}
      </p>
    </form>
  );
}
