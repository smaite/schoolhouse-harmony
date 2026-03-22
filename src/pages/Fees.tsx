import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, DollarSign, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusVariant: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Partial: "bg-warning/10 text-warning",
  Unpaid: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/10 text-destructive",
};

export default function Fees() {
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

  const totalCollected = fees.reduce((s, f) => s + Number(f.paid), 0);
  const totalPending = fees.reduce((s, f) => s + (Number(f.amount) - Number(f.paid)), 0);
  const overdueCount = fees.filter((f) => f.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fees</h1>
          <p className="text-sm text-muted-foreground mt-1">Track fee payments and dues</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Record Payment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={<DollarSign className="h-5 w-5 text-success" />} iconBg="bg-success/10" change="Live data" changeType="positive" />
        <StatCard title="Pending Amount" value={`$${totalPending.toLocaleString()}`} icon={<CreditCard className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" change={`${fees.filter(f => f.status !== "Paid").length} invoices`} changeType="negative" />
        <StatCard title="Overdue Invoices" value={overdueCount.toString()} icon={<AlertCircle className="h-5 w-5 text-destructive" />} iconBg="bg-destructive/10" change="Needs attention" changeType="negative" />
      </div>

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
                    <TableCell className="text-right">${Number(fee.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${Number(fee.paid).toLocaleString()}</TableCell>
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
    </div>
  );
}
