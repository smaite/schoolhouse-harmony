import { useState } from "react";
import { Search, Plus, Filter, MoreVertical, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const students = [
  { id: 1, name: "Sarah Johnson", grade: "10-A", rollNo: "1001", email: "sarah.j@school.com", phone: "+1 234-567-8901", status: "Active", avatar: "SJ", gpa: "3.8" },
  { id: 2, name: "Michael Chen", grade: "10-B", rollNo: "1002", email: "m.chen@school.com", phone: "+1 234-567-8902", status: "Active", avatar: "MC", gpa: "3.6" },
  { id: 3, name: "Emma Williams", grade: "11-A", rollNo: "1003", email: "emma.w@school.com", phone: "+1 234-567-8903", status: "Active", avatar: "EW", gpa: "3.9" },
  { id: 4, name: "James Brown", grade: "9-A", rollNo: "1004", email: "james.b@school.com", phone: "+1 234-567-8904", status: "Inactive", avatar: "JB", gpa: "3.2" },
  { id: 5, name: "Olivia Davis", grade: "12-A", rollNo: "1005", email: "olivia.d@school.com", phone: "+1 234-567-8905", status: "Active", avatar: "OD", gpa: "3.7" },
  { id: 6, name: "Liam Martinez", grade: "11-B", rollNo: "1006", email: "liam.m@school.com", phone: "+1 234-567-8906", status: "Active", avatar: "LM", gpa: "3.4" },
  { id: 7, name: "Sophia Garcia", grade: "10-A", rollNo: "1007", email: "sophia.g@school.com", phone: "+1 234-567-8907", status: "Active", avatar: "SG", gpa: "3.5" },
  { id: 8, name: "Noah Wilson", grade: "9-B", rollNo: "1008", email: "noah.w@school.com", phone: "+1 234-567-8908", status: "Active", avatar: "NW", gpa: "3.1" },
];

export default function Students() {
  const [search, setSearch] = useState("");
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all enrolled students</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Student
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-10 bg-card border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roll No</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GPA</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{student.rollNo}</td>
                  <td className="p-4 text-sm font-medium">{student.grade}</td>
                  <td className="p-4 text-sm font-semibold">{student.gpa}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                      {student.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
