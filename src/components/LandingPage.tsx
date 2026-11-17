import { Link } from "react-router-dom";
import { getAppDownloadUrl } from "../utils/appDownloadUrl";

const steps = [
  { number: "01", title: "Find nearby stores", copy: "Discover supermarkets and everyday essentials from stores serving your area." },
  { number: "02", title: "Shop in one place", copy: "Browse products from local stores and bring everything together in one basket." },
  { number: "03", title: "Get it delivered", copy: "Place your order and let a Go-Shopper rider bring it to your door." },
];

export default function LandingPage() {
  const appDownloadUrl = getAppDownloadUrl(import.meta.env.VITE_APP_DOWNLOAD_URL as string | undefined);

  return (
    <>
    <main className="overflow-hidden bg-brand-ink text-white">
      <section
        className="relative min-h-screen min-h-[100svh] overflow-hidden bg-brand-ink bg-cover bg-center text-center"
        style={{ backgroundImage: "url('/images/rider-hero.jpeg')" }}
        aria-label="Go-Shopper delivery service"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,20,17,.16)_0%,rgba(24,20,17,.12)_42%,rgba(24,20,17,.64)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center gap-5 px-4 pb-8 pt-40 sm:gap-8 sm:px-10 sm:pb-12 sm:pt-36">
          <h1 className="w-full max-w-5xl text-[clamp(2rem,8.5vw,5rem)] font-bold uppercase leading-[1.08] tracking-[-.045em] text-white drop-shadow-lg">
            Shop local, get your<br className="sm:hidden" /> <span className="text-brand-orange">everyday essentials</span>
          </h1>

          <p className="w-full max-w-lg text-sm leading-6 text-white drop-shadow sm:text-lg sm:leading-8">
            Groceries and everyday essentials from local supermarkets, delivered to your door.
          </p>
          <a href="#partners" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-brand-orange px-8 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-10 sm:text-sm">
            Discover Now
          </a>
        </div>
      </section>

      <section id="how" className="scroll-mt-6 px-5 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-orange">Simple to get started</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Everyday shopping, made easier.</h2>
          </div>
          <div className="mt-10 grid gap-7 sm:mt-14 sm:grid-cols-3 sm:gap-5">
            {steps.map((step) => <article key={step.number} className="border-t border-white/20 pt-5 sm:pt-6">
              <span className="text-sm font-bold text-brand-orange">{step.number}</span>
              <h3 className="mt-5 text-lg font-semibold sm:text-xl">{step.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">{step.copy}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section id="partners" className="scroll-mt-6 grid bg-[#211c18] lg:grid-cols-2">
        <div className="min-h-72 bg-cover bg-center sm:min-h-[440px]" role="img" aria-label="A neighborhood supermarket" style={{ backgroundImage: "url('/images/store-interior.jpeg')" }} />
        <div className="flex flex-col justify-center px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-orange">For supermarket owners</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Bring your store closer to more shoppers.</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">Join a marketplace that helps customers find local supermarkets and order the things they need.</p>
          <ul className="mt-6 grid gap-3 text-sm text-white/85">
            <li><span className="mr-2 text-brand-orange">✓</span>Reach shoppers in your community</li>
            <li><span className="mr-2 text-brand-orange">✓</span>Showcase your products online</li>
            <li><span className="mr-2 text-brand-orange">✓</span>Manage your applications in one place</li>
          </ul>
          <Link to="/register/supermarket" className="mt-8 inline-flex min-h-12 w-fit items-center rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">Register your supermarket <span className="ml-3" aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section id="riders" className="relative scroll-mt-6 bg-cover bg-center px-5 py-16 sm:px-10 sm:py-24 lg:px-16" style={{ backgroundImage: "linear-gradient(90deg, rgba(24,20,17,.96), rgba(24,20,17,.72) 55%, rgba(24,20,17,.25)), url('/images/storefront.jpeg')" }}>
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-orange">For delivery riders</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Make every delivery count.</h2>
            <p className="mt-5 text-sm leading-7 text-white/75 sm:text-base">Help local supermarkets get orders to their customers. Apply to ride with Go-Shopper.</p>
            <Link to="/register/rider" className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-ink transition hover:bg-stone-100">Apply as a rider <span className="ml-3" aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 bg-brand-surface px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-16 lg:px-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-orange">Ready to get started?</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-4xl">Let’s grow together.</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/register/supermarket" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">Register a supermarket</Link>
          <Link to="/register/rider" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Become a rider</Link>
        </div>
      </section>
    </main>
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:bottom-4 sm:px-6 sm:pb-0">
        {appDownloadUrl ? <a href={appDownloadUrl} target="_blank" rel="noreferrer" aria-label="Open Go-Shopper app download" className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-brand-orange p-3 text-white shadow-2xl transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
            <img src="/images/goshopper-bag.svg" alt="" className="h-9 w-9 object-contain" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold sm:text-base">Get the Go-Shopper app</span>
            <span className="block text-xs text-white/85 sm:text-sm">Tap to download and start shopping</span>
          </span>
          <span aria-hidden="true" className="pr-1 text-2xl leading-none">›</span>
        </a> : <div role="status" className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-brand-ink p-3 text-white shadow-2xl sm:p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
            <img src="/images/goshopper-bag.svg" alt="" className="h-9 w-9 object-contain" />
          </span>
          <span>
            <span className="block text-sm font-bold sm:text-base">Get the Go-Shopper app</span>
            <span className="block text-xs text-white/70 sm:text-sm">App download link coming soon</span>
          </span>
        </div>}
      </div>
    </>
  );
}
