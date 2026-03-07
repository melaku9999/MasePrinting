"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Settings, 
  Key, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react"
import { User as AuthUser } from "@/lib/auth"

interface ProfileManagementProps {
  user: AuthUser
  onBack?: () => void
  onSave?: (updatedUser: Partial<AuthUser>) => void
  showBackButton?: boolean
  inline?: boolean
}

export function ProfileManagement({ user, onBack, onSave, showBackButton = true, inline = false }: ProfileManagementProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: "",
    address: "",
    bio: "",
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskUpdates: true,
    projectDeadlines: true,
    systemAlerts: false,
    weeklyReports: true,
  })

  const handleProfileSave = () => {
    if (onSave) {
      onSave({
        name: profileData.name,
        email: profileData.email,
      })
    }
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirmation don't match")
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }
    // Handle password change logic here
    alert("Password updated successfully!")
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleNotificationSave = () => {
    // Handle notification settings save
    alert("Notification settings updated!")
  }

  return (
    <div className={inline ? "space-y-6" : "max-w-4xl mx-auto space-y-6 px-4 lg:px-0"}>
      {showBackButton && !inline && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl lg:text-2xl font-bold text-center sm:text-left">Profile Settings</h1>
        </div>
      )}

      {inline && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-center sm:text-left">Profile Settings</h2>
          <Badge variant="outline">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
                <AvatarFallback className="text-lg lg:text-xl bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-base lg:text-lg break-words">{user.name}</h3>
                <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                <Badge variant="outline" className="mt-2">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} ${isMobile ? 'h-auto' : ''}`}>
              <TabsTrigger value="personal" className={`flex items-center gap-2 ${isMobile ? 'justify-start p-3' : ''}`}>
                <User className="h-4 w-4" />
                <span className={isMobile ? 'text-sm' : ''}>Personal Info</span>
              </TabsTrigger>
              <TabsTrigger value="security" className={`flex items-center gap-2 ${isMobile ? 'justify-start p-3' : ''}`}>
                <Shield className="h-4 w-4" />
                <span className={isMobile ? 'text-sm' : ''}>Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className={`flex items-center gap-2 ${isMobile ? 'justify-start p-3' : ''}`}>
                <Bell className="h-4 w-4" />
                <span className={isMobile ? 'text-sm' : ''}>Notifications</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full sm:w-auto"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        disabled={!isEditing}
                        placeholder="123 Main St, City, State 12345"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none disabled:opacity-50"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleProfileSave} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Account Created</Label>
                      <p className="text-sm text-muted-foreground">January 15, 2024</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Status</Label>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">User ID</Label>
                      <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Password Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter your current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Include uppercase and lowercase letters</li>
                        <li>• Include at least one number</li>
                        <li>• Include at least one special character</li>
                      </ul>
                    </div>

                    <Button 
                      onClick={handlePasswordChange}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Authentication</p>
                        <p className="text-sm text-muted-foreground">Receive verification codes via SMS</p>
                      </div>
                      <Badge variant="outline">Not Enabled</Badge>
                    </div>
                    <Button variant="outline">Enable Two-Factor Authentication</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Task Updates</p>
                        <p className="text-sm text-muted-foreground">Get notified when tasks are assigned or updated</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.taskUpdates}
                        onChange={(e) => setNotifications({ ...notifications, taskUpdates: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Project Deadlines</p>
                        <p className="text-sm text-muted-foreground">Reminders about upcoming deadlines</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.projectDeadlines}
                        onChange={(e) => setNotifications({ ...notifications, projectDeadlines: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Alerts</p>
                        <p className="text-sm text-muted-foreground">Important system maintenance and updates</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.systemAlerts}
                        onChange={(e) => setNotifications({ ...notifications, systemAlerts: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReports}
                        onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>

                  <Button onClick={handleNotificationSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}