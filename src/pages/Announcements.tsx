import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Clock } from "lucide-react";
import { AddAnnouncementDialog } from "@/components/AddAnnouncementDialog";

const categoryColors: Record<string, string> = {
  Event: "bg-primary/10 text-primary",
  Academic: "bg-info/10 text-info",
  Meeting: "bg-warning/10 text-warning",
  Notice: "bg-muted text-muted-foreground",
  Facility: "bg-success/10 text-success",
};

export default function Announcements() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">School-wide notices and updates</p>
        </div>
        <AddAnnouncementDialog />
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                    <h3 className="font-semibold text-base">{a.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="font-medium">{a.author}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[a.category] || ""}`}>
                  {a.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
