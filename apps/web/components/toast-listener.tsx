"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

type ToastDetail = {
  type: "success" | "error";
  message: string;
};

export function ToastListener() {
  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;
      if (detail.type === "success") toast.success(detail.message);
      else toast.error(detail.message);
    }

    window.addEventListener("mediclinic:toast", handleToast);
    return () => window.removeEventListener("mediclinic:toast", handleToast);
  }, []);

  return null;
}
