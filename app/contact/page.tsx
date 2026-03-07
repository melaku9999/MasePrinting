"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import LandingLayout from "@/components/landing/LandingLayout";
import { cmsApi } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(20),
  business_type: z.string().min(1, "Please select your business type"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const businessTypes = [
  "Import/Export Trading",
  "Construction Company",
  "Retail Business",
  "Clinic / Healthcare",
  "NGO / Nonprofit",
  "Startup",
  "Manufacturing",
  "Hospitality",
  "Other",
];

const contactInfo = [
  { icon: MapPin, label: "Office Address", value: "Bole Sub City, Woreda 03\nAddis Ababa, Ethiopia" },
  { icon: Phone, label: "Phone", value: "+251 911 123 456" },
  { icon: Mail, label: "Email", value: "info@maseprinting.et" },
  { icon: Clock, label: "Working Hours", value: "Mon – Fri: 8:30 AM – 5:30 PM\nSat: 9:00 AM – 1:00 PM" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", business_type: "", message: "" },
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      await cmsApi.submitInquiry(data);
      setSubmitted(true);
      toast.success("Inquiry Sent", {
        description: "We'll get back to you within 24 hours.",
      });
      reset();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      toast.error("Failed to send inquiry", {
        description: "Please try again or contact us directly via phone."
      });
    }
  };

  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-primary py-20 px-4 md:px-0">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl text-primary-foreground mb-4"
          >
            Get in <span className="text-gold">Touch</span>
          </motion.h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg">
            Ready to simplify your finances? Reach out and let's discuss how Maseprinting can support your business.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-20 bg-background px-4 md:px-0">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">
                <h2 className="font-serif text-2xl text-foreground mb-1">Send Us an Inquiry</h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Fill out the form below and our team will respond within one business day.
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <CheckCircle className="w-14 h-14 text-gold mb-4" />
                    <h3 className="font-serif text-xl text-foreground mb-2">Thank You!</h3>
                    <p className="text-muted-foreground">Your inquiry has been received. We'll be in touch shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" placeholder="Abebe Kebede" {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="abebe@company.com" {...register("email")} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" placeholder="+251 9XX XXX XXX" {...register("phone")} />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Business Type *</Label>
                        <Select onValueChange={(v) => setValue("business_type", v, { shouldValidate: true })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.business_type && <p className="text-sm text-destructive">{errors.business_type.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">How Can We Help? *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your business needs..."
                        className="min-h-[130px]"
                        {...register("message")}
                      />
                      {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                    </div>

                    <Button type="submit" variant="gold" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Submit Inquiry"}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
                <h3 className="font-serif text-xl mb-6 text-gold">Office Information</h3>
                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-foreground/60 mb-0.5">{item.label}</p>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8">
                <h3 className="font-serif text-lg text-foreground mb-3">Why Maseprinting?</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Transparent, fixed-fee pricing — no surprises",
                    "Dedicated account manager for every client",
                    "Deep expertise in Ethiopian tax & compliance",
                    "Same-day response on urgent matters",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
