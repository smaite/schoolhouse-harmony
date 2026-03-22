import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type RoleOption = "admin" | "teacher" | "none";

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: userRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const rolesByUserId = useMemo(() => {
    const map = new Map<string, "admin" | "teacher">();
    userRoles.forEach((roleRow) => {
      const current = map.get(roleRow.user_id);
      if (!current || roleRow.role === "admin") {
        map.set(roleRow.user_id, roleRow.role);
      }
    });
    return map;
  }, [userRoles]);

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: RoleOption }) => {
      const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (deleteError) throw deleteError;

      if (role !== "none") {
        const { error: insertError } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (insertError) throw insertError;
      }
    },
    onSuccess: async () => {
      toast.success("Role updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Failed to update role");
    },
  });

  if (!isAdmin) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Only admins can access this page.</p>
      </div>
    );
  }

  const isLoading = loadingProfiles || loadingRoles;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user roles and access</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Role Management
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading users...</div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="w-[220px]">Assign Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => {
                const role = rolesByUserId.get(profile.id) ?? "none";
                const isCurrentUser = profile.id === user?.id;
                const isUpdating = updatingUserId === profile.id && assignRoleMutation.isPending;

                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{profile.display_name}</span>
                        {isCurrentUser && <Badge variant="secondary">You</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{profile.id}</TableCell>
                    <TableCell>
                      <Badge variant={role === "admin" ? "default" : "secondary"}>
                        {role === "none" ? "No role" : role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={role}
                        onValueChange={(value) => {
                          setUpdatingUserId(profile.id);
                          assignRoleMutation.mutate(
                            { userId: profile.id, role: value as RoleOption },
                            { onSettled: () => setUpdatingUserId(null) },
                          );
                        }}
                        disabled={isUpdating}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="none">No role</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
              {profiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No registered users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
