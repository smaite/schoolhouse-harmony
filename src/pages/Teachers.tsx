import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, MoreVertical, Mail, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddTeacherDialog } from "@/components/AddTeacherDialog";
import { EditTeacherDialog } from "@/components/EditTeacherDialog";
import { toast } from "sonner";

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTeacher, setEditTeacher] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("teachers").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status updated"); queryClient.invalidateQueries({ queryKey: ["teachers"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Teacher deleted");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-teachers"] });
      setDeleteTarget(null);
    },
    onError: (e: any) => { toast.error(e.message); setDeleteTarget(null); },
  });

  const filtered = teachers.filter((t) => {
    const name = `${t.first_name} ${t.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage faculty and staff</p>
        </div>
        <AddTeacherDialog />
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search teachers..." className="pl-10 bg-card border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading teachers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher) => {
            const initials = `${teacher.first_name[0]}${teacher.last_name[0]}`;
            const joinYear = new Date(teacher.join_date).getFullYear();
            const experience = new Date().getFullYear() - joinYear;
            return (
              <div key={teacher.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{initials}</div>
                    <div>
                      <p className="font-semibold text-sm">{teacher.first_name} {teacher.last_name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.department}</p>
                    </div>
                  </div>
                  <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subjects</span>
                    <span className="font-medium text-right">{teacher.subjects.join(", ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{experience} yrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Qualification</span>
                    <span className="font-medium">{teacher.qualification ?? "—"}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`mailto:${teacher.email}`}><Mail className="h-3.5 w-3.5 mr-1" /> Email</a>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTeacher(teacher)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {teacher.status !== "Active" ? (
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: teacher.id, status: "Active" })}>
                          <UserCheck className="h-4 w-4 mr-2" /> Mark Active
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: teacher.id, status: "On Leave" })}>
                          <UserX className="h-4 w-4 mr-2" /> Mark On Leave
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget({ id: teacher.id, name: `${teacher.first_name} ${teacher.last_name}` })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">No teachers found</div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      {editTeacher && (
        <EditTeacherDialog
          teacher={editTeacher}
          open={!!editTeacher}
          onOpenChange={(open) => !open && setEditTeacher(null)}
        />
      )}
    </div>
  );
}
