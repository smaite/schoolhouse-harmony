import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Banknote, AlertCircle, Plus, Settings2, Trash2 } from "lucide-react";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";

const statusVariant: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Partial: "bg-warning/10 text-warning",
  Unpaid: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/10 text-destructive",
};

function formatNPR(amount: number) {
  return `रू ${amount.toLocaleString("en-NP")}`;
}

export default function Fees() {
  const { canCreate } = usePermissions();
  const qc = useQueryClient();

  // Fee templates tab
  const [templateOpen, setTemplateOpen] = useState(false);
  const [tClassId, setTClassId] = useState("");
  const [tFeeType, setTFeeType] = useState("");
  const [tAmount, setTAmount] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["class-fee-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("class_fee_templates").select("*, classes(name)").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*, students(first_name, last_name, classes(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addTemplateMutation = useMutation({
    mutationFn: async () => {
      if (!tClassId || !tFeeType.trim() || !tAmount) throw new Error("All fields required");
      const { error } = await supabase.from("class_fee_templates").insert({
        class_id: tClassId,
        fee_type: tFeeType.trim(),
        amount: parseFloat(tAmount),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fee template added");
      qc.invalidateQueries({ queryKey: ["class-fee-templates"] });
      setTemplateOpen(false);
      setTClassId(""); setTFeeType(""); setTAmount("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("class_fee_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted");
      qc.invalidateQueries({ queryKey: ["class-fee-templates"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalCollected = fees.reduce((s, f) => s + Number(f.paid), 0);
  const totalPending = fees.reduce((s, f) => s + (Number(f.amount) - Number(f.paid)), 0);
  const overdueCount = fees.filter((f) => f.status === "Overdue").length;

  // Get unique fee types from templates for RecordPaymentDialog
  const customFeeTypes = [...new Set(templates.map((t: any) => t.fee_type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fees</h1>
          <p className="text-sm text-muted-foreground mt-1">Track fee payments and dues</p>
        </div>
        {canCreate && <RecordPaymentDialog customFeeTypes={customFeeTypes} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Collected" value={formatNPR(totalCollected)} icon={<Banknote className="h-5 w-5 text-success" />} iconBg="bg-success/10" change="Live data" changeType="positive" />
        <StatCard title="Pending Amount" value={formatNPR(totalPending)} icon={<CreditCard className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" change={`${fees.filter(f => f.status !== "Paid").length} invoices`} changeType="negative" />
        <StatCard title="Overdue Invoices" value={overdueCount.toString()} icon={<AlertCircle className="h-5 w-5 text-destructive" />} iconBg="bg-destructive/10" change="Needs attention" changeType="negative" />
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="templates"><Settings2 className="h-4 w-4 mr-1" /> Fee Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading fees...</div>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => {
                    const student = fee.students as any;
                    const name = student ? `${student.first_name} ${student.last_name}` : "—";
                    const className = student?.classes?.name ?? "—";
                    return (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>{className}</TableCell>
                        <TableCell>{fee.fee_type}</TableCell>
                        <TableCell className="text-right">{formatNPR(Number(fee.amount))}</TableCell>
                        <TableCell className="text-right">{formatNPR(Number(fee.paid))}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusVariant[fee.status] ?? ""}`}>
                            {fee.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{fee.due_date ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Define fee types and amounts per class. Custom types (e.g. "Picnic Fee", "Lab Fee") are saved here for easy tracking.</p>
              {canCreate && (
                <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Fee Type</Button></DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Class Fee Type</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); addTemplateMutation.mutate(); }} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Class *</Label>
                        <Select value={tClassId} onValueChange={setTClassId}>
                          <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                          <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fee Type Name *</Label>
                        <Input value={tFeeType} onChange={(e) => setTFeeType(e.target.value)} placeholder="e.g. Picnic Fee, Lab Fee, Tuition" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (NPR) *</Label>
                        <Input type="number" min="0" step="0.01" value={tAmount} onChange={(e) => setTAmount(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full" disabled={addTemplateMutation.isPending}>
                        {addTemplateMutation.isPending ? "Adding..." : "Add Fee Type"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount (NPR)</TableHead>
                    {canCreate && <TableHead className="w-10"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{(t.classes as any)?.name ?? "—"}</TableCell>
                      <TableCell>{t.fee_type}</TableCell>
                      <TableCell className="text-right">{formatNPR(Number(t.amount))}</TableCell>
                      {canCreate && (
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => deleteTemplateMutation.mutate(t.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {templates.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No fee templates defined yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
