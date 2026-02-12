"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    packageType: "basic",
    projectType: "",
    numberOfPages: "5",
    features: [] as string[],
    hasLogo: false,
    hasContent: false,
    preferredColors: "",
    urgency: "Standard (2-3 weeks)",
    additionalInfo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement order creation API
    alert("Order creation will be implemented soon!");
    setLoading(false);
  };

  return (
    <PublicShell>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Start Your Project</h1>
        <p className="text-white/70 mb-8">
          Fill out the form below to get started. Pay ₹500 order fee to begin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Selection</CardTitle>
              <CardDescription>Choose the package that fits your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { value: "basic", label: "Basic", price: "₹12,000", pages: "5 pages" },
                { value: "standard", label: "Standard", price: "₹25,000", pages: "10 pages" },
                { value: "premium", label: "Premium", price: "₹50,000", pages: "Unlimited pages" },
              ].map((pkg) => (
                <label
                  key={pkg.value}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer ${
                    formData.packageType === pkg.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="packageType"
                    value={pkg.value}
                    checked={formData.packageType === pkg.value}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{pkg.label} - {pkg.price}</div>
                    <div className="text-sm text-white/60">{pkg.pages}</div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Type</label>
                <Input
                  placeholder="e.g., Business Website, E-commerce, Portfolio"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Pages</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.numberOfPages}
                  onChange={(e) => setFormData({ ...formData, numberOfPages: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urgency</label>
                <select
                  className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                >
                  <option value="Standard (2-3 weeks)">Standard (2-3 weeks)</option>
                  <option value="Fast (1 week)">Fast (1 week) - Extra charge</option>
                  <option value="Rush (3-5 days)">Rush (3-5 days) - Extra charge</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasLogo}
                    onChange={(e) => setFormData({ ...formData, hasLogo: e.target.checked })}
                    className="mr-2"
                  />
                  I have a logo
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasContent}
                    onChange={(e) => setFormData({ ...formData, hasContent: e.target.checked })}
                    className="mr-2"
                  />
                  I have content ready
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Colors (optional)</label>
                <Input
                  placeholder="e.g., Blue and White"
                  value={formData.preferredColors}
                  onChange={(e) => setFormData({ ...formData, preferredColors: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Information</label>
                <textarea
                  className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white min-h-[100px]"
                  placeholder="Tell us more about your project..."
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Continue to Payment (₹500)"}
            </Button>
          </div>
        </form>
      </div>
    </PublicShell>
  );
}
