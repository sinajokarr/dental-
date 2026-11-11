"use client";

import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";

// Mobile-only bar (AN-22): appears once the first section has scrolled away, hides while the consultation
// form is on screen or the keyboard is up (a field has focus).
export function StickyCta({ cta, whatsapp, whatsappHref }: { cta: string; whatsapp: string; whatsappHref: string }) {
  const [heroInView, setHeroInView] = useState(true);
  const [formInView, setFormInView] = useState(false);
  const [typing, setTyping] = useState(false);
  const [hasForm, setHasForm] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("main section");
    const form = document.getElementById("consultation");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the page structure is only known in the browser
    setHasForm(!!form);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroInView(entry.isIntersecting);
        if (entry.target === form) setFormInView(entry.isIntersecting);
      }
    });
    if (hero) observer.observe(hero);
    if (form) observer.observe(form);
    const focusIn = (event: FocusEvent) => setTyping((event.target as Element).matches?.("input, textarea, select") ?? false);
    const focusOut = () => setTyping(false);
    document.addEventListener("focusin", focusIn);
    document.addEventListener("focusout", focusOut);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", focusIn);
      document.removeEventListener("focusout", focusOut);
    };
  }, []);

  const visible = !heroInView && !formInView && !typing;
  const ctaClass = `flex-[3] ${buttonClass("primary", "md")}`;

  return (
    <div
      data-sticky-cta
      data-visible={visible || undefined}
      className="glass-nav fixed inset-x-0 bottom-0 z-40 flex gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[translate,visibility] duration-300 ease-out not-data-visible:invisible not-data-visible:translate-y-full lg:hidden"
    >
      <a href={whatsappHref} target="_blank" rel="noopener" className={`flex-[2] ${buttonClass("whatsapp", "md")}`}>
        <WhatsAppIcon className="size-5 text-[#128C4A]" />
        {whatsapp}
      </a>
      {hasForm ? (
        <a href="#consultation" className={ctaClass}>
          {cta}
        </a>
      ) : (
        <Link href="/free-consultation" className={ctaClass}>
          {cta}
        </Link>
      )}
    </div>
  );
}
