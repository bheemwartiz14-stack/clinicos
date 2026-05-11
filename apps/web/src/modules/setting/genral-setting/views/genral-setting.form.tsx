"use client";

import { City, Country, State } from "country-state-city";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { Building2, Globe2, ImageIcon, Loader2, Mail, MapPin, Phone, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, GeneralSettings } from "../genral-setting.types";

type GeneralSettingsAction = (formData: FormData) => Promise<ActionState>;

type GeneralSettingsFormProps = {
  action: GeneralSettingsAction;
  settings: GeneralSettings | null;
};

const defaultActionState: ActionState = { ok: false, message: "" };

const socialFields = [
  { name: "website", label: "Website" },
  { name: "facebook", label: "Facebook" },
  { name: "instagram", label: "Instagram" },
  { name: "twitter", label: "Twitter" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "youtube", label: "YouTube" },
] as const;

const filePondLabel = 'Drag & Drop your file or <span class="filepond--label-action">Browse</span>';

registerPlugin(FilePondPluginImagePreview);

function getInitialCountryCode(settings: GeneralSettings | null) {
  if (settings?.address?.countryCode) {
    return settings.address.countryCode;
  }

  return (
    Country.getAllCountries().find((country) => country.name === settings?.address?.country)
      ?.isoCode ?? ""
  );
}

function getInitialStateCode(settings: GeneralSettings | null, countryCode: string) {
  if (settings?.address?.stateCode) {
    return settings.address.stateCode;
  }

  return (
    State.getStatesOfCountry(countryCode).find((state) => state.name === settings?.address?.state)
      ?.isoCode ?? ""
  );
}

function CurrentAssetPreview({ alt, src }: { alt: string; src: string | null | undefined }) {
  if (!src) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-background p-3">
      <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
        <Image src={src} alt={alt} width={64} height={64} className="object-contain" />
      </span>
      <span className="min-w-0">
        <span className="block text-muted-foreground text-xs">Current file</span>
        <span className="block break-all text-xs">{src}</span>
      </span>
    </div>
  );
}

export function GeneralSettingsToast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        className: "border bg-background text-foreground shadow-lg",
        success: {
          iconTheme: {
            primary: "hsl(var(--primary))",
            secondary: "white",
          },
        },
      }}
    />
  );
}

