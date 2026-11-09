import { Link } from "react-router-dom";

const steps = [
  { number: "01", title: "Find nearby stores", copy: "Discover supermarkets and everyday essentials from stores serving your area." },
  { number: "02", title: "Shop in one place", copy: "Browse products from local stores and bring everything together in one basket." },
  { number: "03", title: "Get it delivered", copy: "Place your order and let a Go-Shopper rider bring it to your door." },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-brand-ink text-white">
      <section
        className="relative min-h-screen min-h-[100svh] overflow-hidden bg-brand-ink bg-cover bg-center px-5 text-center sm:px-10"
        style={{ backgroundImage: "url('/images/rider-hero.jpeg')" }}
        aria-label="Go-Shopper delivery service"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,20,17,.16)_0%,rgba(24,20,17,.12)_42%,rgba(24,20,17,.64)_100%)]" />

        <h1 className="absolute left-1/2 top-[48%] z-10 w-[92%] max-w-4xl -translate-x-1/2 -translate-y-1/2 text-4xl font-bold uppercase leading-[1.08] tracking-[-.045em] text-white drop-shadow-lg sm:text-6xl md:text-7xl">
          Shop local, get your<br className="sm:hidden" /> <span className="text-brand-orange">everyday essentials</span>
        </h1>

        <p className="absolute bottom-[17rem] left-1/2 z-10 w-[92%] max-w-lg -translate-x-1/2 text-sm leading-6 text-white drop-shadow sm:bottom-28 sm:text-lg sm:leading-8">
          Groceries and everyday essentials from local supermarkets, delivered to your door.
        </p>
        <a href="#partners" className="absolute bottom-[11rem] left-1/2 z-10 inline-flex min-h-10 -translate-x-1/2 items-center justify-center rounded-md bg-brand-orange px-8 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-10 sm:min-h-12 sm:px-10 sm:text-sm">
          Discover Now
        </a>
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
  );
}
