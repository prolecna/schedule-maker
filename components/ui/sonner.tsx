"use client";

import { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { InfoIcon, Loader2Icon, OctagonXIcon, ThumbsUpIcon, TriangleAlertIcon } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <ThumbsUpIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "hsl(var(--accent))",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "hsl(var(--accent))",
          "--border-radius": "var(--radius)",
          "--width": "300px",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