export function GeneralSettingsForm({ action, settings }: GeneralSettingsFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState(defaultActionState);
  const [selectedCountryCode, setSelectedCountryCode] = useState(() =>
    getInitialCountryCode(settings),
  );
  const [selectedStateCode, setSelectedStateCode] = useState(() =>
    getInitialStateCode(settings, getInitialCountryCode(settings)),
  );
  const [selectedCity, setSelectedCity] = useState(settings?.address?.city ?? "");
  const [isPending, startTransition] = useTransition();

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () => State.getStatesOfCountry(selectedCountryCode),
    [selectedCountryCode],
  );
  const cities = useMemo(
    () => City.getCitiesOfState(selectedCountryCode, selectedStateCode),
    [selectedCountryCode, selectedStateCode],
  );
  const selectedCountry = countries.find((country) => country.isoCode === selectedCountryCode);
  const selectedState = states.find((stateItem) => stateItem.isoCode === selectedStateCode);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [state, router]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
    });
  }

  function onCountryChange(value: string) {
    setSelectedCountryCode(value);
    setSelectedStateCode("");
    setSelectedCity("");
  }

  function onStateChange(value: string) {
    setSelectedStateCode(value);
    setSelectedCity("");
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-5">
      <section className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-start gap-3 border-b p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Company information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Public-facing clinic name and support contact details.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="companyName">
            Company name
            <Input
              id="companyName"
              name="companyName"
              required
              maxLength={255}
              defaultValue={settings?.companyName ?? ""}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor="supportEmail">
            Support email
            <span className="relative">
              <Mail className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                id="supportEmail"
                name="supportEmail"
                required
                type="email"
                maxLength={255}
                className="pl-9"
                defaultValue={settings?.supportEmail ?? ""}
              />
            </span>
          </label>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor="supportPhone">
            Support phone
            <span className="relative">
              <Phone className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                id="supportPhone"
                name="supportPhone"
                type="tel"
                maxLength={50}
                className="pl-9"
                defaultValue={settings?.supportPhone ?? ""}
              />
            </span>
          </label>

          <label className="grid gap-1.5 text-sm font-medium md:col-span-2" htmlFor="tagline">
            Tagline
            <Textarea
              id="tagline"
              name="tagline"
              maxLength={500}
              defaultValue={settings?.tagline ?? ""}
              className="min-h-24"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-start gap-3 border-b p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Clinic address</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Address, country, state, and city used for clinic location details.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium md:col-span-2" htmlFor="addressLine">
            Address
            <Textarea
              id="addressLine"
              name="addressLine"
              rows={3}
              maxLength={500}
              defaultValue={settings?.address?.addressLine ?? ""}
            />
          </label>
          <input type="hidden" name="country" value={selectedCountry?.name ?? ""} readOnly />
          <input type="hidden" name="state" value={selectedState?.name ?? ""} readOnly />
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="countryCode">
            Country
            <Select name="countryCode" value={selectedCountryCode} onValueChange={onCountryChange}>
              <SelectTrigger id="countryCode" className="w-full bg-background">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor="stateCode">
            State
            <Select
              name="stateCode"
              value={selectedStateCode}
              disabled={!selectedCountryCode || states.length === 0}
              onValueChange={onStateChange}
            >
              <SelectTrigger id="stateCode" className="w-full bg-background">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((stateItem) => (
                  <SelectItem key={stateItem.isoCode} value={stateItem.isoCode}>
                    {stateItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor="city">
            City
            <Select
              name="city"
              value={selectedCity}
              disabled={!selectedStateCode || cities.length === 0}
              onValueChange={setSelectedCity}
            >
              <SelectTrigger id="city" className="w-full bg-background">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem
                    key={`${city.name}-${city.latitude}-${city.longitude}`}
                    value={city.name}
                  >
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-start gap-3 border-b p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Globe2 className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Social media links</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional channels shown across public and support experiences.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          {socialFields.map((field) => (
            <label
              key={field.name}
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={field.name}
            >
              {field.label}
              <Input
                id={field.name}
                name={field.name}
                type="url"
                placeholder="https://"
                defaultValue={settings?.socialMediaLinks?.[field.name] ?? ""}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-start gap-3 border-b p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <ImageIcon className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Logos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload the main logo and favicon used across the clinic experience.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium" htmlFor="mainLogoFile">
            Main logo
            <input type="hidden" name="mainLogo" defaultValue={settings?.mainLogo ?? ""} />
            <CurrentAssetPreview alt="Current main logo" src={settings?.mainLogo} />
            <FilePond
              id="mainLogoFile"
              name="mainLogoFile"
              acceptedFileTypes={["image/*"]}
              allowMultiple={false}
              credits={false}
              imagePreviewHeight={140}
              labelIdle={filePondLabel}
              storeAsFile
            />
          </label>

          <label className="grid gap-2 text-sm font-medium" htmlFor="faviconFile">
            Favicon
            <input type="hidden" name="favicon" defaultValue={settings?.favicon ?? ""} />
            <CurrentAssetPreview alt="Current favicon" src={settings?.favicon} />
            <FilePond
              id="faviconFile"
              name="faviconFile"
              acceptedFileTypes={["image/*", "image/x-icon", "image/vnd.microsoft.icon"]}
              allowMultiple={false}
              credits={false}
              imagePreviewHeight={140}
              labelIdle={filePondLabel}
              storeAsFile
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" className="gap-2 shadow-lg" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save settings
        </Button>
      </div>
    </form>
  );
}
