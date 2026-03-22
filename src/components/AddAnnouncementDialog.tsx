import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const categories = ["Event", "Academic", "Meeting", "Notice", "Facility"];

export function AddAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [category, setCategory] = useState("Notice");
  const [pinned, setPinned] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !body.trim()) throw new Error("Title and body are required");
      const { error } = await supabase.from("announcements").insert({
        title: title.trim(),
        body: body.trim(),
        author: author.trim() || "Admin",
        category,
        pinned,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Announcement created");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setOpen(false);
      setTitle(""); setBody(""); setAuthor("Admin"); setCategory("Notice"); setPinned(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> New Announcement</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Body *</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Author</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Pin this announcement</Label>
            <Switch checked={pinned} onCheckedChange={setPinned} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Announcement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
