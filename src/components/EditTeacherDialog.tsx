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
  teacher: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTeacherDialog({ teacher, open, onOpenChange }: Props) {
  const [firstName, setFirstName] = useState(teacher.first_name);
  const [lastName, setLastName] = useState(teacher.last_name);
  const [fatherName, setFatherName] = useState(teacher.father_name ?? "");
  const [email, setEmail] = useState(teacher.email);
  const [phone, setPhone] = useState(teacher.phone ?? "");
  const [department, setDepartment] = useState(teacher.department);
  const [subjects, setSubjects] = useState(teacher.subjects.join(", "));
  const [qualification, setQualification] = useState(teacher.qualification ?? "");
  const [status, setStatus] = useState(teacher.status);
  const [gender, setGender] = useState(teacher.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(teacher.date_of_birth ?? "");
  const [nationality, setNationality] = useState(teacher.nationality ?? "Nepali");
  const [bloodGroup, setBloodGroup] = useState(teacher.blood_group ?? "");
  const [permanentAddress, setPermanentAddress] = useState(teacher.permanent_address ?? "");
  const [currentAddress, setCurrentAddress] = useState(teacher.current_address ?? "");
  const [panNumber, setPanNumber] = useState(teacher.pan_number ?? "");
  const [motherTongue, setMotherTongue] = useState(teacher.mother_tongue ?? "Nepali");
  const [category, setCategory] = useState(teacher.category ?? "");
  const [maritalStatus, setMaritalStatus] = useState(teacher.marital_status ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.avatar_url ?? null);
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
      if (!firstName.trim() || !lastName.trim() || !email.trim()) throw new Error("First name, last name, and email are required");

      let avatarUrl = teacher.avatar_url;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `teachers/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      } else if (!photoPreview) {
        avatarUrl = null;
      }

      const { error } = await supabase.from("teachers").update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        father_name: fatherName.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        department: department.trim() || "General",
        subjects: subjects.trim() ? subjects.split(",").map((s) => s.trim()) : [],
        qualification: qualification.trim() || null,
        status,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        nationality: nationality.trim() || null,
        blood_group: bloodGroup || null,
        permanent_address: permanentAddress.trim() || null,
        current_address: currentAddress.trim() || null,
        pan_number: panNumber.trim() || null,
        mother_tongue: motherTongue.trim() || null,
        category: category.trim() || null,
        marital_status: maritalStatus || null,
        avatar_url: avatarUrl,
      }).eq("id", teacher.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Teacher updated");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5 pb-2">
            {/* Photo */}
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
                <p className="font-medium text-foreground">Teacher Photo</p>
                <p>Upload a passport-size photo (max 2MB).</p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Father's Name</Label>
                <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
              </div>
            </div>

            {/* Gender, DOB, Status */}
            <div className="grid grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Nationality, Blood, Mother Tongue */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
              </div>
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
                <Label>Mother Tongue</Label>
                <Input value={motherTongue} onChange={(e) => setMotherTongue(e.target.value)} />
              </div>
            </div>

            {/* Category, Marital, PAN */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brahmin/Chhetri">Brahmin/Chhetri</SelectItem>
                    <SelectItem value="Janajati">Janajati</SelectItem>
                    <SelectItem value="Madhesi">Madhesi</SelectItem>
                    <SelectItem value="Dalit">Dalit</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input value={panNumber} onChange={(e) => setPanNumber(e.target.value)} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Permanent Address</Label>
                <Input value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Current Address</Label>
                <Input value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} />
              </div>
            </div>

            {/* Professional */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Input value={qualification} onChange={(e) => setQualification(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subjects (comma-separated)</Label>
              <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Nepali, English, Math" />
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
