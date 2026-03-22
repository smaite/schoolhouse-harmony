import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  religion: string | null;
  nationality: string | null;
  mother_name: string | null;
  previous_school: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
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
  const [dateOfBirth, setDateOfBirth] = useState(student.date_of_birth ?? "");
  const [gender, setGender] = useState(student.gender ?? "");
  const [bloodGroup, setBloodGroup] = useState(student.blood_group ?? "");
  const [religion, setReligion] = useState(student.religion ?? "");
  const [nationality, setNationality] = useState(student.nationality ?? "Nepali");
  const [motherName, setMotherName] = useState(student.mother_name ?? "");
  const [previousSchool, setPreviousSchool] = useState(student.previous_school ?? "");
  const [guardianName, setGuardianName] = useState(student.guardian_name ?? "");
  const [guardianPhone, setGuardianPhone] = useState(student.guardian_phone ?? "");
  const [address, setAddress] = useState(student.address ?? "");
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
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        blood_group: bloodGroup || null,
        religion: religion.trim() || null,
        nationality: nationality.trim() || null,
        mother_name: motherName.trim() || null,
        previous_school: previousSchool.trim() || null,
        guardian_name: guardianName.trim() || null,
        guardian_phone: guardianPhone.trim() || null,
        address: address.trim() || null,
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
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Religion</Label>
                <Input value={religion} onChange={(e) => setReligion(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
              </div>
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
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Father's Name</Label>
                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Father's Phone</Label>
                <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mother's Name</Label>
              <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Guardian Name</Label>
                <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Guardian Phone</Label>
                <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Previous School</Label>
              <Input value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
