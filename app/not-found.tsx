"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/landing/LandingLayout";

export default function NotFound() {
  return (
    <LandingLayout>
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-gold/20 text-gold mb-6">
            404 ERROR
          </div>
          <h1 className="mb-4 text-4xl md:text-5xl font-serif text-foreground">Oops! Page not found</h1>
          <p className="mb-8 text-lg text-muted-foreground max-w-md mx-auto">
            The page you are looking for might have been moved, deleted, or never existed in the first place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
