import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import { toast } from "sonner";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const statusColors: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Partial: "bg-muted text-muted-foreground",
};

export default function Salaries() {
  const [open, setOpen] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("0");
  const [deductions, setDeductions] = useState("0");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const queryClient = useQueryClient();

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-list-salary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("id, first_name, last_name").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ["salaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_salaries")
        .select("*, teachers(first_name, last_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!teacherId || !baseSalary) throw new Error("Teacher and base salary required");
      const { error } = await supabase.from("teacher_salaries").insert({
        teacher_id: teacherId,
        month,
        year: parseInt(year),
        base_salary: parseFloat(baseSalary),
        bonus: parseFloat(bonus) || 0,
        deductions: parseFloat(deductions) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Salary record added");
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      setOpen(false);
      setTeacherId(""); setBaseSalary(""); setBonus("0"); setDeductions("0");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teacher_salaries").update({
        status: "Paid",
        paid_date: new Date().toISOString().split("T")[0],
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marked as paid");
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalPaid = salaries.filter(s => s.status === "Paid").reduce((sum, s) => sum + Number(s.net_salary), 0);
  const totalPending = salaries.filter(s => s.status !== "Paid").reduce((sum, s) => sum + Number(s.net_salary), 0);
  const pendingCount = salaries.filter(s => s.status !== "Paid").length;

  const filtered = salaries.filter(s => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterMonth !== "all" && s.month !== filterMonth) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Salaries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage salary payments and records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Salary</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Salary Record</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Teacher *</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Base Salary *</Label>
                <Input type="number" step="0.01" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} required placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Bonus</Label>
                  <Input type="number" step="0.01" value={bonus} onChange={e => setBonus(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Deductions</Label>
                  <Input type="number" step="0.01" value={deductions} onChange={e => setDeductions(e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Paid" value={`$${totalPaid.toLocaleString()}`} icon={<DollarSign className="h-5 w-5 text-success" />} iconBg="bg-success/10" change="This period" changeType="positive" />
        <StatCard title="Pending Amount" value={`$${totalPending.toLocaleString()}`} icon={<Clock className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" change={`${pendingCount} records`} changeType="negative" />
        <StatCard title="Total Records" value={salaries.length.toString()} icon={<TrendingUp className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" change="All time" changeType="positive" />
      </div>

      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading salaries...</div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const teacher = s.teachers as any;
                const name = teacher ? `${teacher.first_name} ${teacher.last_name}` : "—";
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{s.month} {s.year}</TableCell>
                    <TableCell className="text-right">${Number(s.base_salary).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${Number(s.bonus).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${Number(s.deductions).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">${Number(s.net_salary).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[s.status] ?? ""}`}>{s.status}</span>
                    </TableCell>
                    <TableCell>
                      {s.status !== "Paid" && (
                        <Button size="sm" variant="outline" onClick={() => markPaidMutation.mutate(s.id)} disabled={markPaidMutation.isPending}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Pay
                        </Button>
                      )}
                      {s.status === "Paid" && <span className="text-xs text-muted-foreground">{s.paid_date}</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No salary records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
