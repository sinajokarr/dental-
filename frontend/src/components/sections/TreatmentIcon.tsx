// Interim brand line illustrations for the treatment cards (brand renders replace them after DP1).
const paths = {
  implants: (
    <>
      <path d="M30 22c0-6 6-10 18-10s18 4 18 10c0 9-4 16-8 18H38c-4-2-8-9-8-18Z" />
      <path d="M42 40h12v6H42z" />
      <path d="M44 46h8l-1 34h-6z" />
      <path d="M41 52h14M41 59h14M42 66h12M43 73h10" />
    </>
  ),
  veneers: (
    <>
      <path d="M30 22c0-6 8-9 18-9s18 3 18 9c0 21-4 37-9 56-1 4-6 4-7 0l-2-13-2 13c-1 4-6 4-7 0-5-19-9-35-9-56Z" />
      <path d="M24 26c1-9 11-14 24-14" />
      <path d="M24 26c0 14 2 26 5 38" />
    </>
  ),
  smileDesign: (
    <>
      <path d="M16 44c9 15 20 22 32 22s23-7 32-22" />
      <path d="M22 45c8 6 17 9 26 9s18-3 26-9" />
      <path d="M36 52v6M44 53v7M52 53v7M60 52v6" />
      <path d="M70 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    </>
  ),
};

export function TreatmentIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className="size-20 fill-none stroke-blue-700 stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]">
      {paths[name]}
    </svg>
  );
}
