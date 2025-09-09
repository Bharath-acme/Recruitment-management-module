import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Globe, 
  Bell,
  Key,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useAuth } from './AuthProvider';

export function AdminPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'admin',
      status: 'active',
      company: 'ACME Corporation',
      country: 'UAE',
      lastLogin: '2025-08-30T09:15:00',
      createdDate: '2024-06-15'
    },
    {
      id: '2',
      name: 'Ahmed Al-Rashid',
      email: 'ahmed.rashid@company.com',
      role: 'recruiter',
      status: 'active',
      company: 'ACME Corporation',
      country: 'UAE',
      lastLogin: '2025-08-30T08:45:00',
      createdDate: '2024-07-20'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      role: 'hiring_manager',
      status: 'active',
      company: 'Global Tech Solutions',
      country: 'KSA',
      lastLogin: '2025-08-29T16:30:00',
      createdDate: '2024-08-10'
    }
  ]);

  const [systemSettings, setSystemSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dataRetentionPeriod: 24,
    autoApprovalLimit: 50000,
    requireTwoFactor: false,
    allowGuestAccess: false,
    maintenanceMode: false
  });

  const [auditLogs, setAuditLogs] = useState([
    {
      id: '1',
      timestamp: '2025-08-30T10:30:00',
      user: 'Sarah Johnson',
      action: 'Created Requisition',
      entity: 'REQ-2025-001',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2025-08-30T10:15:00',
      user: 'Ahmed Al-Rashid',
      action: 'Updated Candidate',
      entity: 'CND-001',
      ipAddress: '192.168.1.101',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2025-08-30T09:45:00',
      user: 'System',
      action: 'Failed Login Attempt',
      entity: 'unknown@example.com',
      ipAddress: '203.0.113.1',
      status: 'failed'
    }
  ]);

  const [systemStats, setSystemStats] = useState({
    totalUsers: 25,
    activeUsers: 23,
    totalRequisitions: 45,
    totalCandidates: 187,
    storageUsed: 2.3, // GB
    storageLimit: 10, // GB
    apiCallsToday: 1250,
    apiCallsLimit: 10000
  });

  const handleSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportData = () => {
    setLoading(true);
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      // Trigger download
      const element = document.createElement('a');
      const file = new Blob(['Sample export data...'], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `talent-acquisition-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2000);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'recruiter': return 'bg-blue-100 text-blue-800';
      case 'hiring_manager': return 'bg-green-100 text-green-800';
      case 'interviewer': return 'bg-purple-100 text-purple-800';
      case 'finance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuditStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">System administration and configuration</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Data
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                <p className="text-sm text-green-600">{systemStats.activeUsers} active</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Usage</p>
                <p className="text-2xl font-bold">{systemStats.storageUsed} GB</p>
                <p className="text-sm text-gray-600">of {systemStats.storageLimit} GB</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls Today</p>
                <p className="text-2xl font-bold">{systemStats.apiCallsToday.toLocaleString()}</p>
                <p className="text-sm text-gray-600">of {systemStats.apiCallsLimit.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company & Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{user.company}</div>
                          <div className="text-sm text-gray-500">{user.country}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Reset</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch
                    id="sms-notifications"
                    checked={systemSettings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Require Two-Factor Auth</Label>
                  <Switch
                    id="two-factor"
                    checked={systemSettings.requireTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('requireTwoFactor', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="guest-access">Allow Guest Access</Label>
                  <Switch
                    id="guest-access"
                    checked={systemSettings.allowGuestAccess}
                    onCheckedChange={(checked) => handleSettingChange('allowGuestAccess', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="retention-period">Data Retention Period (months)</Label>
                  <Input
                    id="retention-period"
                    type="number"
                    value={systemSettings.dataRetentionPeriod}
                    onChange={(e) => handleSettingChange('dataRetentionPeriod', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="approval-limit">Auto Approval Limit (AED)</Label>
                  <Input
                    id="approval-limit"
                    type="number"
                    value={systemSettings.autoApprovalLimit}
                    onChange={(e) => handleSettingChange('autoApprovalLimit', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch
                    id="maintenance-mode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Application
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.entity}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getAuditStatusIcon(log.status)}
                          <span className="ml-2 capitalize">{log.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">LinkedIn Jobs</div>
                        <div className="text-sm text-gray-500">Job posting integration</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">Microsoft Teams</div>
                        <div className="text-sm text-gray-500">Calendar & meetings</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Dynamics 365</div>
                        <div className="text-sm text-gray-500">HRIS integration</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="api-key"
                      type="password"
                      value="sk-xxxxxxxxxxxxxxxxxxxxx"
                      readOnly
                    />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>

                <div>
                  <Label>Webhook URLs</Label>
                  <div className="space-y-2 mt-1">
                    <Input
                      placeholder="Candidate webhook URL"
                      value="https://api.yourcompany.com/webhooks/candidates"
                    />
                    <Input
                      placeholder="Interview webhook URL"
                      value="https://api.yourcompany.com/webhooks/interviews"
                    />
                  </div>
                </div>

                <Button className="w-full">
                  Test Integrations
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}