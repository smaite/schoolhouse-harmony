import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, School, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function useSchoolSettings() {
  return useQuery({
    queryKey: ["school-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("school_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data.forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });
}

export default function Settings() {
  const { data: settings, isLoading } = useSchoolSettings();
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const qc = useQueryClient();

  // Use state if edited, otherwise fall back to DB value
  const val = (stateVal: string | null, key: string) => stateVal ?? settings?.[key] ?? "";

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates: { key: string; value: string }[] = [
        { key: "school_name", value: val(schoolName, "school_name") },
        { key: "principal", value: val(principal, "principal") },
        { key: "email", value: val(email, "email") },
        { key: "phone", value: val(phone, "phone") },
        { key: "address", value: val(address, "address") },
      ];
      for (const u of updates) {
        const { error } = await supabase.from("school_settings").upsert(
          { key: u.key, value: u.value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["school-settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage school & application preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general"><School className="h-4 w-4 mr-1.5" /> General</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-1.5" /> Security</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-1.5" /> Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6 max-w-2xl">
            <h2 className="font-semibold text-lg">School Information</h2>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>School Name</Label>
                    <Input value={val(schoolName, "school_name")} onChange={(e) => setSchoolName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Principal</Label>
                    <Input value={val(principal, "principal")} onChange={(e) => setPrincipal(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={val(email, "email")} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={val(phone, "phone")} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address</Label>
                    <Input value={val(address, "address")} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5 max-w-2xl">
            <h2 className="font-semibold text-lg">Notification Preferences</h2>
            {[
              { label: "Email notifications for attendance", defaultChecked: true },
              { label: "SMS alerts for fee reminders", defaultChecked: true },
              { label: "Push notifications for announcements", defaultChecked: false },
              { label: "Weekly grade report emails to parents", defaultChecked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <Label className="cursor-pointer">{item.label}</Label>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
            <Button>Save Preferences</Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5 max-w-2xl">
            <h2 className="font-semibold text-lg">Security Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="cursor-pointer">Enable two-factor authentication</Label>
              <Switch />
            </div>
            <Button>Update Password</Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5 max-w-2xl">
            <h2 className="font-semibold text-lg">Appearance</h2>
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">Dark mode</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">Compact sidebar</Label>
              <Switch />
            </div>
            <Button>Save</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
