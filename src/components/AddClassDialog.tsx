import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddClassDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [numSubjects, setNumSubjects] = useState("6");
  const [schedule, setSchedule] = useState("");
  const queryClient = useQueryClient();

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-list-class"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("id, first_name, last_name").eq("status", "Active").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Class name is required");
      const { error } = await supabase.from("classes").insert({
        name: name.trim(),
        room: room || null,
        grade_level: gradeLevel ? parseInt(gradeLevel) : null,
        teacher_id: teacherId || null,
        num_subjects: parseInt(numSubjects) || 6,
        schedule: schedule || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Class created");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["classes-list"] });
      setOpen(false);
      setName(""); setRoom(""); setGradeLevel(""); setTeacherId(""); setNumSubjects("6"); setSchedule("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Create Class</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create New Class</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Class Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Class 10 A" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Input type="number" min="1" max="12" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="e.g. 10" />
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 201" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Class Teacher</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>No. of Subjects</Label>
              <Input type="number" min="1" value={numSubjects} onChange={(e) => setNumSubjects(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="e.g. Sun-Fri" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Class"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
