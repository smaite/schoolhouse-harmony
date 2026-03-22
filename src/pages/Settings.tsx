import { Settings as SettingsIcon, School, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input defaultValue="Schoolers Academy" />
              </div>
              <div className="space-y-2">
                <Label>Principal</Label>
                <Input defaultValue="Dr. Angela White" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="admin@schoolers.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+1 (555) 012-3456" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address</Label>
                <Input defaultValue="123 Education Lane, Knowledge City" />
              </div>
            </div>
            <Button>Save Changes</Button>
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
