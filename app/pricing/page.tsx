import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <PublicShell>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
          <p className="text-white/70 text-lg">
            Choose the perfect package for your business. All plans include hosting & domain.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PriceCard
            title="Basic"
            price="₹12,000"
            originalPrice="₹15,000"
            features={[
              "5 pages",
              "Responsive design",
              "Contact form",
              "1 year hosting included",
              "1 year domain included",
              "2 revisions",
              "Basic SEO",
              "Mobile optimized",
            ]}
          />
          <PriceCard
            featured
            title="Standard"
            price="₹25,000"
            originalPrice="₹30,000"
            features={[
              "10 pages",
              "E-commerce ready",
              "SEO optimized",
              "CMS integration",
              "1 year hosting included",
              "1 year domain included",
              "3 revisions",
              "Advanced animations",
              "Payment gateway setup",
            ]}
          />
          <PriceCard
            title="Premium"
            price="₹50,000"
            originalPrice="₹65,000"
            features={[
              "Unlimited pages",
              "Custom features",
              "Advanced animations",
              "Priority support",
              "1 year hosting included",
              "1 year domain included",
              "5 revisions",
              "Full SEO package",
              "Performance optimization",
              "Custom integrations",
            ]}
          />
        </div>

        <div className="text-center mt-12">
          <div className="mb-6 p-6 rounded-xl border border-white/10 bg-white/5 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-2">How It Works</h3>
            <p className="text-white/70">
              Pay just ₹500 as order fee to get started. The remaining amount will be due upon project completion.
              Track everything in your client dashboard.
            </p>
          </div>
          <Link href="/order">
            <Button size="lg">Start Your Project - ₹500 Order Fee</Button>
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-xl border border-white/10 bg-white/5">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm text-white/70">Standard delivery in 2-3 weeks. Rush options available.</p>
          </div>
          <div className="text-center p-6 rounded-xl border border-white/10 bg-white/5">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold mb-2">Direct Communication</h3>
            <p className="text-sm text-white/70">Chat with developers directly through your dashboard.</p>
          </div>
          <div className="text-center p-6 rounded-xl border border-white/10 bg-white/5">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm text-white/70">All payments processed securely via Razorpay.</p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function PriceCard({
  title,
  price,
  originalPrice,
  features,
  featured,
}: {
  title: string;
  price: string;
  originalPrice?: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 ${
        featured
          ? "border-blue-500/60 shadow-[0_0_0_1px_rgba(59,130,246,0.35)] bg-blue-500/5 scale-105"
          : "border-white/10 bg-white/5"
      }`}
    >
      {featured && (
        <div className="text-xs rounded-full bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-blue-200 inline-block mb-4">
          Most Popular
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold">{title}</div>
      </div>
      <div className="mb-6">
        <div className="text-4xl font-extrabold">{price}</div>
        {originalPrice && (
          <div className="text-sm text-white/50 line-through mt-1">{originalPrice}</div>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-sm text-white/80">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/order" className="block">
        <Button className="w-full" variant={featured ? "default" : "outline"}>
          Get Started
        </Button>
      </Link>
    </div>
  );
}
