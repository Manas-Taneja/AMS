import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Save, User, Bell, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BaseLayout } from "../components/BaseLayout";

const Settings: React.FC = () => {
  // Mock user settings state
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    email: "jane.doe@email.com",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });
  const [theme, setTheme] = useState("light");
  const [saving, setSaving] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000); // Mock save
  };

  return (
    <BaseLayout className="p-8">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Profile Section */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5" /> Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1 ">Name</label>
                  <Input
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                  <Input
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="w-5 h-5" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-foreground">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={e => setNotifications(n => ({ ...n, email: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <Input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={e => setNotifications(n => ({ ...n, sms: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Theme Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Sun className="w-5 h-5" /> Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" /> Light
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </BaseLayout>
  );
};

export default Settings;
