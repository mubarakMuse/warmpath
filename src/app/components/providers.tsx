"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans shadow-lg border-stone-200",
            title: "font-medium",
            description: "text-stone-600",
          },
        }}
      />
    </>
  );
}
