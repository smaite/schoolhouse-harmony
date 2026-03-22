import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, MoreVertical, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddStudentDialog } from "@/components/AddStudentDialog";
import { toast } from "sonner";

export default function Students() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, classes(name)")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("students").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Student updated");
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: any) => toast.error(error.message ?? "Failed to update student"),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Student deleted");
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-students"] });
    },
    onError: (error: any) => toast.error(error.message ?? "Failed to delete student"),
  });

  const filtered = students.filter((s) => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    const className = (s.classes as any)?.name?.toLowerCase() ?? "";
    return name.includes(search.toLowerCase()) || className.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all enrolled students</p>
        </div>
        <AddStudentDialog classes={classes} />
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10 bg-card border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading students...</div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enrolled</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => {
                  const initials = `${student.first_name[0]}${student.last_name[0]}`;
                  return (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium">{(student.classes as any)?.name ?? "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{student.enrollment_date}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <a href={student.email ? `mailto:${student.email}` : undefined} className="text-muted-foreground hover:text-foreground transition-colors" aria-disabled={!student.email}>
                            <Mail className="h-4 w-4" />
                          </a>
                          <a href={student.phone ? `tel:${student.phone}` : undefined} className="text-muted-foreground hover:text-foreground transition-colors" aria-disabled={!student.phone}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={student.status === "Active" ? "default" : "secondary"}>{student.status}</Badge>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {student.status !== "Active" ? (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: student.id, status: "Active" })}>
                                Mark as Active
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: student.id, status: "Inactive" })}>
                                Mark as Inactive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteStudentMutation.mutate(student.id)}
                            >
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
