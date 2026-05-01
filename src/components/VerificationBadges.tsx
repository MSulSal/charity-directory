import type { VerificationBadge } from "@/types/charity";

interface VerificationBadgesProps {
  badges: VerificationBadge[];
}

const statusStyles: Record<string, string> = {
  verified: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  listed: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  "self-reported": "border-amber-500/40 bg-amber-500/15 text-amber-300",
  pending: "border-[var(--color-border)] bg-[var(--color-soft-panel-bg)] text-[var(--color-text-faint)]",
};

function statusLabel(status: VerificationBadge["status"]) {
  if (status === "self-reported") {
    return "Self-reported";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function VerificationBadges({ badges }: VerificationBadgesProps) {
  return (
    <section aria-label="Verification and trust fields" className="space-y-3">
      <h3 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
        Verification fields
      </h3>
      <ul className="space-y-2">
        {badges.map((badge) => (
          <li key={`${badge.source}-${badge.label}`} className="dark-panel-soft p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-strong)]">{badge.source}</span>
              <span
                className={`inline-flex border px-2 py-0.5 text-[11px] tracking-wide uppercase ${statusStyles[badge.status]}`}
              >
                {statusLabel(badge.status)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{badge.label}</p>
            {badge.note ? <p className="mt-1 text-xs text-[var(--color-text-faint)]">{badge.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
