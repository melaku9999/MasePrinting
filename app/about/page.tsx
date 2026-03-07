"use client"

import { motion } from "framer-motion";
import { Target, Eye, Gem, Users, Award, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/landing/LandingLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const values = [
  { icon: Award, title: "Integrity", desc: "We uphold the highest ethical standards in every financial transaction and advisory." },
  { icon: Gem, title: "Transparency", desc: "Clear pricing, open communication, and honest advice — always." },
  { icon: Zap, title: "Innovation", desc: "Leveraging technology to deliver faster, more accurate financial services." },
  { icon: Users, title: "Partnership", desc: "We don't just file your taxes — we become invested in your business success." },
];

const team = [
  { name: "Yohannes Tadesse", role: "Founder & Lead Accountant", bio: "15+ years of experience in Ethiopian tax law, previously with one of Addis Ababa's top audit firms." },
  { name: "Meron Alemu", role: "Senior Tax Advisor", bio: "Specializes in import/export tax compliance and VAT advisory for trading companies." },
  { name: "Dawit Bekele", role: "Bookkeeping Manager", bio: "Expert in cloud-based accounting systems with a focus on SME financial management." },
];

export default function AboutPage() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-gradient-navy py-20 px-4 md:px-0">
        <div className="container">
          <motion.div className="max-w-2xl" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="text-sm font-semibold text-gold tracking-wide uppercase">About Us</span>
            <h1 className="text-4xl md:text-5xl font-serif mt-3 mb-4" style={{ color: "hsl(0 0% 98%)" }}>
              Your Financial Growth Partner in Addis Ababa
            </h1>
            <p style={{ color: "hsl(220 20% 80%)" }} className="text-lg leading-relaxed">
              Maseprinting was founded with a simple belief: every Ethiopian business deserves access to professional, affordable, and modern financial services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 md:px-0">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div className="bg-card rounded-xl p-8 shadow-elevated" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To empower small and medium enterprises in Addis Ababa with accessible, transparent, and technology-driven financial services — enabling them to achieve full compliance and sustainable growth.
              </p>
            </motion.div>
            <motion.div className="bg-card rounded-xl p-8 shadow-elevated" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-foreground">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become Ethiopia's most trusted and innovative accounting firm for growing businesses, setting the standard for digital financial services in East Africa.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted px-4 md:px-0">
        <div className="container">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm font-semibold text-gold tracking-wide uppercase">Our Values</span>
            <h2 className="text-3xl font-serif mt-3 text-foreground">What Drives Us</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="bg-card rounded-xl p-6 text-center shadow-elevated"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-serif text-lg mb-2 text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 md:px-0">
        <div className="container">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm font-semibold text-gold tracking-wide uppercase">Our Team</span>
            <h2 className="text-3xl font-serif mt-3 text-foreground">Meet the Experts</h2>
          </motion.div>
          <div className="grid md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                className="bg-card rounded-xl p-6 shadow-elevated text-center"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-gold mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-serif text-navy-dark font-bold">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-foreground">{member.name}</h3>
                <p className="text-sm text-gold font-medium mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary px-4 md:px-0">
        <div className="container text-center text-primary-foreground">
          <h2 className="text-3xl font-serif mb-4">Ready to Partner with Us?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
            Let's discuss how Maseprinting can help your business achieve financial clarity and compliance.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link href="/pricing" onClick={() => window.scrollTo(0, 0)}>View Our Plans</Link>
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
