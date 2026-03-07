import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-16">
      <div className="grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="font-serif text-navy-dark text-lg font-bold">M</span>
            </div>
            <span className="font-serif text-xl text-primary-foreground tracking-tight">
              Mase<span className="text-gold">printing</span>
            </span>
          </Link>
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            Your trusted financial compliance and growth partner for SMEs in Addis Ababa.  Powered by Maseprinting.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-serif text-base mb-4 text-gold">Services</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link href="/services" className="hover:text-gold transition-colors">Tax Filing & Compliance</Link></li>
            <li><Link href="/services" className="hover:text-gold transition-colors">Bookkeeping</Link></li>
            <li><Link href="/services" className="hover:text-gold transition-colors">Payroll & Pension</Link></li>
            <li><Link href="/services" className="hover:text-gold transition-colors">Business Registration</Link></li>
            <li><Link href="/services" className="hover:text-gold transition-colors">Financial Advisory</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-base mb-4 text-gold">Company</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
            <li><Link href="/pricing" className="hover:text-gold transition-colors">Pricing</Link></li>
            <li><Link href="/about" className="hover:text-gold transition-colors">Our Team</Link></li>
            <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-serif text-base mb-4 text-gold">Contact</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
              <span>Bole Sub City, Addis Ababa, Ethiopia</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0 text-gold" />
              <span>+251 911 123 456</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0 text-gold" />
              <span>info@maseprinting.et</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
        <span>© 2026 Maseprinting. All rights reserved.</span>
        <span>Empowering Ethiopian businesses with financial clarity.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
