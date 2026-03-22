import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students, teachers, classes..."
          className="pl-10 bg-secondary border-0"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
            3
          </span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@schoolers.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
