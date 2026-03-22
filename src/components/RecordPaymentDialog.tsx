import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const defaultFeeTypes = ["Tuition", "Lab Fee", "Sports Fee", "Library Fee", "Transport Fee"];

export function RecordPaymentDialog({ customFeeTypes = [] }: { customFeeTypes?: string[] }) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [feeType, setFeeType] = useState("Tuition");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();

  // Merge default + custom fee types, deduplicated
  const allFeeTypes = [...new Set([...defaultFeeTypes, ...customFeeTypes])];

  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("id, first_name, last_name").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!studentId || !amount) throw new Error("Student and amount are required");
      const amtNum = parseFloat(amount);
      const paidNum = parseFloat(paid) || 0;
      if (isNaN(amtNum) || amtNum <= 0) throw new Error("Invalid amount");
      const status = paidNum >= amtNum ? "Paid" : paidNum > 0 ? "Partial" : "Unpaid";
      const { error } = await supabase.from("fees").insert({
        student_id: studentId,
        fee_type: feeType,
        amount: amtNum,
        paid: paidNum,
        status,
        due_date: dueDate || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setOpen(false);
      setStudentId(""); setAmount(""); setPaid(""); setDueDate("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Record Payment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Fee Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Student *</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fee Type</Label>
            <Select value={feeType} onValueChange={setFeeType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {allFeeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount (NPR) *</Label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Paid (NPR)</Label>
              <Input type="number" step="0.01" min="0" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
