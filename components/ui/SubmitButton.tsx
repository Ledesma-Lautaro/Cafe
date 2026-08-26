"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import type { ComponentProps } from "react";

export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}