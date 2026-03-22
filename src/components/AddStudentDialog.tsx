import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  classes: { id: string; name: string }[];
}

export function AddStudentDialog({ classes }: Props) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [classId, setClassId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [religion, setReligion] = useState("");
  const [nationality, setNationality] = useState("Nepali");
  const [motherName, setMotherName] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [address, setAddress] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!firstName.trim() || !lastName.trim()) throw new Error("First and last name are required");
      const { error } = await supabase.from("students").insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        class_id: classId || null,
        parent_name: parentName.trim() || null,
        parent_phone: parentPhone.trim() || null,
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
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student added successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-students"] });
      setOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setClassId(""); setParentName(""); setParentPhone("");
    setDateOfBirth(""); setGender(""); setBloodGroup("");
    setReligion(""); setNationality("Nepali"); setMotherName("");
    setPreviousSchool(""); setGuardianName(""); setGuardianPhone("");
    setAddress("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>प्रवेश दर्ता फारम — Admission Form</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name / नाम *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Last Name / थर *</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={100} />
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date of Birth / जन्म मिति</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender / लिङ्ग</Label>
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

            {/* Blood Group, Religion, Nationality */}
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
                <Label>Religion / धर्म</Label>
                <Input value={religion} onChange={(e) => setReligion(e.target.value)} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label>Nationality / राष्ट्रियता</Label>
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)} maxLength={50} />
              </div>
            </div>

            {/* Class */}
            <div className="space-y-2">
              <Label>Class / कक्षा</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>Phone / फोन</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>Address / ठेगाना</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={255} />
            </div>

            {/* Father & Mother */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Father's Name / बुबाको नाम</Label>
                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Father's Phone</Label>
                <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} maxLength={20} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mother's Name / आमाको नाम</Label>
              <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} maxLength={100} />
            </div>

            {/* Guardian */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Guardian Name / संरक्षकको नाम</Label>
                <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Guardian Phone</Label>
                <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} maxLength={20} />
              </div>
            </div>

            {/* Previous School */}
            <div className="space-y-2">
              <Label>Previous School / पूर्व विद्यालय</Label>
              <Input value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} maxLength={255} />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add Student"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
