import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Show } from "@clerk/react";

const appDownloadUrl = import.meta.env.VITE_APP_DOWNLOAD_URL as string | undefined;

export default function Header({ overlay = false }: { overlay?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopPromptOpen, setShopPromptOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      let count = 0;
      interval = setInterval(() => {
        count += 1;
        setCartCount(count);
        if (count >= 100 && interval !== undefined) clearInterval(interval);
      }, 50);
    }, 900);

    return () => {
      clearTimeout(timeout);
      if (interval !== undefined) clearInterval(interval);
    };
  }, []);

  return (
    <header className={`${overlay
      ? "fixed left-2 right-2 top-2 z-30 rounded-2xl bg-transparent px-2 pb-4 pt-3 text-white sm:left-4 sm:right-4 sm:top-4 sm:px-4 sm:pb-5 sm:pt-4"
      : "relative z-30 rounded-2xl bg-brand-orange px-2 pb-5 pt-4 text-white sm:px-4 sm:pb-7 sm:pt-5"} animate-header-drop motion-reduce:animate-none`}>
      <div className="mx-auto max-w-7xl">
        <div className="-mx-2 mb-2 overflow-hidden rounded-lg bg-brand-ink px-2 py-1 text-[9px] font-medium text-white sm:mx-0 sm:mb-3 sm:rounded-xl sm:px-3 sm:text-[11px]" aria-label="Same-day delivery for Lagos orders. Nationwide delivery. Save every day.">
          <p className="animate-[ticker-slide_24s_linear_infinite] whitespace-nowrap motion-reduce:animate-none">
            Same-day delivery for Lagos orders <span className="mx-3 text-brand-orange">•</span>
            Shop from a variety of stores close to you in one go <span className="mx-3 text-brand-orange">•</span>
            Join our programs to earn today <span className="mx-3 text-brand-orange">•</span>
            Nationwide delivery. Save every day.
          </p>
        </div>

        <div className="relative flex h-14 items-center justify-between rounded-xl bg-brand-orange px-3 sm:h-[68px] sm:rounded-2xl sm:px-5">
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
          </button>
          <span aria-hidden="true" className="absolute left-14 top-1/2 h-12 w-px -translate-y-1/2 bg-white/60 sm:left-[72px] sm:h-10" />

          <Link to="/" aria-label="Go-Shopper home" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-white">
            <img className="h-8 w-8 object-contain sm:h-10 sm:w-10" src="/images/goshopper-bag.svg" alt="" />
            <span className="text-base font-bold tracking-tight sm:text-xl">Go-Shopper</span>
          </Link>
            
          <div className="ml-auto flex items-center gap-2">

            <span aria-hidden="true" className="absolute right-14 top-1/2 h-12 w-px -translate-y-1/2 bg-white/60 sm:left-[72px] sm:h-10" />
            <Show when="signed-in">
              <Link className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 sm:inline-flex" to="/application/status">My applications</Link>
            </Show>
            <Show when="signed-out">
              <Link className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 sm:inline-flex" to="/sign-in">Sign in</Link>
            </Show>
            <button
              type="button"
              aria-label="Shopping bag. Open app information."
              onClick={() => setShopPromptOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l1 13H4L5 8Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold leading-none text-brand-orange">{cartCount}{cartCount >= 100 ? "+" : ""}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute left-2 right-2 top-full mt-1 grid gap-1 rounded-xl border border-stone-200 bg-white p-3 text-sm shadow-xl sm:left-4 sm:right-4 sm:max-w-xs">
            <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/#how">How it works</a>
            <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/#partners">For supermarkets</a>
            <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/#riders">For riders</a>
            <Link onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-stone-100" to="/application/status">Application status</Link>
            <Show when="signed-out">
              <Link onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-stone-100" to="/sign-in">Sign in / Register</Link>
            </Show>
          </div>
        )}
      </div>

      {shopPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-5" onClick={() => setShopPromptOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="shop-prompt-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 text-center text-brand-ink shadow-2xl sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-brand-orange">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-current stroke-[1.8]"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l1 13H4L5 8Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
            </div>
            <h2 id="shop-prompt-title" className="text-xl font-bold">Ready to shop?</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Create a customer account and install the Go-Shopper app to browse stores and place orders.</p>
            <div className="mt-6 grid gap-3">
              <Link onClick={() => setShopPromptOpen(false)} className="rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700" to="/sign-up">Register to shop</Link>
              {appDownloadUrl ? <a className="rounded-lg border border-stone-300 px-4 py-3 text-sm font-semibold hover:bg-stone-50" href={appDownloadUrl} target="_blank" rel="noreferrer">Install the app</a> : <p className="text-xs text-stone-500">App download link will appear here once configured.</p>}
              <button className="py-2 text-sm text-stone-600 hover:text-brand-ink" type="button" onClick={() => setShopPromptOpen(false)}>Continue browsing</button>
            </div>
          </section>
        </div>
      )}
    </header>
  );
}