import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/PublicShell";

export default function HomePage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-transparent" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Professional Websites Built For Your Business
            </h1>
            <p className="mt-5 text-lg text-white/75">
              Custom web development with hosting & domain included. Pay ₹500 to start, track everything in your dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/order">
                <Button size="lg">Start Your Project</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-white/70">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">Domain + Hosting Included</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">Fast Delivery Options</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">Client Dashboard + Chat</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">Secure Payments (Razorpay)</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <PriceCard
            title="Basic"
            price="₹12,000"
            points={["5 pages", "Responsive design", "Contact form", "1 year hosting", "2 revisions"]}
          />
          <PriceCard
            featured
            title="Standard"
            price="₹25,000"
            points={["10 pages", "E-commerce ready", "SEO optimized", "CMS integration", "3 revisions"]}
          />
          <PriceCard
            title="Premium"
            price="₹50,000"
            points={["Unlimited pages", "Custom features", "Advanced animations", "Priority support", "5 revisions"]}
          />
        </div>
        <div className="text-center mt-8">
          <Link href="/order">
            <Button size="lg">Start With ₹500 Order Fee</Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Portfolio</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-white/10 to-white/0" />
              <div className="mt-3 font-semibold">Project #{i + 1}</div>
              <div className="text-xs text-white/60 mt-1">e-commerce • business • landing</div>
              <div className="mt-3">
                <Button size="sm" variant="outline">
                  View Live
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            "Choose package & fill requirements",
            "Pay ₹500 order fee",
            "Connect with developer via dashboard",
            "Website delivered + revisions",
          ].map((t, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-white/60">Step {idx + 1}</div>
              <div className="font-semibold mt-1">{t}</div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

function PriceCard({
  title,
  price,
  points,
  featured,
}: {
  title: string;
  price: string;
  points: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white/5 p-6",
        featured ? "border-blue-500/60 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]" : "border-white/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">{title}</div>
        {featured && (
          <div className="text-xs rounded-full bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-blue-200">
            Popular
          </div>
        )}
      </div>
      <div className="mt-3 text-3xl font-extrabold">{price}</div>
      <ul className="mt-5 space-y-2 text-sm text-white/75">
        {points.map((p) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
    </div>
  );
}

