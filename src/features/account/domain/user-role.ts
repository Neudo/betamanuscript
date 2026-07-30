export const workspaceRoles = ["reader", "writer", "both"] as const;

export const userRoles = workspaceRoles;

export type WorkspaceRole = (typeof workspaceRoles)[number];
export type UserRole = WorkspaceRole | "super_admin";

export const roleOptions: Array<{
  value: WorkspaceRole;
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
  if (role === "super_admin") return "Super admin";

  return roleOptions.find((option) => option.value === role)?.label ?? role;
}

export function getWorkspaceHome(role: UserRole) {
  return role === "reader" ? "/reader" : "/dashboard";
}
