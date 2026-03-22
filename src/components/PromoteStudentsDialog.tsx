import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";

export function PromoteStudentsDialog({ classes }: { classes: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ["students-promote", fromClass],
    enabled: !!fromClass,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .eq("class_id", fromClass)
        .eq("status", "Active")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!fromClass || !toClass) throw new Error("Select both classes");
      if (fromClass === toClass) throw new Error("From and To class cannot be the same");
      const toPromote = students.filter((s) => !excluded.has(s.id)).map((s) => s.id);
      if (toPromote.length === 0) throw new Error("No students to promote");
      const { error } = await supabase.from("students").update({ class_id: toClass }).in("id", toPromote);
      if (error) throw error;
    },
    onSuccess: () => {
      const count = students.length - excluded.size;
      toast.success(`${count} students promoted successfully`);
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["class-student-counts"] });
      setOpen(false);
      setFromClass(""); setToClass(""); setExcluded(new Set());
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleExclude = (id: string) => {
    const next = new Set(excluded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExcluded(next);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><ArrowUpCircle className="h-4 w-4 mr-2" /> Promote Students</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Promote Students to Next Class</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>From Class *</Label>
              <Select value={fromClass} onValueChange={(v) => { setFromClass(v); setExcluded(new Set()); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Class *</Label>
              <Select value={toClass} onValueChange={setToClass}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fromClass && students.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <Label>Students ({students.length - excluded.size} / {students.length} selected)</Label>
                <Button variant="ghost" size="sm" onClick={() => setExcluded(new Set())}>Select All</Button>
              </div>
              <ScrollArea className="h-[280px] rounded-lg border p-3">
                <div className="space-y-2">
                  {students.map((s) => (
                    <label key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                      <Checkbox checked={!excluded.has(s.id)} onCheckedChange={() => toggleExclude(s.id)} />
                      <span className="text-sm font-medium">{s.first_name} {s.last_name}</span>
                      {excluded.has(s.id) && <span className="text-xs text-muted-foreground ml-auto">Skipped</span>}
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {fromClass && students.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No active students in this class</p>
          )}

          <Button
            className="w-full"
            onClick={() => promoteMutation.mutate()}
            disabled={promoteMutation.isPending || !fromClass || !toClass || students.length - excluded.size === 0}
          >
            {promoteMutation.isPending ? "Promoting..." : `Promote ${students.length - excluded.size} Students`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
