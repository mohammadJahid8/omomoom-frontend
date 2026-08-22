"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Field,
  FormAlert,
  SelectField,
  TextareaField,
} from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { PhotoStage, type StagedPhoto } from "@/components/dashboard/photo-stage";
import { toFormError, type FormError } from "@/lib/api/auth";
import { createRestaurant, updateRestaurant } from "@/lib/api/admin";
import { addStudioPhoto } from "@/lib/api/studio";
import { imageSize, inBatches, uploadImage } from "@/lib/api/uploads";
import type { AdminRestaurant, AdminRestaurantInput } from "@/types/admin";

const STATUS = [
  { value: "PUBLISHED", label: "Published, live on the site" },
  { value: "DRAFT", label: "Draft, hidden until finished" },
  { value: "HIDDEN", label: "Hidden, taken down deliberately" },
];

const PRICE = [
  { value: "ONE", label: "$" },
  { value: "TWO", label: "$$" },
  { value: "THREE", label: "$$$" },
  { value: "FOUR", label: "$$$$" },
];

const MICHELIN = [
  { value: "SELECTED", label: "Selected" },
  { value: "BIB_GOURMAND", label: "Bib Gourmand" },
  { value: "ONE_STAR", label: "One star" },
  { value: "TWO_STARS", label: "Two stars" },
  { value: "THREE_STARS", label: "Three stars" },
];

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim() || null;

export function RestaurantForm({
  restaurant,
  onDone,
  onCancel,
}: {
  restaurant: AdminRestaurant | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [problem, setProblem] = useState<string | null>(null);

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      const input: AdminRestaurantInput = {
        name: String(formData.get("name") ?? "").trim(),
        status: (formData.get("status") as AdminRestaurantInput["status"]) ??
          "DRAFT",
        description: text(formData, "description"),
        subCuisine: text(formData, "subCuisine"),
        signatureDishes: text(formData, "signatureDishes"),
        municipality: text(formData, "municipality"),
        addressLine: text(formData, "addressLine"),
        phone: text(formData, "phone"),
        websiteUrl: text(formData, "websiteUrl"),
        menuUrl: text(formData, "menuUrl"),
        reservationUrl: text(formData, "reservationUrl"),
        hoursText: text(formData, "hoursText"),
        priceTier: (formData.get("priceTier") as string) || null,
        michelin: (formData.get("michelin") as string) || null,
      } as AdminRestaurantInput;

      try {
        const saved = restaurant
          ? await updateRestaurant(restaurant.id, input)
          : await createRestaurant(input);

        // After the restaurant exists, never before: a new listing has no id
        // to hang a photo on until this point.
        if (staged.length > 0) {
          await inBatches(staged, 3, async (item) => {
            const { key } = await uploadImage(
              item.file,
              "RESTAURANT_PHOTO",
              saved.id,
            );
            const size = await imageSize(item.file);
            await addStudioPhoto(saved.id, { key, ...size });
          });
        }

        onDone();
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <form action={submit} className="grid gap-5">
      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <Field
        name="name"
        label="Name"
        defaultValue={restaurant?.name}
        placeholder="Azabu Miami Beach"
        maxLength={160}
        required
        error={error?.fields.name}
      />

      <SelectField
        name="status"
        label="Status"
        options={STATUS}
        defaultValue={restaurant?.status ?? "DRAFT"}
        error={error?.fields.status}
      />

      <TextareaField
        name="description"
        label="Description"
        rows={4}
        maxLength={2000}
        defaultValue={restaurant?.description ?? ""}
        placeholder="What the place is, who it is for, what makes it worth going."
        error={error?.fields.description}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="subCuisine"
          label="Cuisine"
          defaultValue={restaurant?.subCuisine ?? ""}
          placeholder="Korean BBQ / Hot Pot"
          maxLength={120}
          error={error?.fields.subCuisine}
        />
        <Field
          name="municipality"
          label="City"
          defaultValue={restaurant?.municipality ?? ""}
          placeholder="Miami Beach"
          maxLength={120}
          error={error?.fields.municipality}
        />
      </div>

      <Field
        name="signatureDishes"
        label="Signature dishes"
        defaultValue={restaurant?.signatureDishes ?? ""}
        placeholder="Omakase, Wagyu Ishiyaki"
        maxLength={400}
        hint="Comma separated. These show on the card and drive What to order."
        error={error?.fields.signatureDishes}
      />

      <Field
        name="addressLine"
        label="Address"
        defaultValue={restaurant?.addressLine ?? ""}
        placeholder="161 Ocean Dr"
        maxLength={240}
        error={error?.fields.addressLine}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="priceTier"
          label="Price"
          options={PRICE}
          placeholder="Not set"
          defaultValue={restaurant?.priceTier ?? ""}
          error={error?.fields.priceTier}
        />
        <SelectField
          name="michelin"
          label="Michelin"
          options={MICHELIN}
          placeholder="None"
          defaultValue={restaurant?.michelin ?? ""}
          error={error?.fields.michelin}
        />
      </div>

      <Field
        name="phone"
        label="Phone"
        type="tel"
        defaultValue={restaurant?.phone ?? ""}
        placeholder="(305) 555 0123"
        maxLength={40}
        error={error?.fields.phone}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="websiteUrl"
          label="Website"
          type="url"
          defaultValue={restaurant?.websiteUrl ?? ""}
          placeholder="https://"
          maxLength={500}
          error={error?.fields.websiteUrl}
        />
        <Field
          name="menuUrl"
          label="Menu link"
          type="url"
          defaultValue={restaurant?.menuUrl ?? ""}
          placeholder="https://"
          maxLength={500}
          error={error?.fields.menuUrl}
        />
      </div>

      <Field
        name="reservationUrl"
        label="Reservations link"
        type="url"
        defaultValue={restaurant?.reservationUrl ?? ""}
        placeholder="https://"
        maxLength={500}
        error={error?.fields.reservationUrl}
      />

      <TextareaField
        name="hoursText"
        label="Hours"
        rows={3}
        maxLength={400}
        defaultValue={restaurant?.hoursText ?? ""}
        placeholder="Mon-Thu 5:30-10:30 PM; Fri-Sat 5:30-11 PM; Sun closed"
        hint="Shown exactly as written."
        error={error?.fields.hoursText}
      />

      <div className="border-foreground/10 border-t pt-5">
        <PhotoStage
          photos={staged}
          onChange={setStaged}
          disabled={pending}
          busy={pending && staged.length > 0}
          onProblem={setProblem}
          label={restaurant ? "Add more photos" : "Photos"}
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Chosen now, uploaded when you save.
        </p>
        {problem ? (
          <p role="alert" className="text-destructive mt-2 text-xs">
            {problem}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-xl px-5 font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending
            ? "Saving"
            : restaurant
              ? "Save changes"
              : "Create restaurant"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-muted-foreground h-11 rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
