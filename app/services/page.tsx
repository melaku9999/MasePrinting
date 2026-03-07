"use client"

import { motion } from "framer-motion";
import { Shield, TrendingUp, FileText, Users, Calculator, Building2, ClipboardCheck, Briefcase, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/landing/LandingLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const services = [
  {
    icon: FileText,
    title: "VAT & Tax Filing",
    features: ["Monthly/quarterly VAT returns", "Corporate income tax filing", "Withholding tax management", "ERCA compliance monitoring"],
  },
  {
    icon: Calculator,
    title: "Bookkeeping & Reporting",
    features: ["Monthly financial statements", "Chart of accounts setup", "Bank reconciliation", "Profit & loss reporting"],
  },
  {
    icon: Users,
    title: "Payroll & Pension",
    features: ["Employee payroll processing", "Pension fund contributions", "Income tax withholding", "Pay slip generation"],
  },
  {
    icon: Shield,
    title: "Tax Audit Preparation",
    features: ["Document preparation & review", "ERCA audit representation", "Dispute resolution support", "Historical compliance review"],
  },
  {
    icon: Building2,
    title: "Business Registration",
    features: ["Company incorporation", "VAT registration with ERCA", "Trade license processing", "TIN registration"],
  },
  {
    icon: TrendingUp,
    title: "Financial Advisory",
    features: ["Loan documentation prep", "Cash flow analysis", "Business plan financials", "Growth strategy support"],
  },
  {
    icon: ClipboardCheck,
    title: "Compliance Management",
    features: ["Annual compliance calendar", "Regulatory deadline tracking", "Document management", "Risk assessment"],
  },
  {
    icon: Briefcase,
    title: "NGO & Nonprofit Support",
    features: ["ChSA compliance", "Donor reporting", "Grant financial management", "Annual audit preparation"],
  },
];

export default function ServicesPage() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-gradient-navy py-20 px-4 md:px-0">
        <div className="container">
          <motion.div className="max-w-2xl" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="text-sm font-semibold text-gold tracking-wide uppercase">Our Services</span>
            <h1 className="text-4xl md:text-5xl font-serif mt-3 mb-4" style={{ color: "hsl(0 0% 98%)" }}>
              Everything Your Business Needs to Stay Compliant & Grow
            </h1>
            <p style={{ color: "hsl(220 20% 80%)" }} className="text-lg leading-relaxed">
              From monthly bookkeeping to tax audit representation — our comprehensive suite of services covers every aspect of financial compliance for Ethiopian businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 md:px-0">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((svc, i) => (
              <motion.div
                key={svc.title}
                className="bg-card rounded-xl p-8 shadow-elevated border border-transparent hover:border-gold/20 transition-all"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <svc.icon className="w-7 h-7 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-3 text-foreground">{svc.title}</h3>
                    <ul className="space-y-2">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted px-4 md:px-0">
        <div className="container text-center">
          <h2 className="text-3xl font-serif mb-4 text-foreground">Need a Custom Solution?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Every business is unique. Contact us for a tailored service package that fits your specific needs and budget.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link href="/pricing">View Pricing Plans</Link>
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
