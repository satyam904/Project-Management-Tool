import { useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { User, Shield, Bell, Palette, Settings as SettingsIcon, Check, Loader2, Sun, Moon } from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { updateMe, changePassword } from '../../api/auth'
import { clsx } from 'clsx'
import { toast } from 'react-hot-toast'

type TabId = 'profile' | 'security' | 'notifications' | 'appearance'

export function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [isLoading, setIsLoading] = useState(false)

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  })

  // Security Form State
  const [securityData, setSecurityData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Notifications Form State
  const [notifData, setNotifData] = useState({
    email_notifications: user?.email_notifications ?? true,
    push_notifications: user?.push_notifications ?? true,
    marketing_emails: user?.marketing_emails ?? false,
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updatedUser = await updateMe({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      })
      setUser(updatedUser)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (securityData.new_password !== securityData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await changePassword({
        old_password: securityData.old_password,
        new_password: securityData.new_password,
        confirm_password: securityData.confirm_password,
      })
      toast.success('Password changed successfully')
      setSecurityData({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (typeof errors === 'object') {
        Object.values(errors).flat().forEach((err: any) => toast.error(err))
      } else {
        toast.error('Failed to change password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateNotifications = async (field: string, value: boolean) => {
    const newData = { ...notifData, [field]: value }
    setNotifData(newData)
    try {
      const updatedUser = await updateMe(newData)
      setUser(updatedUser)
      toast.success('Notification preferences updated')
    } catch (error) {
      toast.error('Failed to update preferences')
    }
  }

  return (
    <PageWrapper title="Settings">
      <div className="max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Tabs Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-2">
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest px-4 mb-6 opacity-60">Personal Settings</h2>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3.5 rounded-premium-lg transition-all text-sm font-medium group',
                  activeTab === tab.id 
                    ? 'bg-primary-bg text-primary shadow-sm' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-h'
                )}
              >
                <tab.icon className={clsx(
                  'w-4 h-4 transition-colors',
                  activeTab === tab.id ? 'text-primary' : 'text-text-muted group-hover:text-text-h'
                )} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </aside>

          {/* Tab Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold text-text-h">Profile Information</h3>
                  <p className="text-text-muted">Update your photo and personal details.</p>
                </div>
                
                <Card className="p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        value={profileData.first_name}
                        onChange={e => setProfileData({ ...profileData, first_name: e.target.value })}
                        placeholder="John"
                        required
                      />
                      <Input
                        label="Last Name"
                        value={profileData.last_name}
                        onChange={e => setProfileData({ ...profileData, last_name: e.target.value })}
                        placeholder="Doe"
                        required
                      />
                    </div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      disabled
                      placeholder="john@example.com"
                      className="bg-background-soft"
                    />
                    <div className="flex justify-end pt-4 border-t border-border-default mt-8">
                      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold text-text-h">Security</h3>
                  <p className="text-text-muted">Ensure your account is protected with a strong password.</p>
                </div>

                <Card className="p-8">
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <Input
                      label="Current Password"
                      type="password"
                      value={securityData.old_password}
                      onChange={e => setSecurityData({ ...securityData, old_password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="New Password"
                        type="password"
                        value={securityData.new_password}
                        onChange={e => setSecurityData({ ...securityData, new_password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={securityData.confirm_password}
                        onChange={e => setSecurityData({ ...securityData, confirm_password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-border-default mt-8">
                      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold text-text-h">Notifications</h3>
                  <p className="text-text-muted">Pick which notifications you'd like to receive and where.</p>
                </div>

                <Card className="divide-y divide-border-default overflow-hidden">
                  {[
                    { id: 'email_notifications', title: 'Email Notifications', desc: 'Receive daily digests and activity updates via email.' },
                    { id: 'push_notifications', title: 'Push Notifications', desc: 'Get real-time browser alerts while you work.' },
                    { id: 'marketing_emails', title: 'Marketing Emails', desc: 'Receive updates about new features and ecosystem news.' },
                  ].map((notif) => (
                    <div key={notif.id} className="p-8 flex items-center justify-between hover:bg-surface/30 transition-colors">
                      <div className="space-y-1 pr-12">
                        <h4 className="font-bold text-text-h">{notif.title}</h4>
                        <p className="text-sm text-text-muted leading-relaxed">{notif.desc}</p>
                      </div>
                      <button
                        onClick={() => handleUpdateNotifications(notif.id, !notifData[notif.id as keyof typeof notifData])}
                        className={clsx(
                          'w-12 h-6 rounded-full transition-all relative shrink-0 outline-none',
                          notifData[notif.id as keyof typeof notifData] ? 'bg-primary' : 'bg-surface-strong'
                        )}
                      >
                        <div className={clsx(
                          'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all',
                          notifData[notif.id as keyof typeof notifData] ? 'right-1' : 'left-1'
                        )} />
                      </button>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold text-text-h">Appearance</h3>
                  <p className="text-text-muted">Customize the interface theme to fit your workflow.</p>
                </div>

                <Card className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'light', label: 'Light Mode', desc: 'Clean and bright.' },
                      { id: 'dark', label: 'Dark Mode', desc: 'Easier on the eyes.' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as 'light' | 'dark')}
                        className={clsx(
                          'flex flex-col items-center gap-6 p-6 rounded-premium-lg border-2 transition-all relative group',
                          theme === t.id 
                            ? 'border-primary bg-primary-bg ring-4 ring-primary/5' 
                            : 'border-border-default hover:border-border-strong bg-surface/50'
                        )}
                      >
                        <div className={clsx(
                          'w-full aspect-[16/10] rounded-lg shadow-premium overflow-hidden border border-border-default transition-transform group-hover:scale-102',
                          t.id === 'light' ? 'bg-[#f8fafc]' : 'bg-[#0f172a]'
                        )}>
                           <div className="p-4 space-y-2">
                             <div className={clsx("h-4 w-2/3 rounded opacity-20", t.id === 'light' ? 'bg-slate-900' : 'bg-white')} />
                             <div className={clsx("h-4 w-full rounded opacity-10", t.id === 'light' ? 'bg-slate-900' : 'bg-white')} />
                             <div className="grid grid-cols-3 gap-2 pt-2">
                               <div className={clsx("h-8 rounded", t.id === 'light' ? 'bg-slate-200' : 'bg-slate-700')} />
                               <div className={clsx("h-8 rounded", t.id === 'light' ? 'bg-slate-200' : 'bg-slate-700')} />
                               <div className={clsx("h-8 rounded", t.id === 'light' ? 'bg-slate-200' : 'bg-slate-700')} />
                             </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={clsx(
                             "p-2 rounded-lg transition-colors",
                             theme === t.id ? "bg-primary text-white" : "bg-surface text-text-muted"
                           )}>
                             {t.id === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                           </div>
                           <div className="text-left">
                             <p className={clsx("text-sm font-bold", theme === t.id ? "text-primary" : "text-text-h")}>{t.label}</p>
                             <p className="text-xs text-text-muted">{t.desc}</p>
                           </div>
                        </div>
                        {theme === t.id && (
                          <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full animate-in zoom-in duration-300">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageWrapper>
  )
}

