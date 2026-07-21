export const userRoles = ["reader", "writer", "both"] as const;

export type UserRole = (typeof userRoles)[number];

export const roleOptions: Array<{
  value: UserRole;
  label: string;
  description: string;
}> = [
  {
    value: "writer",
    label: "Writer",
    description: "Share manuscripts, invite readers, and review feedback.",
  },
  {
    value: "reader",
    label: "Reader",
    description: "Read manuscripts and leave structured annotations.",
  },
  {
    value: "both",
    label: "Writer & reader",
    description: "Use both workspaces and switch whenever you need.",
  },
];

export function canRead(role: UserRole) {
  return role === "reader" || role === "both";
}

export function canWrite(role: UserRole) {
  return role === "writer" || role === "both";
}

export function getRoleLabel(role: UserRole) {
  return roleOptions.find((option) => option.value === role)?.label ?? role;
}
