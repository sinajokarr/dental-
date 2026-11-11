// Sections that exist but stay hidden until the client supplies verified content (D-028).
// Flip a flag only together with real, approved data — never with placeholders.
export const contentFlags = {
  medicalTeam: false, // Q2: dentists, credentials, photos
  technology: false, // Q4: real equipment list
  patientStories: false, // Q3: reviews with written consent
  aboutPage: false, // Q10: brand story
} as const;
