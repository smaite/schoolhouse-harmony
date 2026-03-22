import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, X, Clock } from "lucide-react";

const classAttendance = [
  { name: "Sarah Johnson", rollNo: "1001", status: "present" },
  { name: "Michael Chen", rollNo: "1002", status: "present" },
  { name: "Emma Williams", rollNo: "1003", status: "absent" },
  { name: "James Brown", rollNo: "1004", status: "present" },
  { name: "Olivia Davis", rollNo: "1005", status: "late" },
  { name: "Liam Martinez", rollNo: "1006", status: "present" },
  { name: "Sophia Garcia", rollNo: "1007", status: "present" },
  { name: "Noah Wilson", rollNo: "1008", status: "absent" },
];

const classes = ["10-A", "10-B", "11-A", "11-B", "12-A", "9-A", "9-B"];

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [records, setRecords] = useState(classAttendance);

  const toggleStatus = (rollNo: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.rollNo === rollNo
          ? { ...r, status: r.status === "present" ? "absent" : r.status === "absent" ? "late" : "present" }
          : r
      )
    );
  };

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;

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

      {/* Class Tabs */}
      <div className="flex gap-2 flex-wrap">
        {classes.map((cls) => (
          <Button
            key={cls}
            variant={selectedClass === cls ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedClass(cls)}
          >
            {cls}
          </Button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success/10 mb-2">
            <Check className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-bold">{presentCount}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 mb-2">
            <X className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-2xl font-bold">{absentCount}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 mb-2">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <p className="text-2xl font-bold">{lateCount}</p>
          <p className="text-xs text-muted-foreground">Late</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roll No</th>
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.rollNo} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-4 text-sm font-medium">{r.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{r.rollNo}</td>
                <td className="p-4">
                  <Badge
                    variant={r.status === "present" ? "default" : r.status === "absent" ? "destructive" : "secondary"}
                  >
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Badge>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(r.rollNo)}>
                    Toggle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button>Save Attendance</Button>
      </div>
    </div>
  );
}
