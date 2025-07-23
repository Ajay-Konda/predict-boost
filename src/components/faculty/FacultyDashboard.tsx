import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, BarChart3, Users, FileText, LogOut } from 'lucide-react';
import DataUpload from './DataUpload';
import PredictionResults from './PredictionResults';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useToast } from '@/hooks/use-toast';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 shadow-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
              <p className="text-white/80 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/80">Logged in as</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-success text-white shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-success-foreground/80">Total Students</p>
                  <p className="text-3xl font-bold">70</p>
                </div>
                <Users className="h-8 w-8 text-success-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-warning text-white shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warning-foreground/80">At Risk</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <FileText className="h-8 w-8 text-warning-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-primary text-white shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80">Avg SGPA</p>
                  <p className="text-3xl font-bold">7.2</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Predictions</p>
                  <p className="text-3xl font-bold text-foreground">70</p>
                </div>
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Data Upload
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Student Data
                </CardTitle>
                <CardDescription>
                  Upload CSV files with student marks or enter data manually. 
                  The system will automatically generate predictions and feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataUpload />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Student Predictions & Feedback
                </CardTitle>
                <CardDescription>
                  View AI-generated predictions and personalized feedback for all students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionResults />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive analytics and insights into class performance and trends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FacultyDashboard;