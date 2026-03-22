import { Plus, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const classesData = [
  { id: 1, name: "Grade 9-A", teacher: "Ms. Emily Parker", students: 32, subjects: 6, room: "101", schedule: "Mon-Fri 8:00-2:30" },
  { id: 2, name: "Grade 9-B", teacher: "Mr. David Lee", students: 30, subjects: 6, room: "102", schedule: "Mon-Fri 8:00-2:30" },
  { id: 3, name: "Grade 10-A", teacher: "Dr. Robert Smith", students: 28, subjects: 7, room: "201", schedule: "Mon-Fri 8:00-3:00" },
  { id: 4, name: "Grade 10-B", teacher: "Mrs. Lisa Wang", students: 31, subjects: 7, room: "202", schedule: "Mon-Fri 8:00-3:00" },
  { id: 5, name: "Grade 11-A", teacher: "Mr. James Taylor", students: 26, subjects: 7, room: "301", schedule: "Mon-Fri 8:00-3:00" },
  { id: 6, name: "Grade 11-B", teacher: "Ms. Ana Rodriguez", students: 29, subjects: 7, room: "302", schedule: "Mon-Fri 8:00-3:00" },
  { id: 7, name: "Grade 12-A", teacher: "Dr. Robert Smith", students: 24, subjects: 6, room: "401", schedule: "Mon-Fri 8:00-2:30" },
  { id: 8, name: "Grade 12-B", teacher: "Mr. James Taylor", students: 22, subjects: 6, room: "402", schedule: "Mon-Fri 8:00-2:30" },
];

export default function Classes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage classes and sections</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Create Class</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classesData.map((cls) => (
          <div key={cls.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{cls.name}</h3>
              <Badge variant="outline">Room {cls.room}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Class Teacher: {cls.teacher}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>{cls.students} Students</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-info" />
                <span>{cls.subjects} Subjects</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{cls.schedule}</p>
            <Button variant="outline" size="sm" className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
