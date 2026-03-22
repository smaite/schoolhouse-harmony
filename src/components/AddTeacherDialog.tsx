import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

export function AddTeacherDialog() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [subjects, setSubjects] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("Nepali");
  const [bloodGroup, setBloodGroup] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [motherTongue, setMotherTongue] = useState("Nepali");
  const [category, setCategory] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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

      let avatarUrl: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `teachers/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("teachers").insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        father_name: fatherName.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        department: department.trim() || "General",
        subjects: subjects.trim() ? subjects.split(",").map((s) => s.trim()) : [],
        qualification: qualification.trim() || null,
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
    setFirstName(""); setLastName(""); setFatherName(""); setEmail(""); setPhone("");
    setDepartment(""); setSubjects(""); setQualification(""); setGender("");
    setDateOfBirth(""); setNationality("Nepali"); setBloodGroup("");
    setPermanentAddress(""); setCurrentAddress(""); setPanNumber("");
    setMotherTongue("Nepali"); setCategory(""); setMaritalStatus("");
    setPhotoFile(null); setPhotoPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Teacher</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>शिक्षक दर्ता फारम — Teacher Registration</DialogTitle>
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
                <p className="font-medium text-foreground">Teacher Photo</p>
                <p>Upload a passport-size photo (max 2MB).</p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>First Name / नाम *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Last Name / थर *</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Father's Name / बुबाको नाम</Label>
                <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} maxLength={100} />
              </div>
            </div>

            {/* Gender & DOB */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Gender / लिङ्ग *</Label>
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
                <Label>Date of Birth / जन्म मिति</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
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
            </div>

            {/* Nationality, Blood Group, Mother Tongue */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nationality / राष्ट्रियता</Label>
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)} maxLength={50} />
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
                <Label>Mother Tongue / मातृभाषा</Label>
                <Input value={motherTongue} onChange={(e) => setMotherTongue(e.target.value)} maxLength={50} />
              </div>
            </div>

            {/* Category & PAN */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category / जाति</Label>
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
                <Label>PAN Number</Label>
                <Input value={panNumber} onChange={(e) => setPanNumber(e.target.value)} maxLength={20} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email * / इमेल</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>Mobile / मोबाइल</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Permanent Address / स्थायी ठेगाना</Label>
                <Input value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>Current Address / हालको ठेगाना</Label>
                <Input value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} maxLength={255} />
              </div>
            </div>

            {/* Professional */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department / विभाग</Label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Mathematics" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Qualification / योग्यता</Label>
                <Input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. M.Ed., B.Sc." maxLength={100} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subjects (comma-separated) / विषयहरू</Label>
              <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Nepali, English, Math" maxLength={255} />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add Teacher"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
