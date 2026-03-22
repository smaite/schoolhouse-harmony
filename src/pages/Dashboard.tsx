import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  GraduationCap,
  School,
  ClipboardCheck,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const gradeDistribution = [
  { name: "A", value: 35, color: "hsl(172, 66%, 35%)" },
  { name: "B", value: 30, color: "hsl(210, 80%, 52%)" },
  { name: "C", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "D", value: 10, color: "hsl(0, 72%, 51%)" },
  { name: "F", value: 5, color: "hsl(215, 12%, 50%)" },
];

const enrollmentTrend = [
  { month: "Sep", students: 1150 },
  { month: "Oct", students: 1180 },
  { month: "Nov", students: 1200 },
  { month: "Dec", students: 1195 },
  { month: "Jan", students: 1220 },
  { month: "Feb", students: 1248 },
];

const upcomingEvents = [
  { name: "Parent-Teacher Meeting", date: "Mar 25", type: "Meeting" },
  { name: "Science Fair", date: "Mar 28", type: "Event" },
  { name: "Mid-Term Exams", date: "Apr 1", type: "Exam" },
  { name: "School Anniversary", date: "Apr 10", type: "Event" },
];

export default function Dashboard() {
  const { data: studentCount = 0 } = useQuery({
    queryKey: ["dashboard-students"],
    queryFn: async () => {
      const { count } = await supabase.from("students").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: teacherCount = 0 } = useQuery({
    queryKey: ["dashboard-teachers"],
    queryFn: async () => {
      const { count } = await supabase.from("teachers").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: classCount = 0 } = useQuery({
    queryKey: ["dashboard-classes"],
    queryFn: async () => {
      const { count } = await supabase.from("classes").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: attendanceRate = "0%" } = useQuery({
    queryKey: ["dashboard-attendance"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("attendance").select("status").eq("date", today);
      if (!data || data.length === 0) return "N/A";
      const present = data.filter((a) => a.status === "Present" || a.status === "Late").length;
      return ((present / data.length) * 100).toFixed(1) + "%";
    },
  });

  const { data: weeklyAttendance = [] } = useQuery({
    queryKey: ["dashboard-weekly-attendance"],
    queryFn: async () => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const result = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const { data } = await supabase.from("attendance").select("status").eq("date", dateStr);
        const present = data?.filter((a) => a.status === "Present" || a.status === "Late").length ?? 0;
        const absent = data?.filter((a) => a.status === "Absent").length ?? 0;
        result.push({ day: days[d.getDay()], present, absent });
      }
      return result;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening at your school today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={studentCount.toLocaleString()} change="Live data" changeType="positive" icon={<Users className="h-5 w-5 text-primary-foreground" />} iconBg="bg-primary" />
        <StatCard title="Total Teachers" value={teacherCount.toString()} change="Live data" changeType="positive" icon={<GraduationCap className="h-5 w-5 text-info-foreground" />} iconBg="bg-info" />
        <StatCard title="Active Classes" value={classCount.toString()} change="All running" changeType="neutral" icon={<School className="h-5 w-5 text-warning-foreground" />} iconBg="bg-warning" />
        <StatCard title="Attendance Rate" value={attendanceRate} change="Today" changeType="positive" icon={<ClipboardCheck className="h-5 w-5 text-success-foreground" />} iconBg="bg-success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(172, 66%, 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {gradeDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {gradeDistribution.map((g) => (
              <div key={g.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                {g.name}: {g.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="hsl(172, 66%, 35%)" strokeWidth={2.5} dot={{ fill: "hsl(172, 66%, 35%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div>
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground">{event.type}</p>
                </div>
                <span className="text-xs font-semibold text-primary">{event.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
