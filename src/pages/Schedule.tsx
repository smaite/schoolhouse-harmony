import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPeriodDialog } from "@/components/AddPeriodDialog";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const subjectColors: Record<string, string> = {
  Math: "bg-primary/10 text-primary",
  Mathematics: "bg-primary/10 text-primary",
  English: "bg-info/10 text-info",
  Literature: "bg-info/10 text-info",
  Science: "bg-success/10 text-success",
  Physics: "bg-success/10 text-success",
  Chemistry: "bg-success/10 text-success",
  Biology: "bg-success/10 text-success",
  History: "bg-warning/10 text-warning",
  Geography: "bg-warning/10 text-warning",
  PE: "bg-destructive/10 text-destructive",
  Art: "bg-accent text-accent-foreground",
  Music: "bg-secondary text-secondary-foreground",
  Computer: "bg-primary/15 text-primary",
  Break: "bg-muted text-muted-foreground",
  Lunch: "bg-muted text-muted-foreground",
};

// Fallback static schedule data
const fallbackSchedule = [
  { time: "8:00 - 8:45", mon: "Math", tue: "English", wed: "Science", thu: "Math", fri: "History" },
  { time: "8:50 - 9:35", mon: "English", tue: "Math", wed: "Art", thu: "Science", fri: "Math" },
  { time: "9:40 - 10:25", mon: "Science", tue: "PE", wed: "Math", thu: "English", fri: "Science" },
  { time: "10:30 - 10:45", mon: "Break", tue: "Break", wed: "Break", thu: "Break", fri: "Break" },
  { time: "10:45 - 11:30", mon: "History", tue: "Science", wed: "English", thu: "Art", fri: "PE" },
  { time: "11:35 - 12:20", mon: "PE", tue: "History", wed: "Music", thu: "History", fri: "English" },
  { time: "12:20 - 1:00", mon: "Lunch", tue: "Lunch", wed: "Lunch", thu: "Lunch", fri: "Lunch" },
  { time: "1:00 - 1:45", mon: "Computer", tue: "Art", wed: "History", thu: "PE", fri: "Computer" },
  { time: "1:50 - 2:30", mon: "Music", tue: "Computer", wed: "PE", thu: "Computer", fri: "Music" },
];

export default function Schedule() {
  const { data: periods = [] } = useQuery({
    queryKey: ["schedule-periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_periods")
        .select("*")
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  // Build dynamic schedule from DB periods, or fall back to static
  const scheduleData = periods.length > 0
    ? (() => {
        const timeSlots = [...new Set(periods.map(p => `${p.start_time.slice(0,5)} - ${p.end_time.slice(0,5)}`))].sort();
        return timeSlots.map(time => {
          const row: Record<string, string> = { time };
          days.forEach(day => {
            const period = periods.find(p =>
              p.day_of_week === day &&
              `${p.start_time.slice(0,5)} - ${p.end_time.slice(0,5)}` === time
            );
            const key = day.slice(0, 3).toLowerCase();
            row[key] = period?.subject || "—";
          });
          return row;
        });
      })()
    : fallbackSchedule;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Class timetable & scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Calendar className="h-4 w-4 mr-2" /> View Calendar</Button>
          <AddPeriodDialog />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-sm font-semibold text-muted-foreground w-32">
                  <Clock className="h-4 w-4 inline mr-1" /> Time
                </th>
                {days.map((day) => (
                  <th key={day} className="p-3 text-center text-sm font-semibold">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">{row.time}</td>
                  {["mon", "tue", "wed", "thu", "fri"].map((key, j) => {
                    const subject = row[key] || "—";
                    return (
                      <td key={j} className="p-2 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${subjectColors[subject] || "bg-muted text-muted-foreground"}`}>
                          {subject}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
