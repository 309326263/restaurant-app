"use client";

import { useEffect } from "react";
import { useUiStore } from "@/app/stores/uiStore";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const darkMode = useUiStore(
    (s) => s.darkMode
  );

  useEffect(() => {
    const html =
      document.documentElement;

    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  return <>{children}</>;
}