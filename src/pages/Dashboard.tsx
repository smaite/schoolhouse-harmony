import {
  Users,
  GraduationCap,
  School,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  BookOpen,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const attendanceData = [
  { day: "Mon", present: 92, absent: 8 },
  { day: "Tue", present: 88, absent: 12 },
  { day: "Wed", present: 95, absent: 5 },
  { day: "Thu", present: 90, absent: 10 },
  { day: "Fri", present: 85, absent: 15 },
];

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

const recentActivities = [
  { text: "New student enrolled: Sarah Johnson", time: "2 min ago", type: "success" },
  { text: "Attendance report generated for Grade 10", time: "15 min ago", type: "info" },
  { text: "Fee payment received: $1,200", time: "1 hour ago", type: "success" },
  { text: "Parent meeting scheduled for March 25", time: "2 hours ago", type: "warning" },
  { text: "Teacher John Smith on leave tomorrow", time: "3 hours ago", type: "destructive" },
];

const upcomingEvents = [
  { name: "Parent-Teacher Meeting", date: "Mar 25", type: "Meeting" },
  { name: "Science Fair", date: "Mar 28", type: "Event" },
  { name: "Mid-Term Exams", date: "Apr 1", type: "Exam" },
  { name: "School Anniversary", date: "Apr 10", type: "Event" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's what's happening at your school today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,248"
          change="+12 this month"
          changeType="positive"
          icon={<Users className="h-5 w-5 text-primary-foreground" />}
          iconBg="bg-primary"
        />
        <StatCard
          title="Total Teachers"
          value="86"
          change="+2 new hires"
          changeType="positive"
          icon={<GraduationCap className="h-5 w-5 text-info-foreground" />}
          iconBg="bg-info"
        />
        <StatCard
          title="Active Classes"
          value="42"
          change="All running"
          changeType="neutral"
          icon={<School className="h-5 w-5 text-warning-foreground" />}
          iconBg="bg-warning"
        />
        <StatCard
          title="Attendance Rate"
          value="94.2%"
          change="+1.5% vs last week"
          changeType="positive"
          icon={<ClipboardCheck className="h-5 w-5 text-success-foreground" />}
          iconBg="bg-success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Chart */}
        <div className="col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(172, 66%, 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Enrollment Trend */}
        <div className="col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="students"
                stroke="hsl(172, 66%, 35%)"
                strokeWidth={2.5}
                dot={{ fill: "hsl(172, 66%, 35%)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-secondary p-3"
              >
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

      {/* Recent Activity */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <p className="text-sm">{activity.text}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
