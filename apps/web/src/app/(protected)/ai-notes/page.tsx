import { Activity, Bot, FileText, Sparkles } from "lucide-react";

const notes = [
  ["SOAP summary", "Priya Raman follow-up note generated", "Ready for review"],
  ["Visit transcript", "Dr. Brown consultation transcription", "Processing"],
  ["Billing suggestion", "Suggested follow-up invoice items", "Draft"],
];

export default function AiNotesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI Notes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review generated summaries, transcripts, and clinic automation insights.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Generated notes", "342", FileText],
          ["Automation saved", "30%", Sparkles],
          ["Pending review", "18", Activity],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label as string}</p>
              <Icon className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI Work Queue</h2>
            <p className="text-sm text-muted-foreground">
              Generated clinical tasks awaiting action.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {notes.map(([title, description, status]) => (
            <div key={title} className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
