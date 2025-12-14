import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AnalyticsDashboardProps {
  selectedCompany: string;
  selectedCountry: string;
}

export function AnalyticsDashboard({ selectedCompany, selectedCountry }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('3months');
  const [analyticsData, setAnalyticsData] = useState<any>({});

  useEffect(() => {
    loadDemoData();
  }, [selectedCompany, selectedCountry, timeRange]);

  
  const loadDemoData = () => {
    setAnalyticsData({
      timeToHire: {
        average: 28,
        trend: -5,
        byDepartment: [
          { name: 'Engineering', value: 32, target: 30 },
          { name: 'Product', value: 25, target: 25 },
          { name: 'Design', value: 22, target: 20 },
          { name: 'Sales', value: 18, target: 15 },
          { name: 'Marketing', value: 30, target: 25 },
          { name: 'Finance', value: 35, target: 30 }
        ]
      },
      sourceEffectiveness: [
        { source: 'LinkedIn', candidates: 45, interviews: 12, offers: 3, costPerHire: 2500 },
        { source: 'Job Boards', candidates: 32, interviews: 8, offers: 2, costPerHire: 800 },
        { source: 'Referrals', candidates: 28, interviews: 15, offers: 6, costPerHire: 500 },
        { source: 'Agencies', candidates: 15, interviews: 5, offers: 1, costPerHire: 5000 },
        { source: 'Direct Applications', candidates: 25, interviews: 6, offers: 2, costPerHire: 200 }
      ],
      hiringFunnel: [
        { stage: 'Applied', count: 145 },
        { stage: 'Screening', count: 89 },
        { stage: 'Interview', count: 46 },
        { stage: 'Offer', count: 14 },
        { stage: 'Hired', count: 10 }
      ],
      monthlyTrends: [
        { month: 'Jun', applications: 85, interviews: 32, offers: 8, hires: 6 },
        { month: 'Jul', applications: 102, interviews: 38, offers: 12, hires: 9 },
        { month: 'Aug', applications: 145, interviews: 46, offers: 14, hires: 10 }
      ],
      offerAcceptanceRate: [
        { department: 'Engineering', rate: 85 },
        { department: 'Product', rate: 90 },
        { department: 'Design', rate: 75 },
        { department: 'Sales', rate: 95 },
        { department: 'Marketing', rate: 80 }
      ],
      diversityMetrics: [
        { category: 'Gender', male: 60, female: 40 },
        { category: 'Nationality', local: 45, regional: 35, international: 20 }
      ]
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const calculateConversionRate = (from: number, to: number) => {
    return from > 0 ? ((to / from) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
    <div className="p-6 space-y-6">
=======
    <div className="pt-16 p-6 space-y-6">
      <header
       className={`fixed top-0 right-0 h-14 flex items-center px-6 z-40 transition-all duration-300 `}
       style={{
         background: "navy",
         color: "#fff",
         width: 1240 + "px",
        }}> 
       </header> 
>>>>>>> Stashed changes
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Recruitment metrics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Time to Hire</p>
                <p className="text-2xl font-bold">{analyticsData.timeToHire?.average} days</p>
                <p className="text-sm text-green-600">↓ {Math.abs(analyticsData.timeToHire?.trend || 0)}% vs last period</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{analyticsData.hiringFunnel?.[0]?.count || 0}</p>
                <p className="text-sm text-green-600">↑ 15% vs last period</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offer Acceptance</p>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-green-600">↑ 3% vs last period</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality of Hire</p>
                <p className="text-2xl font-bold">4.2/5</p>
                <p className="text-sm text-green-600">↑ 0.3 vs last period</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time to Hire by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Time to Hire by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.timeToHire?.byDepartment || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Actual" />
                <Bar dataKey="target" fill="#82ca9d" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Source Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.sourceEffectiveness || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="candidates" fill="#8884d8" name="Candidates" />
                <Bar dataKey="interviews" fill="#82ca9d" name="Interviews" />
                <Bar dataKey="offers" fill="#ffc658" name="Offers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hiring Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.hiringFunnel?.map((stage: any, index: number) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full bg-blue-${600 - index * 100}`}></div>
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{stage.count}</div>
                    {index > 0 && (
                      <div className="text-sm text-gray-500">
                        {calculateConversionRate(analyticsData.hiringFunnel[index - 1].count, stage.count)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#8884d8" name="Applications" />
                <Line type="monotone" dataKey="interviews" stroke="#82ca9d" name="Interviews" />
                <Line type="monotone" dataKey="offers" stroke="#ffc658" name="Offers" />
                <Line type="monotone" dataKey="hires" stroke="#ff7c7c" name="Hires" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Offer Acceptance Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Offer Acceptance Rate by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.offerAcceptanceRate || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Acceptance Rate']} />
                <Bar dataKey="rate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Per Hire */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Per Hire by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.sourceEffectiveness || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Cost Per Hire']} />
                <Bar dataKey="costPerHire" fill="#ff7c7c" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🎯 Top Performing Source</h4>
              <p className="text-sm text-green-700">
                Referrals have the highest conversion rate at 21.4% and lowest cost per hire at $500.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">⚡ Fastest Department</h4>
              <p className="text-sm text-blue-700">
                Sales team achieves fastest time to hire at 18 days, beating target by 3 days.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">🔍 Area for Improvement</h4>
              <p className="text-sm text-orange-700">
                Engineering hiring takes 32 days on average, 2 days over target. Consider process optimization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}