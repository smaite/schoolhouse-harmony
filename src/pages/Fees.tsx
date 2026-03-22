import { CreditCard, DollarSign, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const feesData = [
  { id: 1, student: "Alex Johnson", class: "Grade 10-A", type: "Tuition", amount: 2500, paid: 2500, status: "Paid", date: "2026-01-15" },
  { id: 2, student: "Maria Garcia", class: "Grade 9-B", type: "Tuition", amount: 2500, paid: 1500, status: "Partial", date: "2026-01-20" },
  { id: 3, student: "Chen Wei", class: "Grade 11-A", type: "Lab Fee", amount: 350, paid: 0, status: "Unpaid", date: "-" },
  { id: 4, student: "Sarah Kim", class: "Grade 10-B", type: "Tuition", amount: 2500, paid: 2500, status: "Paid", date: "2026-02-01" },
  { id: 5, student: "James Brown", class: "Grade 12-A", type: "Activity", amount: 200, paid: 200, status: "Paid", date: "2026-01-10" },
  { id: 6, student: "Priya Patel", class: "Grade 9-A", type: "Tuition", amount: 2500, paid: 0, status: "Overdue", date: "-" },
  { id: 7, student: "Liam O'Brien", class: "Grade 11-B", type: "Library", amount: 100, paid: 100, status: "Paid", date: "2026-02-05" },
];

const statusVariant: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Partial: "bg-warning/10 text-warning",
  Unpaid: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/10 text-destructive",
};

export default function Fees() {
  const totalCollected = feesData.reduce((s, f) => s + f.paid, 0);
  const totalPending = feesData.reduce((s, f) => s + (f.amount - f.paid), 0);
  const overdueCount = feesData.filter((f) => f.status === "Overdue").length;

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
        <StatCard title="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={DollarSign} trend={{ value: 12, positive: true }} />
        <StatCard title="Pending Amount" value={`$${totalPending.toLocaleString()}`} icon={CreditCard} trend={{ value: 5, positive: false }} />
        <StatCard title="Overdue Invoices" value={overdueCount.toString()} icon={AlertCircle} trend={{ value: 2, positive: false }} />
      </div>

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
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feesData.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium">{fee.student}</TableCell>
                <TableCell>{fee.class}</TableCell>
                <TableCell>{fee.type}</TableCell>
                <TableCell className="text-right">${fee.amount}</TableCell>
                <TableCell className="text-right">${fee.paid}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusVariant[fee.status]}`}>
                    {fee.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{fee.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
