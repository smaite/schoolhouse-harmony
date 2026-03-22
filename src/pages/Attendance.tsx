import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Check, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function Attendance() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split("T")[0]);

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

  const { data: studentsInClass = [] } = useQuery({
    queryKey: ["attendance-students", activeClassId],
    queryFn: async () => {
      if (!activeClassId) return [];
      const { data, error } = await supabase.from("students").select("id, first_name, last_name")
        .eq("class_id", activeClassId).eq("status", "Active").order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: !!activeClassId,
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance-records", activeClassId, selectedDate],
    queryFn: async () => {
      if (!activeClassId) return [];
      const { data, error } = await supabase.from("attendance").select("*")
        .eq("class_id", activeClassId).eq("date", selectedDate);
      if (error) throw error;
      return data;
    },
    enabled: !!activeClassId,
  });

  // Monthly summary for calendar dots
  const monthStart = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
  const monthEnd = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${getDaysInMonth(calYear, calMonth)}`;
  const { data: monthlySummary = [] } = useQuery({
    queryKey: ["attendance-monthly", activeClassId, calYear, calMonth],
    queryFn: async () => {
      if (!activeClassId) return [];
      const { data, error } = await supabase.from("attendance").select("date, status")
        .eq("class_id", activeClassId).gte("date", monthStart).lte("date", monthEnd);
      if (error) throw error;
      return data;
    },
    enabled: !!activeClassId,
  });

  const getDateSummary = (date: string) => {
    const records = monthlySummary.filter(r => r.date === date);
    if (records.length === 0) return null;
    const present = records.filter(r => r.status === "Present").length;
    const absent = records.filter(r => r.status === "Absent").length;
    return { present, absent, total: records.length };
  };

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
          student_id: studentId, class_id: activeClassId!, date: selectedDate, status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records", activeClassId, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["attendance-monthly", activeClassId, calYear, calMonth] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleStatus = (studentId: string) => {
    const current = getStatus(studentId);
    const next = current === "Present" ? "Absent" : current === "Absent" ? "Late" : "Present";
    upsertMutation.mutate({ studentId, status: next });
  };

  const markAllStatus = (status: string) => {
    studentsInClass.forEach(s => upsertMutation.mutate({ studentId: s.id, status }));
  };

  const presentCount = studentsInClass.filter((s) => getStatus(s.id) === "Present").length;
  const absentCount = studentsInClass.filter((s) => getStatus(s.id) === "Absent").length;
  const lateCount = studentsInClass.filter((s) => getStatus(s.id) === "Late").length;

  // Calendar rendering
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Mark and manage daily attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activeClassId ?? ""} onValueChange={v => setSelectedClassId(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="font-semibold text-sm">{monthNames[calMonth]} {calYear}</h3>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map(d => <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</div>)}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === now.toISOString().split("T")[0];
              const summary = getDateSummary(dateStr);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative h-9 w-full rounded-lg text-xs font-medium transition-all
                    ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary"}
                    ${isToday && !isSelected ? "ring-1 ring-primary" : ""}`}
                >
                  {day}
                  {summary && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full
                      ${summary.absent > 0 ? "bg-destructive" : "bg-success"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attendance marking */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => markAllStatus("Present")} className="text-xs">
                <Check className="h-3 w-3 mr-1" /> All Present
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAllStatus("Absent")} className="text-xs">
                <X className="h-3 w-3 mr-1" /> All Absent
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-3 text-center">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-success/10 mb-1"><Check className="h-4 w-4 text-success" /></div>
              <p className="text-xl font-bold">{presentCount}</p>
              <p className="text-[10px] text-muted-foreground">Present</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-center">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 mb-1"><X className="h-4 w-4 text-destructive" /></div>
              <p className="text-xl font-bold">{absentCount}</p>
              <p className="text-[10px] text-muted-foreground">Absent</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-center">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-warning/10 mb-1"><Clock className="h-4 w-4 text-warning" /></div>
              <p className="text-xl font-bold">{lateCount}</p>
              <p className="text-[10px] text-muted-foreground">Late</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsInClass.map((s) => {
                  const status = getStatus(s.id);
                  return (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-3 text-sm font-medium">{s.first_name} {s.last_name}</td>
                      <td className="p-3">
                        <Badge variant={status === "Present" ? "default" : status === "Absent" ? "destructive" : status === "Late" ? "secondary" : "outline"}>
                          {status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant={status === "Present" ? "default" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => upsertMutation.mutate({ studentId: s.id, status: "Present" })}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button variant={status === "Absent" ? "destructive" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => upsertMutation.mutate({ studentId: s.id, status: "Absent" })}>
                            <X className="h-3 w-3" />
                          </Button>
                          <Button variant={status === "Late" ? "secondary" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => upsertMutation.mutate({ studentId: s.id, status: "Late" })}>
                            <Clock className="h-3 w-3" />
                          </Button>
                        </div>
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
      </div>
    </div>
  );
}
