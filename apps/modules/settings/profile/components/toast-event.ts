"use client";

export function settingsToast(type: "success" | "error", message: string) {
  window.dispatchEvent(new CustomEvent("mediclinic:toast", { detail: { type, message } }));
}
