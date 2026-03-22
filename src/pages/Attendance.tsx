import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Attendance() {
  const queryClient = useQueryClient();

  const { data: classes = [] } = useQuery({
    queryKey: ["attendance-classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const activeClassId = selectedClassId ?? classes[0]?.id ?? null;

  const today = new Date().toISOString().split("T")[0];

  const { data: studentsInClass = [] } = useQuery({
    queryKey: ["attendance-students", activeClassId],
    queryFn: async () => {
      if (!activeClassId) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .eq("class_id", activeClassId)
        .eq("status", "Active")
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: !!activeClassId,
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance-records", activeClassId, today],
    queryFn: async () => {
      if (!activeClassId) return [];
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("class_id", activeClassId)
        .eq("date", today);
      if (error) throw error;
      return data;
    },
    enabled: !!activeClassId,
  });

  const getStatus = (studentId: string) => {
    const record = attendanceRecords.find((r) => r.student_id === studentId);
    return record?.status ?? "Unmarked";
  };

  const upsertMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const existing = attendanceRecords.find((r) => r.student_id === studentId);
      if (existing) {
        const { error } = await supabase.from("attendance").update({ status }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance").insert({
          student_id: studentId,
          class_id: activeClassId!,
          date: today,
          status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records", activeClassId, today] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleStatus = (studentId: string) => {
    const current = getStatus(studentId);
    const next = current === "Present" ? "Absent" : current === "Absent" ? "Late" : "Present";
    upsertMutation.mutate({ studentId, status: next });
  };

  const presentCount = studentsInClass.filter((s) => getStatus(s.id) === "Present").length;
  const absentCount = studentsInClass.filter((s) => getStatus(s.id) === "Absent").length;
  const lateCount = studentsInClass.filter((s) => getStatus(s.id) === "Late").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Mark and manage daily attendance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {classes.map((cls) => (
          <Button key={cls.id} variant={activeClassId === cls.id ? "default" : "outline"} size="sm" onClick={() => setSelectedClassId(cls.id)}>
            {cls.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success/10 mb-2"><Check className="h-5 w-5 text-success" /></div>
          <p className="text-2xl font-bold">{presentCount}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 mb-2"><X className="h-5 w-5 text-destructive" /></div>
          <p className="text-2xl font-bold">{absentCount}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 mb-2"><Clock className="h-5 w-5 text-warning" /></div>
          <p className="text-2xl font-bold">{lateCount}</p>
          <p className="text-xs text-muted-foreground">Late</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {studentsInClass.map((s) => {
              const status = getStatus(s.id);
              return (
                <tr key={s.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{s.first_name} {s.last_name}</td>
                  <td className="p-4">
                    <Badge variant={status === "Present" ? "default" : status === "Absent" ? "destructive" : "secondary"}>
                      {status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(s.id)}>Toggle</Button>
                  </td>
                </tr>
              );
            })}
            {studentsInClass.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No students in this class</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
