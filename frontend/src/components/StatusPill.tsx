type Tone = "amber" | "blue" | "green" | "red" | "neutral";

const TONES: Record<Tone, string> = {
  amber: "bg-ember-100 text-ember-600",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-basil-100 text-basil",
  red: "bg-red-100 text-red-600",
  neutral: "bg-black/5 text-ink/60",
};

/** Maps a few known backend status strings to a visual tone. Falls back to neutral. */
function toneForStatus(status: string): Tone {
  const s = status.toUpperCase();
  if (["CONFIRMED", "NEW", "PENDING"].includes(s)) return "blue";
  if (["PREPARING", "PENDING_PAYMENT"].includes(s)) return "amber";
  if (["READY", "PAID", "SUCCESS", "DELIVERED", "COMPLETED"].includes(s)) return "green";
  if (["CANCELLED", "FAILED", "REJECTED"].includes(s)) return "red";
  return "neutral";
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const tone = toneForStatus(status);
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${TONES[tone]}`}
    >
      {label ?? status.replaceAll("_", " ")}
    </span>
  );
}
