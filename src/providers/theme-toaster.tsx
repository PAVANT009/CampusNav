"use client";

import { useTheme } from "next-themes";
import { GoeyToaster } from "@/components/ui/goey-toaster";

export function ThemeToaster() {
  const { resolvedTheme } = useTheme();

  const invertedTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <GoeyToaster position="top-right" duration={4000} theme={invertedTheme} />
  );
}
