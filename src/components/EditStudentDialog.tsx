import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  student: any;
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(student.avatar_url ?? null);
  const queryClient = useQueryClient();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2MB"); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => { setPhotoFile(null); setPhotoPreview(null); };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!firstName.trim() || !lastName.trim()) throw new Error("First and last name are required");

      let avatarUrl = student.avatar_url;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `students/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      } else if (!photoPreview) {
        avatarUrl = null;
      }

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
        avatar_url: avatarUrl,
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
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5 pb-2">
            {/* Photo Upload */}
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-xl object-cover border-2 border-primary/20" />
                    <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Student Photo</p>
                <p>Upload a passport-size photo (max 2MB).</p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name / नाम *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name / थर *</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Blood, Religion, Nationality */}
            <div className="grid grid-cols-3 gap-4">
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
                <Input value={religion} onChange={(e) => setReligion(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nationality / राष्ट्रियता</Label>
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
              </div>
            </div>

            {/* Class & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class / कक्षा</Label>
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

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone / फोन</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>Address / ठेगाना</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            {/* Father & Mother */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Father's Name / बुबाको नाम</Label>
                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Father's Phone</Label>
                <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mother's Name / आमाको नाम</Label>
              <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} />
            </div>

            {/* Guardian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guardian Name / संरक्षकको नाम</Label>
                <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Guardian Phone</Label>
                <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
              </div>
            </div>

            {/* Previous School */}
            <div className="space-y-2">
              <Label>Previous School / पूर्व विद्यालय</Label>
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
