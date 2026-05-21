export function extractMeetLink(event: { hangoutLink?: string | null; conferenceData?: { entryPoints?: Array<{ uri?: string | null }> } }) {
  return event.hangoutLink ?? event.conferenceData?.entryPoints?.find((entry) => entry.uri?.includes("meet.google.com"))?.uri ?? null;
}
