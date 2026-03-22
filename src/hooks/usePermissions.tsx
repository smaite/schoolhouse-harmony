import { useAuth } from "@/contexts/AuthContext";

export function usePermissions() {
  const { isAdmin, roles } = useAuth();
  const isTeacher = roles.includes("teacher");

  return {
    isAdmin,
    isTeacher,
    canEdit: isAdmin,
    canDelete: isAdmin,
    canCreate: isAdmin,
    viewOnly: isTeacher && !isAdmin,
  };
}
