import { MessageSquare, Plus, Pin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const announcements = [
  { id: 1, title: "Annual Sports Day — March 28", body: "All students are expected to participate. Report to the sports ground by 8:00 AM.", author: "Admin", date: "2026-03-18", pinned: true, category: "Event" },
  { id: 2, title: "Mid-term Exam Schedule Released", body: "Mid-term examinations will be held from April 7–14. Timetable has been uploaded to the portal.", author: "Academic Office", date: "2026-03-15", pinned: true, category: "Academic" },
  { id: 3, title: "Parent-Teacher Meeting — Grade 10", body: "PTM for Grade 10 parents is scheduled for March 30 at 10:00 AM in the auditorium.", author: "Admin", date: "2026-03-14", pinned: false, category: "Meeting" },
  { id: 4, title: "Library Book Return Reminder", body: "All overdue library books must be returned by March 25 to avoid fines.", author: "Librarian", date: "2026-03-12", pinned: false, category: "Notice" },
  { id: 5, title: "New Computer Lab Now Open", body: "The new computer lab on the 3rd floor is now open for student use during free periods.", author: "IT Department", date: "2026-03-10", pinned: false, category: "Facility" },
];

const categoryColors: Record<string, string> = {
  Event: "bg-primary/10 text-primary",
  Academic: "bg-info/10 text-info",
  Meeting: "bg-warning/10 text-warning",
  Notice: "bg-muted text-muted-foreground",
  Facility: "bg-success/10 text-success",
};

export default function Announcements() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">School-wide notices and updates</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Announcement</Button>
      </div>

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
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.date}</span>
                </div>
              </div>
              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[a.category]}`}>
                {a.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
