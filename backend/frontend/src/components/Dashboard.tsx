import React, { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  FileText, 
  Calendar, 
  HandHeart, 
  TrendingUp, 
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { NotificationService, Notification } from '../utils/Utils';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface DashboardProps {
  selectedCompany: string;
  selectedCountry: string;

}

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  iconName?: string;
  route: string;
}

interface RequisitionItem {
  id: string;
  title: string;
  department: string;
  status: string;
  daysOpen: number;
  applicants: number;
  stage: string;
  priority: 'high' | 'medium' | 'low';
}

export function Dashboard({ selectedCompany, selectedCountry  }: DashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  // const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [recentRequisitions, setRecentRequisitions] = useState<RequisitionItem[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [dashCount, setDashCount] = useState<any>();
  const navigate = useNavigate();
 

  useEffect(() => {
      dashboardData();
      loadDemoData();
  }, [selectedCompany, selectedCountry]);

  // Icon mapping for server responses
  const iconMap: { [key: string]: any } = {
    'FileText': FileText,
    'Users': Users,
    'Calendar': Calendar,
    'HandHeart': HandHeart,
    'Clock': Clock,
    'Target': Target
  };


  const dashboardData = async ()=>{
      setLoading(true);
      try{
        const response = await fetch(`${API_BASE_URL}/summary`,
        { method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization':  
            // Include auth token if required
          },
        }
        );
        if(!response.ok){
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        console.log('count',data);
        setDashCount(data.summary);  
        setRecentRequisitions(data.recent_requisitions);
        setUpcomingInterviews(data.upcoming_interviews);
        setPendingApprovals(data.pending_approvals);
        console.log('Dashboard data:', data);
        // Process and set metrics
      }
      catch(error){
        console.error('Error fetching dashboard data:', error);
      }
    finally{
        setLoading(false);
    }}

      console.log('DashCount:', dashCount?.open_positions);

  const metrics = [
      {
        title: 'Open Positions',
        value: dashCount?.open_positions || 0,
        change: '+12%',
        changeType: 'increase',
        icon: FileText,
        route: "/requisitions"
      },
      {
        title: 'Active Candidates',
        value: dashCount?.active_candidates || 0,
        change: '+8%',
        changeType: 'increase',
        icon: Users,
        route: "/candidates"
      },
      {
        title: 'Scheduled Interviews',
        value: dashCount?.scheduled_interviews || 0,
        change: '+3',
        changeType: 'increase',
        icon: Calendar,
        route: "/interviews"
      },
      {
        title: 'Pending Offers',
        value: 8,
        change: '-2',
        changeType: 'decrease',
        icon: HandHeart,
        route: "/offers"
      },
      {
        title: 'Time to Hire (Days)',
        value: 28,
        change: '-5%',
        changeType: 'decrease',
        icon: Clock,
        route: "/analytics"
      },
      {
        title: 'Offer Acceptance Rate',
        value: '85%',
        change: '+3%',
        changeType: 'increase',
        icon: Target,
        route: "/analytics"
      }
    ]
  const loadDemoData = () => {
   

    // setRecentRequisitions([
    //   {
    //     id: 'REQ-2025-001',
    //     title: 'Senior Software Engineer',
    //     department: 'Engineering',
    //     status: 'Active',
    //     daysOpen: 12,
    //     applicants: 23,
    //     stage: 'Screening',
    //     priority: 'high'
    //   },
    //   {
    //     id: 'REQ-2025-002', 
    //     title: 'Product Manager',
    //     department: 'Product',
    //     status: 'Active',
    //     daysOpen: 8,
    //     applicants: 31,
    //     stage: 'Interview',
    //     priority: 'high'
    //   },
    //   {
    //     id: 'REQ-2025-003',
    //     title: 'UI/UX Designer',
    //     department: 'Design',
    //     status: 'Pending Approval',
    //     daysOpen: 3,
    //     applicants: 0,
    //     stage: 'Draft',
    //     priority: 'medium'
    //   },
    //   {
    //     id: 'REQ-2025-004',
    //     title: 'Sales Manager - KSA',
    //     department: 'Sales',
    //     status: 'Active',
    //     daysOpen: 15,
    //     applicants: 18,
    //     stage: 'Offer',
    //     priority: 'high'
    //   }
    // ]);

    setUpcomingInterviews([
      {
        id: 1,
        candidateName: 'Ahmed Al-Rashid',
        position: 'Senior Software Engineer',
        time: '10:00 AM',
        date: 'Today',
        interviewer: 'Sarah Johnson',
        type: 'Technical'
      },
      {
        id: 2,
        candidateName: 'Fatima Al-Zahra',
        position: 'Product Manager',
        time: '2:00 PM',
        date: 'Today',
        interviewer: 'Mike Chen',
        type: 'Behavioral'
      },
      {
        id: 3,
        candidateName: 'Omar Hassan',
        position: 'UI/UX Designer',
        time: '9:00 AM',
        date: 'Tomorrow',
        interviewer: 'Lisa Park',
        type: 'Portfolio Review'
      }
    ]);

    // setPendingApprovals([
    //   {
    //     id: 1,
    //     type: 'Requisition',
    //     title: 'Senior Data Engineer',
    //     requester: 'Tech Lead',
    //     daysWaiting: 2,
    //     priority: 'high'
    //   },
    //   {
    //     id: 2,
    //     type: 'Offer',
    //     title: 'Marketing Specialist - UAE',
    //     requester: 'HR Manager',
    //     daysWaiting: 1,
    //     priority: 'medium'
    //   }
    // ]);
  };


  // Add this function inside your Dashboard component (before the return statement)
    const handleCardClick = (route: string) => {
      navigate(route);
      console.log('Navigating to:', route);
    };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending approval': return 'bg-yellow-100 text-yellow-800';
      case 'on hold': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

     const daysOpen = (createdDate: string) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };


  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}. Here's your recruitment overview.
          </p>
        </div>
        <div className="flex space-x-2">
          {/* <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button> */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
         
          console.log('Metric route:', metric.route, metric.title);
          return (
            
            <Card key={index} className="hover:shadow-md transition-shadow" 
                        onClick={() => handleCardClick(metric.route)} style={{cursor:'pointer'}}
                        >
              <CardContent className="p-6" >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm ${
                        metric.changeType === 'increase' ? 'text-green-600' : 
                        metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.changeType === 'increase' && '↗'}
                        {metric.changeType === 'decrease' && '↙'}
                        {metric.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
           
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requisitions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requisitions">Recent Requisitions</TabsTrigger>
          <TabsTrigger value="interviews">Upcoming Interviews</TabsTrigger>
          {/* <TabsTrigger value="approvals">Pending Approvals</TabsTrigger> */}
        </TabsList>

        <TabsContent value="requisitions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Recent Requisitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequisitions.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{req.position}</h3>
                        <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                        <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span>{req.department}</span>
                        <span>{req.req_id}</span>
                        <span>{daysOpen(req.created_date)} days open</span>
                        <span>{req.applications_count} applicants</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{req.stage}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{interview.candidateName}</h3>
                      <p className="text-sm text-gray-600">{interview.position}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                        <span>{interview.date} at {interview.time}</span>
                        <span>•</span>
                        <span>with {interview.interviewer}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{interview.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{approval.position}</h3>
                        <Badge className={getPriorityColor(approval.priority)}>{approval.priority}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-2">
                        <span>{approval.type}</span>
                        <span>•</span>
                        <span>by {approval.requester}</span>
                        <span>•</span>
                        <span>{approval.daysWaiting} days waiting</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Review</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
      {/* Notifications Panel */}
      <NotificationsPanel userId={Number(user?.id || 0)} />
    </div>
  );
}

 const NotificationsPanel: React.FC<{ userId: number }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const service = new NotificationService(userId, (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      service.close();
    };
  }, [userId]);

  return (
    <div className="notifications-panel">
      {notifications.map((notif, idx) => (
        <div key={idx} className="notification-item">
          <strong>{notif.title}</strong>
          <p>{notif.message}</p>
          {notif.time && <small>{new Date(notif.time).toLocaleString()}</small>}
        </div>
      ))}
    </div>
  );
};