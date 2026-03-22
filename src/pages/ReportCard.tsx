import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Printer, FileText } from "lucide-react";

function getLetterGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default function ReportCard() {
  const [selectedId, setSelectedId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students-report"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*, classes(name)").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const selected = students.find((s) => s.id === selectedId) as any;

  const { data: grades = [] } = useQuery({
    queryKey: ["report-grades", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase.from("grades").select("*").eq("student_id", selectedId).order("subject");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["report-attendance", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*").eq("student_id", selectedId);
      if (error) throw error;
      return data;
    },
  });

  const { data: fees = [] } = useQuery({
    queryKey: ["report-fees", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase.from("fees").select("*").eq("student_id", selectedId);
      if (error) throw error;
      return data;
    },
  });

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const lateCount = attendance.filter((a) => a.status === "Late").length;
  const totalDays = attendance.length;
  const attendanceRate = totalDays ? Math.round((presentCount / totalDays) * 100) : 0;

  const totalFees = fees.reduce((s, f) => s + Number(f.amount), 0);
  const totalPaid = fees.reduce((s, f) => s + Number(f.paid), 0);
  const balance = totalFees - totalPaid;

  const subjectScores: Record<string, number[]> = {};
  grades.forEach((g) => {
    if (!subjectScores[g.subject]) subjectScores[g.subject] = [];
    subjectScores[g.subject].push(g.score);
  });
  const subjectAvgs = Object.entries(subjectScores).map(([subject, scores]) => ({
    subject,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    count: scores.length,
  })).sort((a, b) => a.subject.localeCompare(b.subject));

  const overallAvg = subjectAvgs.length
    ? Math.round(subjectAvgs.reduce((s, x) => s + x.avg, 0) / subjectAvgs.length)
    : 0;

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Report Card - ${selected?.first_name} ${selected?.last_name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f5f5; display: flex; justify-content: center; padding: 20px; }
        .report { width: 700px; background: white; border: 2px solid #1a365d; }
        .header { background: linear-gradient(135deg, #1a365d, #2a4a7f); color: white; padding: 24px 32px; text-align: center; }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header p { font-size: 12px; opacity: 0.8; }
        .info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 16px 32px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .info .label { color: #64748b; }
        .info .value { font-weight: 600; color: #1e293b; text-align: right; }
        .section { padding: 16px 32px; }
        .section-title { font-size: 14px; font-weight: 700; color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; }
        td { padding: 8px 12px; border: 1px solid #e2e8f0; }
        .grade-a { color: #16a34a; font-weight: 700; }
        .grade-b { color: #2563eb; font-weight: 600; }
        .grade-c { color: #d97706; font-weight: 600; }
        .grade-f { color: #dc2626; font-weight: 600; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
        .summary-box .num { font-size: 22px; font-weight: 700; color: #1a365d; }
        .summary-box .lbl { font-size: 11px; color: #64748b; margin-top: 2px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
        .overall { text-align: center; padding: 8px; margin-top: 8px; }
        .overall .big { font-size: 28px; font-weight: 800; color: #1a365d; }
        @media print { body { background: white; padding: 0; } .report { border: none; } }
      </style></head><body>${printRef.current.innerHTML}</body><script>window.onload=function(){window.print()}</script></html>`);
    w.document.close();
  };

  const gradeClass = (score: number) =>
    score >= 90 ? "grade-a" : score >= 80 ? "grade-b" : score >= 70 ? "grade-c" : "grade-f";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Report Card Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate printable student report cards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="Choose a student..." /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selected && (
              <Button onClick={handlePrint} className="w-full">
                <Printer className="h-4 w-4 mr-2" /> Print Report Card
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-center">
          {selected ? (
            <div ref={printRef}>
              <div className="report" style={{ width: 700, background: "white", border: "2px solid #1a365d", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, #1a365d, #2a4a7f)", color: "white", padding: "24px 32px", textAlign: "center" }}>
                  <h1 style={{ fontSize: 22, marginBottom: 4, fontWeight: 700 }}>Schoolers Academy</h1>
                  <p style={{ fontSize: 12, opacity: 0.8 }}>Student Report Card • Academic Year 2025–2026</p>
                </div>

                {/* Student Info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "16px 32px", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>Student Name</span>
                  <span style={{ fontWeight: 600, color: "#1e293b", textAlign: "right" }}>{selected.first_name} {selected.last_name}</span>
                  <span style={{ color: "#64748b" }}>Class</span>
                  <span style={{ fontWeight: 600, color: "#1e293b", textAlign: "right" }}>{selected.classes?.name ?? "—"}</span>
                  <span style={{ color: "#64748b" }}>Enrollment Date</span>
                  <span style={{ fontWeight: 600, color: "#1e293b", textAlign: "right" }}>{selected.enrollment_date}</span>
                  <span style={{ color: "#64748b" }}>Student ID</span>
                  <span style={{ fontWeight: 600, color: "#1e293b", textAlign: "right", fontFamily: "monospace" }}>{selected.id.slice(0, 8).toUpperCase()}</span>
                </div>

                {/* Grades */}
                <div style={{ padding: "16px 32px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a365d", borderBottom: "2px solid #1a365d", paddingBottom: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Academic Performance</div>
                  {subjectAvgs.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ background: "#f1f5f9", color: "#475569", fontWeight: 600, textAlign: "left", padding: "8px 12px", border: "1px solid #e2e8f0" }}>Subject</th>
                          <th style={{ background: "#f1f5f9", color: "#475569", fontWeight: 600, textAlign: "center", padding: "8px 12px", border: "1px solid #e2e8f0" }}>Average</th>
                          <th style={{ background: "#f1f5f9", color: "#475569", fontWeight: 600, textAlign: "center", padding: "8px 12px", border: "1px solid #e2e8f0" }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectAvgs.map((s) => (
                          <tr key={s.subject}>
                            <td style={{ padding: "8px 12px", border: "1px solid #e2e8f0" }}>{s.subject}</td>
                            <td style={{ padding: "8px 12px", border: "1px solid #e2e8f0", textAlign: "center" }}>{s.avg}%</td>
                            <td style={{ padding: "8px 12px", border: "1px solid #e2e8f0", textAlign: "center", fontWeight: 700, color: s.avg >= 90 ? "#16a34a" : s.avg >= 80 ? "#2563eb" : s.avg >= 70 ? "#d97706" : "#dc2626" }}>{getLetterGrade(s.avg)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 16 }}>No grades recorded</p>
                  )}
                  <div style={{ textAlign: "center", padding: 8, marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Overall Average</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#1a365d" }}>{overallAvg}% ({getLetterGrade(overallAvg)})</div>
                  </div>
                </div>

                {/* Attendance */}
                <div style={{ padding: "16px 32px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a365d", borderBottom: "2px solid #1a365d", paddingBottom: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Attendance Summary</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                    {[
                      { num: totalDays, lbl: "Total Days" },
                      { num: presentCount, lbl: "Present" },
                      { num: absentCount, lbl: "Absent" },
                      { num: `${attendanceRate}%`, lbl: "Rate" },
                    ].map((b) => (
                      <div key={b.lbl} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#1a365d" }}>{b.num}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{b.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fees */}
                <div style={{ padding: "16px 32px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a365d", borderBottom: "2px solid #1a365d", paddingBottom: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Fee Summary</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[
                      { num: `रू ${totalFees.toLocaleString()}`, lbl: "Total Fees" },
                      { num: `रू ${totalPaid.toLocaleString()}`, lbl: "Paid" },
                      { num: `रू ${balance.toLocaleString()}`, lbl: "Balance" },
                    ].map((b) => (
                      <div key={b.lbl} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: b.lbl === "Balance" && balance > 0 ? "#dc2626" : "#1a365d" }}>{b.num}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{b.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "16px 32px", textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
                  Generated on {new Date().toLocaleDateString()} • Schoolers Academy by Radium Tech
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">Select a student to generate their report card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
