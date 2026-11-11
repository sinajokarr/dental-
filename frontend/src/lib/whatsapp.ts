// Click-to-chat link for the clinic's WhatsApp (WHATSAPP_TELEGRAM_INTEGRATION §A1). The patient sends; we only prefill.
export function waLink(text: string, number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""): string {
  if (!/^[1-9]\d{7,14}$/.test(number)) throw new Error(`WhatsApp number must be international digits only, got "${number}"`);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
