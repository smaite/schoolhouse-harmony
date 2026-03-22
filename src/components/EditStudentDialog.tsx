import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  class_id: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  status: string;
}

interface Props {
  student: Student;
  classes: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentDialog({ student, classes, open, onOpenChange }: Props) {
  const [firstName, setFirstName] = useState(student.first_name);
  const [lastName, setLastName] = useState(student.last_name);
  const [email, setEmail] = useState(student.email ?? "");
  const [phone, setPhone] = useState(student.phone ?? "");
  const [classId, setClassId] = useState(student.class_id ?? "");
  const [parentName, setParentName] = useState(student.parent_name ?? "");
  const [parentPhone, setParentPhone] = useState(student.parent_phone ?? "");
  const [status, setStatus] = useState(student.status);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!firstName.trim() || !lastName.trim()) throw new Error("First and last name are required");
      const { error } = await supabase.from("students").update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        class_id: classId || null,
        parent_name: parentName.trim() || null,
        parent_phone: parentPhone.trim() || null,
        status,
      }).eq("id", student.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student updated");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Parent Name</Label>
              <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Parent Phone</Label>
              <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
