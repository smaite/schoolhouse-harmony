import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  School,
  Calendar,
  MessageSquare,
  Settings,
  ChevronLeft,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Students", icon: Users, path: "/students" },
  { label: "Teachers", icon: GraduationCap, path: "/teachers" },
  { label: "Classes", icon: School, path: "/classes" },
  { label: "Attendance", icon: ClipboardCheck, path: "/attendance" },
  { label: "Gradebook", icon: BookOpen, path: "/gradebook" },
  { label: "Schedule", icon: Calendar, path: "/schedule" },
  { label: "Fees", icon: CreditCard, path: "/fees" },
  { label: "Announcements", icon: MessageSquare, path: "/announcements" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const allNavItems = isAdmin
    ? [...navItems.slice(0, navItems.length - 1), { label: "Admin Panel", icon: ShieldCheck, path: "/admin" }, navItems[navItems.length - 1]]
    : navItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col sidebar-gradient border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-lg">
          S
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-primary-foreground truncate">
              Schoolers
            </h1>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">
              by Radium Tech
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {allNavItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 shrink-0 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
