import { useAuth } from "@/contexts/AuthContext";

export function usePermissions() {
  const { isAdmin, roles } = useAuth();
  const isTeacher = roles.includes("teacher");
  // If user has no roles assigned yet, grant full access (first user / setup scenario)
  const hasNoRoles = roles.length === 0;
  const hasFullAccess = isAdmin || hasNoRoles;

  return {
    isAdmin: hasFullAccess,
    isTeacher,
    canEdit: hasFullAccess,
    canDelete: hasFullAccess,
    canCreate: hasFullAccess,
    viewOnly: isTeacher && !isAdmin && !hasNoRoles,
  };
}
