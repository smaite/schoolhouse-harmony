import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter } from "lucide-react";

function getGradeColor(score: number) {
  if (score >= 90) return "text-success font-bold";
  if (score >= 80) return "text-info font-semibold";
  if (score >= 70) return "text-warning font-medium";
  return "text-destructive font-medium";
}

function getLetterGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default function Gradebook() {
  const [search, setSearch] = useState("");

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ["gradebook"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("*, students(first_name, last_name)")
        .order("subject");
      if (error) throw error;
      return data;
    },
  });

  // Group grades by student
  const studentMap = new Map<string, { name: string; grades: Record<string, number> }>();
  grades.forEach((g) => {
    const student = g.students as any;
    if (!student) return;
    const name = `${student.first_name} ${student.last_name}`;
    if (!studentMap.has(g.student_id)) {
      studentMap.set(g.student_id, { name, grades: {} });
    }
    studentMap.get(g.student_id)!.grades[g.subject] = g.score;
  });

  const subjects = [...new Set(grades.map((g) => g.subject))].sort();

  const studentRows = [...studentMap.entries()]
    .filter(([, val]) => val.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gradebook</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage student grades</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10 bg-card border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading grades...</div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 bg-secondary/50">Student</th>
                  {subjects.map((s) => (
                    <th key={s} className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s}</th>
                  ))}
                  <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average</th>
                  <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map(([id, { name, grades: sg }]) => {
                  const scores = subjects.map((s) => sg[s]).filter(Boolean);
                  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                  return (
                    <tr key={id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 sticky left-0 bg-card">
                        <p className="text-sm font-medium">{name}</p>
                      </td>
                      {subjects.map((s) => {
                        const score = sg[s];
                        return (
                          <td key={s} className={`p-4 text-center text-sm ${score ? getGradeColor(score) : "text-muted-foreground"}`}>
                            {score ?? "—"}
                          </td>
                        );
                      })}
                      <td className={`p-4 text-center text-sm ${getGradeColor(avg)}`}>{avg}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          avg >= 90 ? "bg-success/10 text-success" :
                          avg >= 80 ? "bg-info/10 text-info" :
                          avg >= 70 ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {getLetterGrade(avg)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
