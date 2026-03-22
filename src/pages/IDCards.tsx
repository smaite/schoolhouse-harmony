import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Printer, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function IDCards() {
  const [selectedId, setSelectedId] = useState("");
  const [cardType, setCardType] = useState<"student" | "teacher">("student");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students-id"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*, classes(name)").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-id"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const people = cardType === "student" ? students : teachers;
  const selected = people.find((p: any) => p.id === selectedId) as any;

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${selected?.first_name} ${selected?.last_name}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: system-ui, sans-serif; }
            .card { width: 340px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); background: white; }
            .card-header { background: linear-gradient(135deg, hsl(222 47% 31%), hsl(222 47% 45%)); color: white; padding: 20px; text-align: center; }
            .card-header h2 { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
            .card-header p { margin: 0; font-size: 11px; opacity: 0.8; }
            .avatar { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; margin: 12px auto 0; }
            .card-body { padding: 20px; }
            .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
            .field:last-child { border-bottom: none; }
            .field-label { color: #888; }
            .field-value { font-weight: 600; color: #222; }
            .card-footer { background: #f8f8f8; padding: 12px 20px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #eee; }
            .id-number { font-family: monospace; font-size: 11px; color: #666; margin-top: 8px; }
            @media print { body { background: white; } .card { box-shadow: none; border: 1px solid #ddd; } }
          </style>
        </head>
        <body>${printRef.current.innerHTML}</body>
        <script>window.onload = function() { window.print(); }</script>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ID Card Maker</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and print student/teacher ID cards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select value={cardType} onValueChange={(v) => { setCardType(v as any); setSelectedId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student ID</SelectItem>
                  <SelectItem value="teacher">Teacher ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select {cardType === "student" ? "Student" : "Teacher"}</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder={`Choose a ${cardType}...`} /></SelectTrigger>
                <SelectContent>
                  {people.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selected && (
              <Button onClick={handlePrint} className="w-full">
                <Printer className="h-4 w-4 mr-2" /> Print ID Card
              </Button>
            )}
          </div>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center">
          {selected ? (
            <div ref={printRef}>
              <div className="card" style={{ width: 340, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", background: "white" }}>
                <div style={{ background: "linear-gradient(135deg, hsl(222 47% 31%), hsl(222 47% 45%))", color: "white", padding: 20, textAlign: "center" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Schoolers Academy</h2>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{cardType === "student" ? "Student ID Card" : "Faculty ID Card"}</p>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", margin: "12px auto 0" }}>
                    {selected.first_name[0]}{selected.last_name[0]}
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                    <span style={{ color: "#888" }}>Name</span>
                    <span style={{ fontWeight: 600, color: "#222" }}>{selected.first_name} {selected.last_name}</span>
                  </div>
                  {cardType === "student" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                        <span style={{ color: "#888" }}>Class</span>
                        <span style={{ fontWeight: 600, color: "#222" }}>{selected.classes?.name ?? "—"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                        <span style={{ color: "#888" }}>Enrolled</span>
                        <span style={{ fontWeight: 600, color: "#222" }}>{selected.enrollment_date}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
                        <span style={{ color: "#888" }}>Parent</span>
                        <span style={{ fontWeight: 600, color: "#222" }}>{selected.parent_name ?? "—"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                        <span style={{ color: "#888" }}>Department</span>
                        <span style={{ fontWeight: 600, color: "#222" }}>{selected.department}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                        <span style={{ color: "#888" }}>Subjects</span>
                        <span style={{ fontWeight: 600, color: "#222", textAlign: "right" }}>{selected.subjects?.join(", ")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
                        <span style={{ color: "#888" }}>Qualification</span>
                        <span style={{ fontWeight: 600, color: "#222" }}>{selected.qualification ?? "—"}</span>
                      </div>
                    </>
                  )}
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", marginTop: 8, textAlign: "center" }}>
                    ID: {selected.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
                <div style={{ background: "#f8f8f8", padding: "12px 20px", textAlign: "center", fontSize: 10, color: "#888", borderTop: "1px solid #eee" }}>
                  Schoolers Academy • {selected.email ?? ""} • {selected.phone ?? ""}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">Select a {cardType} to preview the ID card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
