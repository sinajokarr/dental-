"use client";

import { useRef } from "react";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";

type Href = "/dental-implants" | "/dental-veneers" | "/smile-design" | "/international-patients";

// Full-screen menu as a native modal <dialog>: focus trap, Escape and focus return come from the browser.
export function MobileMenu({
  labels,
  links,
  whatsappHref,
}: {
  labels: { menu: string; close: string; cta: string; whatsapp: string };
  links: { href: Href; title: string }[];
  whatsappHref: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className="flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 lg:hidden"
      >
        {labels.menu}
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
          <path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        aria-label={labels.menu}
        className="glass-strong m-0 h-dvh max-h-none w-full max-w-none rounded-none p-6 text-navy-900 backdrop:bg-navy-900/20"
      >
        <div className="flex h-full flex-col">
          <button
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="ms-auto flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
              <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <nav aria-label={labels.menu} className="mt-8">
            <ul className="grid gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={close} className="block py-3 font-display text-h2 font-light">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto grid gap-3">
            <Link href="/free-consultation" onClick={close} className={buttonClass("primary", "lg")}>
              {labels.cta}
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
              <WhatsAppIcon />
              {labels.whatsapp}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
