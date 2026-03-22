import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, MoreVertical, Mail, Phone, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddStudentDialog } from "@/components/AddStudentDialog";
import { EditStudentDialog } from "@/components/EditStudentDialog";
import { toast } from "sonner";

export default function Students() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<any | null>(null);
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
      const { data, error } = await supabase.from("students").select("*, classes(name)").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase.from("students").update({ status }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status updated"); queryClient.invalidateQueries({ queryKey: ["students"] }); setSelected(new Set()); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("students").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-students"] });
      setDeleteTarget(null);
      setBulkDeleteOpen(false);
      setSelected(new Set());
    },
    onError: (e: any) => { toast.error(e.message); setDeleteTarget(null); setBulkDeleteOpen(false); },
  });

  const filtered = students.filter((s) => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    const className = (s.classes as any)?.name?.toLowerCase() ?? "";
    if (!name.includes(search.toLowerCase()) && !className.includes(search.toLowerCase())) return false;
    if (filterClass !== "all" && s.class_id !== filterClass) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(s => s.id)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all enrolled students</p>
        </div>
        <AddStudentDialog classes={classes} />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10 bg-card border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ ids: [...selected], status: "Active" })}>
            <UserCheck className="h-3.5 w-3.5 mr-1" /> Mark Active
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ ids: [...selected], status: "Inactive" })}>
            <UserX className="h-3.5 w-3.5 mr-1" /> Mark Inactive
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading students...</div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="p-4 w-10"><Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} /></th>
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
                    <tr key={student.id} className={`border-b last:border-0 hover:bg-secondary/30 transition-colors ${selected.has(student.id) ? "bg-primary/5" : ""}`}>
                      <td className="p-4"><Checkbox checked={selected.has(student.id)} onCheckedChange={() => toggleSelect(student.id)} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">{initials}</div>
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
                          {student.email && <a href={`mailto:${student.email}`} className="text-muted-foreground hover:text-foreground transition-colors"><Mail className="h-4 w-4" /></a>}
                          {student.phone && <a href={`tel:${student.phone}`} className="text-muted-foreground hover:text-foreground transition-colors"><Phone className="h-4 w-4" /></a>}
                        </div>
                      </td>
                      <td className="p-4"><Badge variant={student.status === "Active" ? "default" : "secondary"}>{student.status}</Badge></td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditStudent(student)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            {student.status !== "Active" ? (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ ids: [student.id], status: "Active" })}><UserCheck className="h-4 w-4 mr-2" /> Mark Active</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ ids: [student.id], status: "Inactive" })}><UserX className="h-4 w-4 mr-2" /> Mark Inactive</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget({ id: student.id, name: `${student.first_name} ${student.last_name}` })}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No students found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && deleteMutation.mutate([deleteTarget.id])} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} Students</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {selected.size} selected students? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMutation.mutate([...selected])} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : `Delete ${selected.size} Students`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editStudent && <EditStudentDialog student={editStudent} classes={classes} open={!!editStudent} onOpenChange={(open) => !open && setEditStudent(null)} />}
    </div>
  );
}
