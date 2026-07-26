"use client";

import { BookOpenText, Feather, Repeat2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { roleOptions, type UserRole } from "../domain/user-role";

const roleIcons = {
  writer: Feather,
  reader: BookOpenText,
  both: Repeat2,
};

type RolePickerProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  compact?: boolean;
};

export function RolePicker({ value, onChange, compact = false }: RolePickerProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as UserRole)}
      className={cn("grid gap-3", compact ? "md:grid-cols-3" : "")}
    >
      {roleOptions.map((option) => {
        const Icon = roleIcons[option.value];

        return (
          <Label
            key={option.value}
            htmlFor={`role-${option.value}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 border bg-card p-4 transition-colors hover:bg-muted/60",
              value === option.value && "border-primary bg-primary/[0.04]",
            )}
          >
            <RadioGroupItem
              id={`role-${option.value}`}
              value={option.value}
              className="mt-0.5"
            />
            <Icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <span className="min-w-0 space-y-1">
              <span className="block text-sm font-medium text-foreground">
                {option.label}
              </span>
              <span className="block text-xs font-normal leading-5 text-muted-foreground">
                {option.description}
              </span>
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
