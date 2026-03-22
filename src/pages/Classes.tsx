import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddClassDialog } from "@/components/AddClassDialog";
import { usePermissions } from "@/hooks/usePermissions";

export default function Classes() {
  const { canCreate } = usePermissions();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*, teachers(first_name, last_name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: studentCounts = {} } = useQuery({
    queryKey: ["class-student-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("class_id")
        .eq("status", "Active");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((s) => {
        if (s.class_id) counts[s.class_id] = (counts[s.class_id] ?? 0) + 1;
      });
      return counts;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage classes and sections</p>
        </div>
        {canCreate && <AddClassDialog />}
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading classes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((cls) => {
            const teacher = cls.teachers as any;
            const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unassigned";
            const count = (studentCounts as Record<string, number>)[cls.id] ?? 0;
            return (
              <div key={cls.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{cls.name}</h3>
                  <Badge variant="outline">Room {cls.room ?? "—"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Class Teacher: {teacherName}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{count} Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{cls.num_subjects} Subjects</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{cls.schedule ?? ""}</p>
              </div>
            );
          })}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">No classes yet. Create one to get started.</div>
          )}
        </div>
      )}
    </div>
  );
}
