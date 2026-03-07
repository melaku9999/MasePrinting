"use client"

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/landing/LandingLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const tiers = [
  {
    name: "Starter",
    price: "5,000",
    desc: "For new businesses getting their compliance foundations right.",
    features: [
      "Monthly VAT filing",
      "Basic bookkeeping (up to 50 transactions)",
      "Quarterly financial statements",
      "Email support",
      "ERCA compliance monitoring",
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: "12,000",
    desc: "For established SMEs needing comprehensive financial management.",
    features: [
      "Everything in Starter",
      "Full bookkeeping (up to 200 transactions)",
      "Monthly financial reports",
      "Payroll processing (up to 15 employees)",
      "Pension compliance",
      "Dedicated account manager",
      "Phone & email support",
      "Tax audit preparation",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "25,000",
    desc: "For growing companies needing full-service financial partnership.",
    features: [
      "Everything in Growth",
      "Unlimited transactions",
      "Payroll (up to 50 employees)",
      "Financial advisory sessions",
      "Loan documentation support",
      "Priority audit representation",
      "Cash flow forecasting",
      "Quarterly strategy review",
      "Dedicated senior accountant",
    ],
    popular: false,
  },
];

const oneTime = [
  { service: "Business Registration & Incorporation", price: "8,000 – 15,000" },
  { service: "VAT Registration with ERCA", price: "3,000 – 5,000" },
  { service: "TIN Registration", price: "2,000" },
  { service: "Historical Compliance Cleanup", price: "15,000+" },
  { service: "Tax Audit Representation (per audit)", price: "10,000 – 30,000" },
  { service: "Loan Documentation Package", price: "5,000 – 10,000" },
];

export default function PricingPage() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-gradient-navy py-20 px-4 md:px-0">
        <div className="container text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="text-sm font-semibold text-gold tracking-wide uppercase">Pricing</span>
            <h1 className="text-4xl md:text-5xl font-serif mt-3 mb-4" style={{ color: "hsl(0 0% 98%)" }}>
              Transparent, Fixed Monthly Pricing
            </h1>
            <p style={{ color: "hsl(220 20% 80%)" }} className="text-lg max-w-2xl mx-auto">
              No hidden fees. No surprises. Choose the plan that fits your business size and needs. All prices in ETB.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-24 px-4 md:px-0">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                className={`relative bg-card rounded-2xl p-8 shadow-elevated border-2 transition-all ${
                  tier.popular ? "border-gold shadow-gold" : "border-transparent"
                }`}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-gold text-navy-dark text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3 className="font-serif text-xl text-foreground">{tier.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-serif text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">ETB/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{tier.desc}</p>
                <Button variant={tier.popular ? "gold" : "navy"} className="w-full mb-6">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* One-time Services */}
      <section className="py-16 bg-muted px-4 md:px-0">
        <div className="container max-w-3xl">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm font-semibold text-gold tracking-wide uppercase">One-Time Services</span>
            <h2 className="text-3xl font-serif mt-3 text-foreground">Setup & Compliance Services</h2>
          </motion.div>
          <div className="bg-card rounded-xl overflow-hidden shadow-elevated">
            {oneTime.map((item, i) => (
              <motion.div
                key={item.service}
                className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-border last:border-0 gap-2 sm:gap-0"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <span className="text-sm text-foreground font-medium text-center sm:text-left">{item.service}</span>
                <span className="text-sm font-semibold text-gold whitespace-nowrap ml-0 sm:ml-4">{item.price} ETB</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
