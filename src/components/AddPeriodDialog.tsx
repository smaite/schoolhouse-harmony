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

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AddPeriodDialog() {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("08:45");
  const [subject, setSubject] = useState("");
  const [classId, setClassId] = useState("");
  const [room, setRoom] = useState("");
  const queryClient = useQueryClient();

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!subject.trim()) throw new Error("Subject is required");
      const { error } = await supabase.from("schedule_periods").insert({
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        subject: subject.trim(),
        class_id: classId || null,
        room: room.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Period added");
      queryClient.invalidateQueries({ queryKey: ["schedule-periods"] });
      setOpen(false);
      setSubject(""); setClassId(""); setRoom("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Period</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Schedule Period</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Day *</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. Mathematics" maxLength={100} />
          </div>
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
            <Label>Room</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 101" maxLength={20} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Period"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
