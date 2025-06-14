import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

interface AccountInfo {
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export function AccountManagement() {
  const { user, logout } = useAuth();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPasswords: false
  });

  // Email change form
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });

  // Username change form
  const [usernameForm, setUsernameForm] = useState({
    newUsername: '',
    password: ''
  });

  // Account deletion form
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmDelete: ''
  });

  // Load account info
  useEffect(() => {
    loadAccountInfo();
  }, []);

  const loadAccountInfo = async () => {
    try {
      const response = await authenticatedFetch('/api/account/info');
      if (response.ok) {
        const data = await response.json();
        setAccountInfo(data.account);
      } else {
        showMessage('error', 'Failed to load account information');
      }
    } catch (error) {
      showMessage('error', 'Error loading account information');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    try {
      const response = await authenticatedFetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showPasswords: false
        });
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to change password');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authenticatedFetch('/api/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message);
        setEmailForm({ newEmail: '', password: '' });
        loadAccountInfo(); // Refresh account info
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to change email');
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authenticatedFetch('/api/account/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: usernameForm.newUsername,
          password: usernameForm.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message + ' Please log in again.');
        
        // Update token if provided
        if (data.newToken) {
          localStorage.setItem('admin_token', data.newToken);
          localStorage.setItem('admin_user', data.newUsername);
        }
        
        // Redirect to login after username change
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to change username');
    }
  };

  const handleAccountDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteForm.confirmDelete !== 'DELETE') {
      showMessage('error', 'Please type "DELETE" to confirm account deletion');
      return;
    }

    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
      return;
    }

    try {
      const response = await authenticatedFetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deleteForm.password,
          confirmDelete: deleteForm.confirmDelete
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message + ' Redirecting to login...');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4 inline mr-2" /> : <AlertTriangle className="h-4 w-4 inline mr-2" />}
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your current account details and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{accountInfo.username}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{accountInfo.email}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                <p className="text-sm mt-1">{new Date(accountInfo.lastLogin).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                <p className="text-sm mt-1">{new Date(accountInfo.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for better security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={passwordForm.showPasswords ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setPasswordForm(prev => ({ ...prev, showPasswords: !prev.showPasswords }))}
                >
                  {passwordForm.showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={passwordForm.showPasswords ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={passwordForm.showPasswords ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
          </CardTitle>
          <CardDescription>
            Update your email address for account notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="new@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPassword">Current Password</Label>
              <Input
                id="emailPassword"
                type="password"
                value={emailForm.password}
                onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Change Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Username */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Username
          </CardTitle>
          <CardDescription>
            Update your username (you will need to log in again)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">New Username</Label>
              <Input
                id="newUsername"
                type="text"
                value={usernameForm.newUsername}
                onChange={(e) => setUsernameForm(prev => ({ ...prev, newUsername: e.target.value }))}
                placeholder="new_username"
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
                minLength={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Username can only contain letters, numbers, and underscores
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usernamePassword">Current Password</Label>
              <Input
                id="usernamePassword"
                type="password"
                value={usernameForm.password}
                onChange={(e) => setUsernameForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Change Username
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone - Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account, 
              all delivery configurations, Shopify settings, and remove all associated data.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleAccountDelete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Current Password</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deleteForm.password}
                onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmDelete">Type "DELETE" to confirm</Label>
              <Input
                id="confirmDelete"
                type="text"
                value={deleteForm.confirmDelete}
                onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmDelete: e.target.value }))}
                placeholder="DELETE"
                required
              />
            </div>
            <Button 
              type="submit" 
              variant="destructive" 
              className="w-full"
              disabled={deleteForm.confirmDelete !== 'DELETE'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account Permanently
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 