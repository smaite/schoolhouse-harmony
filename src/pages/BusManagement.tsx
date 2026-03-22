import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bus, Plus, Users, MapPin, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function BusManagement() {
  const [addBusOpen, setAddBusOpen] = useState(false);
  const [busNumber, setBusNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeStops, setRouteStops] = useState("");
  const [capacity, setCapacity] = useState("40");
  const [selectedBus, setSelectedBus] = useState("");
  const [assignStudentId, setAssignStudentId] = useState("");
  const queryClient = useQueryClient();

  const { data: buses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("buses").select("*").order("bus_number");
      if (error) throw error;
      return data;
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-bus"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("id, first_name, last_name").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["bus-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bus_assignments").select("*, students(first_name, last_name), buses(bus_number, route_name)").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: signIns = [] } = useQuery({
    queryKey: ["bus-sign-ins", selectedBus],
    queryFn: async () => {
      let query = supabase.from("bus_sign_ins").select("*, students(first_name, last_name), buses(bus_number)")
        .eq("date", new Date().toISOString().split("T")[0]);
      if (selectedBus) query = query.eq("bus_id", selectedBus);
      const { data, error } = await query.order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const addBusMutation = useMutation({
    mutationFn: async () => {
      if (!busNumber.trim() || !driverName.trim() || !routeName.trim()) throw new Error("Bus number, driver, and route required");
      const { error } = await supabase.from("buses").insert({
        bus_number: busNumber.trim(),
        driver_name: driverName.trim(),
        driver_phone: driverPhone.trim() || null,
        capacity: parseInt(capacity) || 40,
        route_name: routeName.trim(),
        route_stops: routeStops.split(",").map(s => s.trim()).filter(Boolean),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bus added");
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      setAddBusOpen(false);
      setBusNumber(""); setDriverName(""); setDriverPhone(""); setRouteName(""); setRouteStops(""); setCapacity("40");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBus || !assignStudentId) throw new Error("Select bus and student");
      const { error } = await supabase.from("bus_assignments").insert({ bus_id: selectedBus, student_id: assignStudentId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student assigned to bus");
      queryClient.invalidateQueries({ queryKey: ["bus-assignments"] });
      setAssignStudentId("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const signInMutation = useMutation({
    mutationFn: async ({ busId, studentId, action }: { busId: string; studentId: string; action: "in" | "out" }) => {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      if (action === "in") {
        const { error } = await supabase.from("bus_sign_ins").upsert({
          bus_id: busId, student_id: studentId, date: today,
          sign_in_time: now, status: "Signed In",
        }, { onConflict: "bus_id,student_id,date" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bus_sign_ins").upsert({
          bus_id: busId, student_id: studentId, date: today,
          sign_out_time: now, status: "Signed Out",
        }, { onConflict: "bus_id,student_id,date" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Sign status updated");
      queryClient.invalidateQueries({ queryKey: ["bus-sign-ins"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = {
    Active: "bg-success/10 text-success",
    Inactive: "bg-muted text-muted-foreground",
    Maintenance: "bg-warning/10 text-warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bus Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage school buses, routes & student sign-ins</p>
        </div>
        <Dialog open={addBusOpen} onOpenChange={setAddBusOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Bus</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Bus</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addBusMutation.mutate(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Bus Number *</Label><Input value={busNumber} onChange={e => setBusNumber(e.target.value)} required placeholder="BUS-004" /></div>
                <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Driver Name *</Label><Input value={driverName} onChange={e => setDriverName(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Driver Phone</Label><Input value={driverPhone} onChange={e => setDriverPhone(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Route Name *</Label><Input value={routeName} onChange={e => setRouteName(e.target.value)} required placeholder="West Route" /></div>
              <div className="space-y-2"><Label>Stops (comma-separated)</Label><Input value={routeStops} onChange={e => setRouteStops(e.target.value)} placeholder="Stop 1, Stop 2, School" /></div>
              <Button type="submit" className="w-full" disabled={addBusMutation.isPending}>{addBusMutation.isPending ? "Adding..." : "Add Bus"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="buses">
        <TabsList>
          <TabsTrigger value="buses"><Bus className="h-4 w-4 mr-1.5" /> Buses</TabsTrigger>
          <TabsTrigger value="assignments"><Users className="h-4 w-4 mr-1.5" /> Assignments</TabsTrigger>
          <TabsTrigger value="signin"><LogIn className="h-4 w-4 mr-1.5" /> Daily Sign-In</TabsTrigger>
        </TabsList>

        <TabsContent value="buses" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map(bus => {
              const assignedCount = assignments.filter(a => (a as any).buses?.bus_number === bus.bus_number).length;
              return (
                <div key={bus.id} className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Bus className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="font-semibold text-sm">{bus.bus_number}</p>
                        <p className="text-xs text-muted-foreground">{bus.route_name}</p>
                      </div>
                    </div>
                    <Badge className={statusColors[bus.status] ?? ""}>{bus.status}</Badge>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Driver</span><span className="font-medium">{bus.driver_name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Capacity</span><span className="font-medium">{assignedCount}/{bus.capacity}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Stops</span><span className="font-medium text-right">{bus.route_stops.length} stops</span></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {bus.route_stops.map((stop, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-[10px] font-medium">
                        <MapPin className="h-2.5 w-2.5" />{stop}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-4 space-y-4">
          <div className="flex gap-3 items-end">
            <div className="space-y-2 flex-1">
              <Label>Bus</Label>
              <Select value={selectedBus} onValueChange={setSelectedBus}>
                <SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
                <SelectContent>{buses.map(b => <SelectItem key={b.id} value={b.id}>{b.bus_number} — {b.route_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label>Student</Label>
              <Select value={assignStudentId} onValueChange={setAssignStudentId}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={() => assignMutation.mutate()} disabled={!selectedBus || !assignStudentId || assignMutation.isPending}>Assign</Button>
          </div>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Route</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.students?.first_name} {a.students?.last_name}</TableCell>
                    <TableCell>{a.buses?.bus_number}</TableCell>
                    <TableCell>{a.buses?.route_name}</TableCell>
                  </TableRow>
                ))}
                {assignments.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No assignments yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="signin" className="mt-4 space-y-4">
          <div className="flex gap-3 items-end">
            <div className="space-y-2 flex-1">
              <Label>Select Bus</Label>
              <Select value={selectedBus} onValueChange={setSelectedBus}>
                <SelectTrigger><SelectValue placeholder="All buses" /></SelectTrigger>
                <SelectContent>
                  {buses.map(b => <SelectItem key={b.id} value={b.id}>{b.bus_number}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show assigned students for sign-in */}
          {selectedBus && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.filter((a: any) => a.bus_id === selectedBus).map((a: any) => {
                    const signIn = signIns.find((si: any) => si.student_id === a.student_id);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.students?.first_name} {a.students?.last_name}</TableCell>
                        <TableCell>
                          <Badge variant={signIn?.status === "Signed In" ? "default" : signIn?.status === "Signed Out" ? "secondary" : "outline"}>
                            {signIn?.status ?? "Not signed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => signInMutation.mutate({ busId: selectedBus, studentId: a.student_id, action: "in" })}>
                              <LogIn className="h-3.5 w-3.5 mr-1" /> In
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => signInMutation.mutate({ busId: selectedBus, studentId: a.student_id, action: "out" })}>
                              <LogOut className="h-3.5 w-3.5 mr-1" /> Out
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {assignments.filter((a: any) => a.bus_id === selectedBus).length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No students assigned to this bus</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
