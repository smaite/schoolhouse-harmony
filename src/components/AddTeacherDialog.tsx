import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddTeacherDialog() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [subjects, setSubjects] = useState("");
  const [qualification, setQualification] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        throw new Error("First name, last name, and email are required");
      }
      const { error } = await supabase.from("teachers").insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        department: department.trim() || "General",
        subjects: subjects.trim() ? subjects.split(",").map((s) => s.trim()) : [],
        qualification: qualification.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Teacher added successfully");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-teachers"] });
      setOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setDepartment(""); setSubjects(""); setQualification("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Teacher</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={100} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Mathematics" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Subjects (comma-separated)</Label>
            <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Algebra, Calculus" maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. M.Sc. Mathematics" maxLength={100} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Teacher"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
