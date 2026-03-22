import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Filter, MoreVertical, Mail, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Teachers() {
  const [search, setSearch] = useState("");

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = teachers.filter((t) => {
    const name = `${t.first_name} ${t.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage faculty and staff</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Teacher</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search teachers..." className="pl-10 bg-card border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading teachers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher) => {
            const initials = `${teacher.first_name[0]}${teacher.last_name[0]}`;
            const joinYear = new Date(teacher.join_date).getFullYear();
            const experience = new Date().getFullYear() - joinYear;
            return (
              <div key={teacher.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{teacher.first_name} {teacher.last_name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.department}</p>
                    </div>
                  </div>
                  <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subjects</span>
                    <span className="font-medium text-right">{teacher.subjects.join(", ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{experience} yrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Qualification</span>
                    <span className="font-medium">{teacher.qualification ?? "—"}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"><Mail className="h-3.5 w-3.5 mr-1" /> Email</Button>
                  <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
