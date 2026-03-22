import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Printer, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cardStyles = `
  body { margin: 0; padding: 20px; background: #f0f0f0; font-family: system-ui, sans-serif; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
  .card { width: 340px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); background: white; break-inside: avoid; }
  .card-header { background: linear-gradient(135deg, hsl(222 47% 31%), hsl(222 47% 45%)); color: white; padding: 20px; text-align: center; }
  .card-header h2 { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
  .card-header p { margin: 0; font-size: 11px; opacity: 0.8; }
  .avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; margin: 12px auto 0; object-fit: cover; }
  .avatar-placeholder { background: rgba(255,255,255,0.2); }
  .card-body { padding: 20px; }
  .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  .field:last-child { border-bottom: none; }
  .field-label { color: #888; }
  .field-value { font-weight: 600; color: #222; text-align: right; max-width: 60%; }
  .id-number { font-family: monospace; font-size: 11px; color: #666; margin-top: 8px; text-align: center; }
  .card-footer { background: #f8f8f8; padding: 12px 20px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #eee; }
  @media print { body { background: white; padding: 10px; } .card { box-shadow: none; border: 1px solid #ddd; } }
`;

function renderCardHtml(person: any, type: "student" | "teacher") {
  const initials = `${person.first_name[0]}${person.last_name[0]}`;
  const avatarHtml = person.avatar_url
    ? `<img class="avatar" src="${person.avatar_url}" alt="${person.first_name}" />`
    : `<div class="avatar avatar-placeholder">${initials}</div>`;

  const fieldsHtml = type === "student"
    ? `
      <div class="field"><span class="field-label">Name</span><span class="field-value">${person.first_name} ${person.last_name}</span></div>
      <div class="field"><span class="field-label">Class</span><span class="field-value">${person.classes?.name ?? "—"}</span></div>
      <div class="field"><span class="field-label">DOB</span><span class="field-value">${person.date_of_birth ?? "—"}</span></div>
      <div class="field"><span class="field-label">Blood Group</span><span class="field-value">${person.blood_group ?? "—"}</span></div>
      <div class="field"><span class="field-label">Parent</span><span class="field-value">${person.parent_name ?? "—"}</span></div>
      <div class="field"><span class="field-label">Phone</span><span class="field-value">${person.parent_phone ?? person.phone ?? "—"}</span></div>
    `
    : `
      <div class="field"><span class="field-label">Name</span><span class="field-value">${person.first_name} ${person.last_name}</span></div>
      <div class="field"><span class="field-label">Department</span><span class="field-value">${person.department}</span></div>
      <div class="field"><span class="field-label">Subjects</span><span class="field-value">${person.subjects?.join(", ") ?? "—"}</span></div>
      <div class="field"><span class="field-label">Qualification</span><span class="field-value">${person.qualification ?? "—"}</span></div>
      <div class="field"><span class="field-label">Phone</span><span class="field-value">${person.phone ?? "—"}</span></div>
    `;

  return `
    <div class="card">
      <div class="card-header">
        <h2>Schoolers Academy</h2>
        <p>${type === "student" ? "Student ID Card" : "Faculty ID Card"}</p>
        ${avatarHtml}
      </div>
      <div class="card-body">
        ${fieldsHtml}
        <div class="id-number">ID: ${person.id.slice(0, 8).toUpperCase()}</div>
      </div>
      <div class="card-footer">Schoolers Academy • ${person.email ?? ""} • ${person.phone ?? ""}</div>
    </div>
  `;
}

function openPrintWindow(html: string, title: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`<html><head><title>${title}</title><style>${cardStyles}</style></head><body>${html}</body><script>window.onload=function(){window.print();}</script></html>`);
  printWindow.document.close();
}

export default function IDCards() {
  const [selectedId, setSelectedId] = useState("");
  const [cardType, setCardType] = useState<"student" | "teacher">("student");
  const [selectedClassId, setSelectedClassId] = useState("");
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

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-id"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const people = cardType === "student" ? students : teachers;
  const selected = people.find((p: any) => p.id === selectedId) as any;

  const handlePrintSingle = () => {
    if (!selected) return;
    openPrintWindow(renderCardHtml(selected, cardType), `ID Card - ${selected.first_name} ${selected.last_name}`);
  };

  const handlePrintClass = () => {
    if (!selectedClassId) return;
    const classStudents = students.filter((s: any) => s.class_id === selectedClassId);
    if (classStudents.length === 0) return;
    const html = classStudents.map((s: any) => renderCardHtml(s, "student")).join("");
    const cls = classes.find(c => c.id === selectedClassId);
    openPrintWindow(html, `Class ${cls?.name} ID Cards`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ID Card Maker</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and print student/teacher ID cards</p>
        </div>
      </div>

      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="individual"><CreditCard className="h-4 w-4 mr-2" /> Individual</TabsTrigger>
          <TabsTrigger value="class"><Users className="h-4 w-4 mr-2" /> Whole Class</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <Button onClick={handlePrintSingle} className="w-full">
                  <Printer className="h-4 w-4 mr-2" /> Print ID Card
                </Button>
              )}
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              {selected ? (
                <div ref={printRef}>
                  <div style={{ width: 340, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", background: "white" }}>
                    <div style={{ background: "linear-gradient(135deg, hsl(222 47% 31%), hsl(222 47% 45%))", color: "white", padding: 20, textAlign: "center" }}>
                      <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Schoolers Academy</h2>
                      <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{cardType === "student" ? "Student ID Card" : "Faculty ID Card"}</p>
                      {selected.avatar_url ? (
                        <img src={selected.avatar_url} alt={selected.first_name} style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid white", objectFit: "cover", margin: "12px auto 0", display: "block" }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", margin: "12px auto 0" }}>
                          {selected.first_name[0]}{selected.last_name[0]}
                        </div>
                      )}
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
                            <span style={{ color: "#888" }}>DOB</span>
                            <span style={{ fontWeight: 600, color: "#222" }}>{selected.date_of_birth ?? "—"}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                            <span style={{ color: "#888" }}>Blood Group</span>
                            <span style={{ fontWeight: 600, color: "#222" }}>{selected.blood_group ?? "—"}</span>
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
        </TabsContent>

        <TabsContent value="class">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger><SelectValue placeholder="Choose a class..." /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClassId && (
              <>
                <p className="text-sm text-muted-foreground">
                  {students.filter((s: any) => s.class_id === selectedClassId).length} students in this class
                </p>
                <Button onClick={handlePrintClass} className="w-full" disabled={students.filter((s: any) => s.class_id === selectedClassId).length === 0}>
                  <Printer className="h-4 w-4 mr-2" /> Print All Class ID Cards
                </Button>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
