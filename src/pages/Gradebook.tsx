import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter } from "lucide-react";

const subjects = ["Mathematics", "English", "Science", "History", "Physics"];

const gradesData = [
  { student: "Sarah Johnson", rollNo: "1001", Mathematics: 92, English: 88, Science: 95, History: 85, Physics: 90 },
  { student: "Michael Chen", rollNo: "1002", Mathematics: 78, English: 82, Science: 88, History: 90, Physics: 85 },
  { student: "Emma Williams", rollNo: "1003", Mathematics: 95, English: 92, Science: 90, History: 88, Physics: 94 },
  { student: "James Brown", rollNo: "1004", Mathematics: 65, English: 70, Science: 72, History: 68, Physics: 60 },
  { student: "Olivia Davis", rollNo: "1005", Mathematics: 88, English: 94, Science: 86, History: 92, Physics: 82 },
  { student: "Liam Martinez", rollNo: "1006", Mathematics: 74, English: 78, Science: 80, History: 76, Physics: 70 },
  { student: "Sophia Garcia", rollNo: "1007", Mathematics: 82, English: 86, Science: 84, History: 80, Physics: 78 },
  { student: "Noah Wilson", rollNo: "1008", Mathematics: 70, English: 65, Science: 68, History: 72, Physics: 62 },
];

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
  const filtered = gradesData.filter((g) => g.student.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gradebook</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage student grades</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10 bg-card border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

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
              {filtered.map((row) => {
                const scores = subjects.map((s) => (row as any)[s] as number);
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                return (
                  <tr key={row.rollNo} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 sticky left-0 bg-card">
                      <p className="text-sm font-medium">{row.student}</p>
                      <p className="text-xs text-muted-foreground">{row.rollNo}</p>
                    </td>
                    {subjects.map((s) => {
                      const score = (row as any)[s] as number;
                      return (
                        <td key={s} className={`p-4 text-center text-sm ${getGradeColor(score)}`}>
                          {score}
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
    </div>
  );
}
