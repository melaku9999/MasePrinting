"use client"

import { motion } from "framer-motion";
import { Shield, TrendingUp, FileText, Users, Calculator, Building2, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";
import { cmsApi, servicesApi } from "@/lib/api";
import { useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const iconMap: Record<string, any> = {
  FileText,
  Calculator,
  Users,
  Shield,
  Building2,
  TrendingUp,
};

export default function IndexPage() {
  const [config, setConfig] = useState<any>(null);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configData, allServices] = await Promise.all([
          cmsApi.getConfig(),
          servicesApi.getAll()
        ]);
        setConfig(configData);
        
        // Match featured service IDs to real service objects
        const featured = (configData.featured_services || []).map((id: number) => 
          allServices.results.find((s: any) => s.id === id)
        ).filter(Boolean);
        
        setFeaturedServices(featured);
      } catch (error) {
        console.error("Failed to fetch landing data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <LandingLayout>
        <div className="min-h-screen flex items-center justify-center bg-navy">
          <Loader2 className="h-12 w-12 animate-spin text-gold" />
        </div>
      </LandingLayout>
    );
  }

  const heroBg = "/landing/assets/hero-bg.jpg";

  const stats = [
    { value: config?.stat_businesses_served || "500+", label: "Businesses Served" },
    { value: config?.stat_compliance_rate || "98%", label: "Compliance Rate" },
    { value: config?.stat_years_experience || "12+", label: "Years Experience" },
    { value: config?.stat_response_time || "24hr", label: "Response Time" },
  ];
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Professional office" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-navy opacity-85" />
        </div>
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl px-4 md:px-0">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-gold/20 text-gold mb-6">
                {config?.hero_badge || "MASEPRINTING — TRUSTED FINANCIAL PARTNER"}
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6 text-slate-50"
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
            >
              {config?.hero_title ? (
                <>
                  {config.hero_title.split(" ").slice(0, -2).join(" ")}{" "}
                  <span className="text-gradient-gold">
                    {config.hero_title.split(" ").slice(-2).join(" ")}
                  </span>
                </>
              ) : (
                <>
                  Financial Clarity for{" "}
                  <span className="text-gradient-gold">Growing Businesses</span>
                </>
              )}
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl text-slate-300/90"
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
            >
              {config?.hero_description || "We handle your taxes, bookkeeping, and compliance — so you can focus on what you do best. Serving SMEs across Addis Ababa with modern, transparent financial services."}
            </motion.p>
            <motion.div className="flex flex-wrap gap-4" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <Button variant="gold" size="lg" asChild>
                <Link href="/pricing">View Pricing Plans <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link href="/services">Explore Services</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-card rounded-xl p-6 text-center shadow-elevated"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="text-3xl font-serif text-gold font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24">
        <div className="container px-4 md:px-0">
          <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm font-semibold text-gold tracking-wide uppercase">What We Do</span>
            <h2 className="text-3xl md:text-4xl font-serif mt-3 mb-4 text-foreground">Comprehensive Financial Services</h2>
            <p className="text-muted-foreground">From tax compliance to strategic advisory — everything your business needs under one roof.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredServices.length > 0 ? featuredServices : [
              { name: "VAT & Tax Filing", description: "Timely VAT returns and corporate income tax compliance.", category: "Tax Compliance" },
              { name: "Bookkeeping", description: "Monthly financial reporting and accurate records.", category: "Accounting" },
              { name: "Payroll & Pension", description: "Full payroll processing and pension contributions.", category: "HR & Payroll" }
            ]).map((svc, i) => {
                const Icon = iconMap[svc.category?.split(" ")[0]] || FileText;
                return (
                  <motion.div
                    key={svc.name}
                    className="group bg-card rounded-xl p-7 shadow-elevated hover:shadow-gold/10 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gold/20"
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-serif text-lg mb-2 text-foreground">{svc.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{svc.description}</p>
                  </motion.div>
                )
            })}
          </div>
          <div className="text-center mt-12">
            <Button variant="navy" size="lg" asChild>
              <Link href="/services">See All Services <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 bg-primary">
        <div className="container px-4 md:px-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <span className="text-sm font-semibold text-gold tracking-wide uppercase">Why Maseprinting</span>
              <h2 className="text-3xl md:text-4xl font-serif mt-3 mb-6 text-primary-foreground">Built for Ethiopian Businesses</h2>
              <p className="text-primary-foreground/70 mb-8 leading-relaxed">
                We understand the unique challenges of doing business in Ethiopia. From navigating ERCA regulations to managing multi-currency transactions for import/export, our team has deep local expertise.
              </p>
              <div className="space-y-4">
                {[
                  "Deep knowledge of Ethiopian tax law & ERCA procedures",
                  "Transparent, fixed monthly pricing — no surprises",
                  "Digital-first approach with cloud-based reporting",
                  "Dedicated account manager for every client",
                  "Bilingual support in Amharic and English",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                    <span className="text-sm text-primary-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="bg-navy-light/50 rounded-2xl p-8 border border-primary-foreground/10"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            >
              <h3 className="font-serif text-2xl text-primary-foreground mb-6">Our Mission</h3>
              <p className="text-primary-foreground/70 leading-relaxed mb-6">
                {config?.mission_statement || "To empower small and medium enterprises in Addis Ababa with accessible, transparent, and technology-driven financial services — enabling them to achieve full compliance and sustainable growth."}
              </p>
              <h3 className="font-serif text-2xl text-primary-foreground mb-4">Our Vision</h3>
              <p className="text-primary-foreground/70 leading-relaxed">
                {config?.vision_statement || "To become Ethiopia's most trusted and innovative accounting firm for growing businesses, setting the standard for digital financial services in East Africa."}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container px-4 md:px-0">
          <motion.div
            className="bg-gradient-navy rounded-2xl p-12 md:p-16 text-center relative overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(42 75% 50% / 0.2), transparent 60%)" }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-serif mb-4 text-slate-50">
                Ready to Get Your Finances in Order?
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto text-slate-300/80">
                Join 500+ businesses in Addis Ababa that trust Maseprinting for their financial compliance and growth.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link href="/pricing">Choose Your Plan <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link href="/about">Learn More About Us</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
