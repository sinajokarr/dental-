import { notFound } from "next/navigation";

// Any unknown address inside a locale renders the localized not-found page with a 404 status.
export default function CatchAll() {
  notFound();
}
