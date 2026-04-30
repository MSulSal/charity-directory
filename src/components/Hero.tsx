import { AudienceActionChips } from "@/components/AudienceActionChips";
import { SearchBar } from "@/components/SearchBar";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border-soft)] bg-[#09070e] text-[var(--color-text-strong)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,10,18,0.4)_0%,rgba(9,7,14,0.95)_68%)]" />
        <div className="absolute -top-28 left-1/2 h-64 w-64 -translate-x-1/2 bg-[radial-gradient(circle,rgba(140,107,196,0.2)_0%,rgba(140,107,196,0)_72%)]" />
        <div className="absolute right-[10%] top-14 h-40 w-40 bg-[radial-gradient(circle,rgba(229,106,166,0.1)_0%,rgba(229,106,166,0)_75%)]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="max-w-4xl space-y-5">
          <p className="text-xs tracking-[0.18em] text-[var(--color-soft-amethyst)] uppercase">
            Premium nonprofit discovery
          </p>
          <h1 className="font-semibold text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Find trusted charities by cause, location, and ways to help.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[var(--color-text-muted)]">
            Charity Directory helps donors, volunteers, companies, and people seeking support discover verified nonprofits, donation links, volunteer opportunities, contact details, and service areas in one place.
          </p>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-faint)]">
            Find verified nonprofits, donation links, contact details, service areas, and ways to help - all in one place.
          </p>
        </div>

        <SearchBar actionPath="/charities" className="dark-panel border-[var(--color-border)]" />

        <div className="space-y-4">
          <p className="text-xs tracking-[0.15em] text-[var(--color-text-faint)] uppercase">Ways to act now</p>
          <AudienceActionChips />
        </div>

        <p className="max-w-4xl border-l-2 border-[var(--color-saffron)] pl-4 text-sm leading-7 text-[var(--color-text-muted)]">
          We organize charity information so visitors can focus on helping - not hunting for donation pages, contact details, or verification signals.
        </p>
      </div>
    </section>
  );
}
