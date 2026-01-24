import React, { useState } from 'react';
import { BaseLayout } from "@/components/BaseLayout";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  LuUser, 
  LuSettings, 
  LuShield, 
  LuBell, 
  LuMoon, 
  LuSun, 
  LuMonitor,
  LuLogOut,
  LuMail,
  LuBuilding,
  LuMapPin
} from "react-icons/lu";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Password updated successfully");
    }, 1000);
  };

  return (
    <BaseLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <UnifiedHeader
          title="Profile & Settings"
          subtitle="Manage your account settings and preferences"
          breadcrumbs={[
            { label: "Profile", href: "/profile" }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* User Sidebar Card */}
          <div className="md:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <CardContent className="pt-0 relative">
                <div className="flex justify-center -mt-12 mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    {/* <AvatarImage src={user?.avatar} /> */}
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                      {user?.full_name ? getInitials(user.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-xl font-bold">{user?.full_name || 'User Name'}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  <div className="pt-2">
                    <Badge variant="secondary" className="capitalize px-3 py-1">
                      {user?.role || 'Staff'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <LuBuilding className="h-4 w-4" />
                    <span>AMS Enterprise</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <LuMapPin className="h-4 w-4" />
                    <span>New Delhi, India</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <LuMail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4">
                <Button variant="destructive" className="w-full" onClick={logout}>
                  <LuLogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <div className="md:col-span-3">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" defaultValue={user?.full_name || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" defaultValue={user?.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" placeholder="+91 98765 43210" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="designation">Designation</Label>
                          <Input id="designation" placeholder="Senior Manager" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" placeholder="Tell us a little about yourself" />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about your account activity.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Asset Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when assets require maintenance.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about new features and updates.
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Preferences</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`cursor-pointer rounded-lg border-2 p-4 hover:border-blue-500 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-border'}`}
                        onClick={() => setTheme('light')}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 rounded-full bg-card shadow-sm border text-orange-500 dark:text-orange-400">
                            <LuSun className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Light Mode</p>
                            <p className="text-xs text-muted-foreground mt-1">Clean and bright</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`cursor-pointer rounded-lg border-2 p-4 hover:border-blue-500 transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-border'}`}
                        onClick={() => setTheme('dark')}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 rounded-full bg-slate-900 shadow-sm border border-slate-700 text-blue-400">
                            <LuMoon className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-xs text-muted-foreground mt-1">Easy on the eyes</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`cursor-pointer rounded-lg border-2 p-4 hover:border-blue-500 transition-all ${theme === 'system' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-border'}`}
                        onClick={() => setTheme('system')}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm border text-slate-600 dark:text-slate-400">
                            <LuMonitor className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">System</p>
                            <p className="text-xs text-muted-foreground mt-1">Match device settings</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Ensure your account is secure by using a strong password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current">Current Password</Label>
                        <Input id="current" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">New Password</Label>
                        <Input id="new" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm New Password</Label>
                        <Input id="confirm" type="password" />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-300">Delete Account</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">Permanently delete your account and all data.</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
