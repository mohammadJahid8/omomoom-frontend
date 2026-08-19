import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ClaimRequestForm } from "@/components/claim/claim-request-form";

export const metadata: Metadata = {
  title: "Add your restaurant",
  description:
    "Not on Omomoom yet? Tell us about your restaurant and we will add it.",
  alternates: { canonical: "/claim/add" },
  robots: { index: false, follow: true },
};

export default function AddRestaurantPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/claim"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>

        <h1 className="font-heading mt-6 text-3xl leading-tight font-extrabold">
          Add your restaurant
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          We check every submission by hand before it goes live, so Omomoom
          stays a list worth reading. Adding a listing is free.
        </p>

        <div className="mt-7">
          <ClaimRequestForm />
        </div>
      </div>
    </div>
  );
}
