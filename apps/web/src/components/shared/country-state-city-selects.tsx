"use client";

import { City, Country, State } from "country-state-city";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type LocationValue = {
  country?: string | null;
  state?: string | null;
  city?: string | null;
};

type CountryStateCitySelectsProps = {
  fieldId: string;
  defaultValue?: LocationValue;
  className?: string;
  countryName?: string;
  stateName?: string;
  cityName?: string;
};

type SearchableLocationSelectProps = {
  disabled?: boolean;
  emptyText: string;
  id: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  value: string;
};

function getInitialCountryCode(defaultValue: LocationValue | undefined) {
  return (
    Country.getAllCountries().find((country) => country.name === defaultValue?.country)?.isoCode ??
    ""
  );
}

function getInitialStateCode(defaultValue: LocationValue | undefined, countryCode: string) {
  return (
    State.getStatesOfCountry(countryCode).find((state) => state.name === defaultValue?.state)
      ?.isoCode ?? ""
  );
}

function SearchableLocationSelect({
  disabled = false,
  emptyText,
  id,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  value,
}: SearchableLocationSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="h-9 w-full justify-between px-3 font-normal"
          disabled={disabled}
          id={id}
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CountryStateCitySelects({
  cityName = "city",
  className = "grid gap-3 sm:grid-cols-3",
  countryName = "country",
  defaultValue,
  fieldId,
  stateName = "state",
}: CountryStateCitySelectsProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState(() =>
    getInitialCountryCode(defaultValue),
  );
  const [selectedStateCode, setSelectedStateCode] = useState(() =>
    getInitialStateCode(defaultValue, getInitialCountryCode(defaultValue)),
  );
  const [selectedCity, setSelectedCity] = useState(defaultValue?.city ?? "");

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
  const countryOptions = useMemo(
    () => countries.map((country) => ({ label: country.name, value: country.isoCode })),
    [countries],
  );
  const stateOptions = useMemo(
    () => states.map((stateItem) => ({ label: stateItem.name, value: stateItem.isoCode })),
    [states],
  );
  const cityOptions = useMemo(
    () => cities.map((city) => ({ label: city.name, value: city.name })),
    [cities],
  );

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
    <div className={className}>
      <input type="hidden" name={countryName} value={selectedCountry?.name ?? ""} readOnly />
      <input type="hidden" name={stateName} value={selectedState?.name ?? ""} readOnly />
      <input type="hidden" name={cityName} value={selectedCity} readOnly />

      <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-country`}>
        Country
        <SearchableLocationSelect
          id={`${fieldId}-country`}
          value={selectedCountryCode}
          options={countryOptions}
          placeholder="Select country"
          searchPlaceholder="Search country..."
          emptyText="No country found."
          onValueChange={onCountryChange}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-state`}>
        State
        <SearchableLocationSelect
          id={`${fieldId}-state`}
          value={selectedStateCode}
          options={stateOptions}
          disabled={!selectedCountryCode || states.length === 0}
          placeholder="Select state"
          searchPlaceholder="Search state..."
          emptyText="No state found."
          onValueChange={onStateChange}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-city`}>
        City
        <SearchableLocationSelect
          id={`${fieldId}-city`}
          value={selectedCity}
          options={cityOptions}
          disabled={!selectedStateCode || cities.length === 0}
          placeholder="Select city"
          searchPlaceholder="Search city..."
          emptyText="No city found."
          onValueChange={setSelectedCity}
        />
      </label>
    </div>
  );
}
