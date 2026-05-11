import { useMemo } from "react";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useAdultDate(minAge = 18) {
  const maxDateOfBirth = useMemo(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - minAge);

    return formatDateInput(today);
  }, [minAge]);

  function toDateInputValue(date?: Date | string) {
    if (!date) return "";

    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    return formatDateInput(new Date(date));
  }

  return {
    maxDateOfBirth,
    toDateInputValue,
  };
}