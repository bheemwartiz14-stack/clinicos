export function buildGoogleCalendarEvent(input: { summary: string; description?: string | null; startsAt: Date; endsAt: Date; location?: string | null; meet?: boolean }) {
  return {
    summary: input.summary,
    description: input.description ?? undefined,
    location: input.location ?? undefined,
    start: { dateTime: input.startsAt.toISOString() },
    end: { dateTime: input.endsAt.toISOString() },
    conferenceData: input.meet
      ? {
          createRequest: {
            requestId: `mediclinic-${input.startsAt.getTime()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      : undefined
  };
}
