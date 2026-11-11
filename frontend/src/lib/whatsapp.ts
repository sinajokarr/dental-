// The clinic's one number: WhatsApp chat and phone calls (WHATSAPP_TELEGRAM_INTEGRATION §A1, D-062).
const clinic = () => process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

function checked(number: string): string {
  if (!/^[1-9]\d{7,14}$/.test(number)) throw new Error(`Phone number must be international digits only, got "${number}"`);
  return number;
}

/** Click-to-chat link; the patient sends, we only prefill. */
export function waLink(text: string, number = clinic()): string {
  return `https://wa.me/${checked(number)}?text=${encodeURIComponent(text)}`;
}

export const telLink = (number = clinic()): string => `tel:+${checked(number)}`;

/** "905427130132" → "+90 542 713 01 32"; any other number is shown as +digits. */
export const formatPhone = (number = clinic()): string =>
  checked(number).replace(/^(90)(\d{3})(\d{3})(\d{2})(\d{2})$/, "+$1 $2 $3 $4 $5").replace(/^(\d)/, "+$1");
