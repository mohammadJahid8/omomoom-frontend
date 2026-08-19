"use client";

import {
  BookOpen,
  Clock,
  Link2,
  Tags,
  UtensilsCrossed,
} from "lucide-react";

import { StudioSection } from "@/components/dashboard/studio-section";
import {
  Field,
  SelectField,
  TextareaField,
} from "@/components/shared/field";
import type { PriceTier } from "@/types/api";
import type { StudioListing } from "@/types/studio";

const PRICE = [
  { value: "ONE", label: "$ (under $25 a head)" },
  { value: "TWO", label: "$$ ($25 to $50)" },
  { value: "THREE", label: "$$$ ($50 to $90)" },
  { value: "FOUR", label: "$$$$ ($90 and up)" },
];

const PRICE_SYMBOL: Record<string, string> = {
  ONE: "$",
  TWO: "$$",
  THREE: "$$$",
  FOUR: "$$$$",
};

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();

const filled = (...values: (string | null)[]) =>
  values.filter(Boolean).length;

export function StudioSections({
  listing,
  locked,
}: {
  listing: StudioListing;
  locked: boolean;
}) {
  const contactCount = filled(
    listing.hoursText,
    listing.phone,
    listing.email,
    listing.addressLine,
  );
  const linkCount = filled(
    listing.websiteUrl,
    listing.menuUrl,
    listing.reservationUrl,
  );
  const dishes = listing.signatureDishes?.trim();
  const storyCount = filled(
    listing.description,
    listing.story,
    listing.chefStory,
    listing.whatMakesSpecial,
  );

  return (
    <div className="grid gap-3">
      <StudioSection
        listing={listing}
        locked={locked}
        icon={Clock}
        title="Hours and contact"
        defaultOpen={contactCount === 0}
        summary={
          listing.hoursText
            ? listing.hoursText.split("\n")[0]
            : contactCount > 0
              ? "Hours are still missing"
              : "Nothing here yet. This is the first thing guests look for"
        }
        collect={(form) => ({
          hoursText: text(form, "hoursText"),
          phone: text(form, "phone"),
          email: text(form, "email"),
          addressLine: text(form, "addressLine"),
        })}
      >
        {(error) => (
          <>
            <TextareaField
              name="hoursText"
              label="Opening hours"
              rows={5}
              defaultValue={listing.hoursText ?? ""}
              error={error?.fields.hoursText}
              hint="One line per day. Write it the way you would say it: “Tue–Thu 5–10pm”, “Closed Monday”."
              placeholder={"Mon Closed\nTue–Thu 5–10pm\nFri–Sat 5–11pm\nSun 11am–4pm"}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                name="phone"
                label="Phone"
                type="tel"
                defaultValue={listing.phone ?? ""}
                error={error?.fields.phone}
                placeholder="(305) 555 0142"
              />
              <Field
                name="email"
                label="Email"
                type="email"
                defaultValue={listing.email ?? ""}
                error={error?.fields.email}
                hint="Shown to guests. Use a public inbox, not your personal one."
                placeholder="hello@restaurant.com"
              />
            </div>

            <Field
              name="addressLine"
              label="Street address"
              defaultValue={listing.addressLine ?? ""}
              error={error?.fields.addressLine}
              hint={
                listing.neighborhood
                  ? `${listing.neighborhood.name} is set by us. Ask support if it is wrong.`
                  : undefined
              }
              placeholder="1234 Biscayne Blvd"
            />
          </>
        )}
      </StudioSection>

      <StudioSection
        listing={listing}
        locked={locked}
        icon={Link2}
        title="Where to go next"
        summary={
          linkCount === 3
            ? "Website, menu and reservations all set"
            : linkCount === 0
              ? "No links yet, so guests have nowhere to book"
              : `${linkCount} of 3 links added`
        }
        collect={(form) => ({
          websiteUrl: text(form, "websiteUrl"),
          menuUrl: text(form, "menuUrl"),
          reservationUrl: text(form, "reservationUrl"),
        })}
      >
        {(error) => (
          <>
            <Field
              name="websiteUrl"
              label="Website"
              type="url"
              defaultValue={listing.websiteUrl ?? ""}
              error={error?.fields.websiteUrl}
              placeholder="https://yourrestaurant.com"
            />
            <Field
              name="menuUrl"
              label="Menu"
              type="url"
              defaultValue={listing.menuUrl ?? ""}
              error={error?.fields.menuUrl}
              hint="A link that opens the menu directly beats one that opens your homepage."
              placeholder="https://yourrestaurant.com/menu"
            />
            <Field
              name="reservationUrl"
              label="Reservations"
              type="url"
              defaultValue={listing.reservationUrl ?? ""}
              error={error?.fields.reservationUrl}
              hint="Resy, OpenTable, Tock, wherever you actually take bookings."
              placeholder="https://resy.com/cities/mia/yourrestaurant"
            />
          </>
        )}
      </StudioSection>

      <StudioSection
        listing={listing}
        locked={locked}
        icon={UtensilsCrossed}
        title="What to order"
        summary={
          dishes
            ? dishes
            : "No dishes listed. Tell people what you are known for"
        }
        collect={(form) => ({ signatureDishes: text(form, "signatureDishes") })}
      >
        {(error) => (
          <TextareaField
            name="signatureDishes"
            label="Signature dishes"
            rows={3}
            defaultValue={listing.signatureDishes ?? ""}
            error={error?.fields.signatureDishes}
            hint="Separate them with commas. Three or four is plenty, and these are the dishes guests can rate."
            placeholder="Tuna tostada, Wagyu nigiri, Miso black cod"
          />
        )}
      </StudioSection>

      <StudioSection
        listing={listing}
        locked={locked}
        icon={BookOpen}
        title="Your story"
        summary={
          listing.description
            ? listing.description
            : storyCount > 0
              ? "Some of it written, but the short description is missing"
              : "Unwritten. This is the paragraph under your name"
        }
        collect={(form) => ({
          description: text(form, "description"),
          whatMakesSpecial: text(form, "whatMakesSpecial"),
          story: text(form, "story"),
          chefStory: text(form, "chefStory"),
        })}
      >
        {(error) => (
          <>
            <TextareaField
              name="description"
              label="Short description"
              rows={3}
              maxLength={2000}
              defaultValue={listing.description ?? ""}
              error={error?.fields.description}
              hint="Two or three sentences, shown right under your name and in search results."
            />
            <TextareaField
              name="whatMakesSpecial"
              label="What makes you different"
              rows={3}
              maxLength={2000}
              defaultValue={listing.whatMakesSpecial ?? ""}
              error={error?.fields.whatMakesSpecial}
              hint="The one thing a guest should know that they would not guess from the menu."
            />
            <TextareaField
              name="story"
              label="The longer story"
              rows={6}
              maxLength={4000}
              defaultValue={listing.story ?? ""}
              error={error?.fields.story}
              hint="How the place came about. Optional, and only read by people already interested."
            />
            <TextareaField
              name="chefStory"
              label="About the chef"
              rows={5}
              maxLength={4000}
              defaultValue={listing.chefStory ?? ""}
              error={error?.fields.chefStory}
            />
          </>
        )}
      </StudioSection>

      <StudioSection
        listing={listing}
        locked={locked}
        icon={Tags}
        title="How you are filed"
        summary={
          listing.subCuisine || listing.priceTier
            ? [listing.subCuisine, listing.priceTier ? PRICE_SYMBOL[listing.priceTier] : null]
                .filter(Boolean)
                .join(" · ")
            : "Not set. This is how people narrow the list down"
        }
        collect={(form) => ({
          subCuisine: text(form, "subCuisine"),
          priceTier: text(form, "priceTier") as PriceTier | "",
        })}
      >
        {(error) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="subCuisine"
              label="Cuisine"
              defaultValue={listing.subCuisine ?? ""}
              error={error?.fields.subCuisine}
              hint="Be specific. “Nikkei” tells people more than “Japanese”."
              placeholder="Nikkei"
            />
            <SelectField
              name="priceTier"
              label="Price range"
              options={PRICE}
              placeholder="Not set"
              defaultValue={listing.priceTier ?? ""}
              error={error?.fields.priceTier}
              hint="Roughly, per person, without drinks."
            />
          </div>
        )}
      </StudioSection>
    </div>
  );
}
