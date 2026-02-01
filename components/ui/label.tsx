"use client";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ComponentPropsWithoutRef, forwardRef, Ref } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = forwardRef(
  (
    { className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    ref: Ref<any>,
  ) => <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />,
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
