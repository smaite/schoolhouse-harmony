import { useState } from "react";
import { Search, Plus, Filter, MoreVertical, Mail, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const teachers = [
  { id: 1, name: "Dr. Robert Smith", subject: "Mathematics", classes: "10-A, 11-A", email: "r.smith@school.com", experience: "15 yrs", status: "Active", avatar: "RS", rating: 4.8 },
  { id: 2, name: "Ms. Emily Parker", subject: "English", classes: "9-A, 9-B", email: "e.parker@school.com", experience: "8 yrs", status: "Active", avatar: "EP", rating: 4.6 },
  { id: 3, name: "Mr. David Lee", subject: "Science", classes: "10-B, 12-A", email: "d.lee@school.com", experience: "12 yrs", status: "Active", avatar: "DL", rating: 4.9 },
  { id: 4, name: "Mrs. Lisa Wang", subject: "History", classes: "11-A, 11-B", email: "l.wang@school.com", experience: "10 yrs", status: "On Leave", avatar: "LW", rating: 4.5 },
  { id: 5, name: "Mr. James Taylor", subject: "Physics", classes: "12-A, 12-B", email: "j.taylor@school.com", experience: "20 yrs", status: "Active", avatar: "JT", rating: 4.7 },
  { id: 6, name: "Ms. Ana Rodriguez", subject: "Art", classes: "9-A, 10-A", email: "a.rodriguez@school.com", experience: "6 yrs", status: "Active", avatar: "AR", rating: 4.4 },
];

export default function Teachers() {
  const [search, setSearch] = useState("");
  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage faculty and staff</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Teacher
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search teachers..." className="pl-10 bg-card border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((teacher) => (
          <div key={teacher.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {teacher.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                </div>
              </div>
              <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>
                {teacher.status}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Classes</span>
                <span className="font-medium">{teacher.classes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium">{teacher.experience}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="flex items-center gap-1 font-medium">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {teacher.rating}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"><Mail className="h-3.5 w-3.5 mr-1" /> Email</Button>
              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
