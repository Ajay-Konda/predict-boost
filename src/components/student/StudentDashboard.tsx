import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredStudents, mockSubjects } from '@/data/mockData';
import { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BookOpen, 
  Target,
  LogOut,
  User
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<Student | null>(null);

  useEffect(() => {
    if (user?.role === 'student') {
      const students = getStoredStudents();
      const student = students.find(s => s.email === user.email);
      setStudentData(student || null);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <TrendingDown className="h-5 w-5" />;
      case 'medium': return <AlertTriangle className="h-5 w-5" />;
      case 'low': return <TrendingUp className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getSubjectCode = (subjectId: string) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    return subject ? subject.code : 'Unknown';
  };

  const calculateSubjectPercentage = (marks: any, subjectId: string) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    if (!subject) return 0;

    const mark = marks.find((m: any) => m.subjectId === subjectId);
    if (!mark) return 0;

    const totalObtained = mark.mid1 + mark.mid2 + mark.internal + mark.endSem;
    const totalMax = subject.maxMarks.mid1 + subject.maxMarks.mid2 + 
                    subject.maxMarks.internal + subject.maxMarks.endSem;
    return (totalObtained / totalMax) * 100;
  };

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-card">
        <div className="bg-gradient-primary text-white p-6 shadow-card">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                <p className="text-white/80 mt-1">Welcome, {user?.name}</p>
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

        <div className="max-w-4xl mx-auto p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No academic data found for your account. Please contact your faculty to upload your marks.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 shadow-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{studentData.name}</h1>
                <p className="text-white/80 mt-1">PIN: {studentData.pin} • Semester: {studentData.semester}</p>
              </div>
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Performance Overview */}
        {studentData.prediction && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-primary text-white shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80">Predicted SGPA</p>
                    <p className="text-3xl font-bold">
                      {studentData.prediction.expectedSGPA.toFixed(2)}
                    </p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-primary-foreground/80" />
                </div>
              </CardContent>
            </Card>

            <Card className={`${
              studentData.prediction.riskStatus === 'high' ? 'bg-gradient-warning' :
              studentData.prediction.riskStatus === 'medium' ? 'bg-gradient-warning' :
              'bg-gradient-success'
            } text-white shadow-card`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80">Risk Status</p>
                    <p className="text-lg font-bold capitalize">
                      {studentData.prediction.riskStatus} Risk
                    </p>
                  </div>
                  {getRiskIcon(studentData.prediction.riskStatus)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Confidence</p>
                    <p className="text-3xl font-bold text-foreground">
                      {(studentData.prediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Subjects</p>
                    <p className="text-3xl font-bold text-foreground">
                      {mockSubjects.length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Marks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Current Academic Performance</CardTitle>
            <CardDescription>
              Your marks across all subjects for the current semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Mid-1</TableHead>
                    <TableHead className="text-center">Mid-2</TableHead>
                    <TableHead className="text-center">Internal</TableHead>
                    <TableHead className="text-center">End-Sem</TableHead>
                    <TableHead className="text-center">Total %</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.marks.map((mark, index) => {
                    const subject = mockSubjects.find(s => s.id === mark.subjectId);
                    const percentage = calculateSubjectPercentage(studentData.marks, mark.subjectId);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getSubjectName(mark.subjectId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {getSubjectCode(mark.subjectId)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {mark.mid1}/{subject?.maxMarks.mid1}
                        </TableCell>
                        <TableCell className="text-center">
                          {mark.mid2}/{subject?.maxMarks.mid2}
                        </TableCell>
                        <TableCell className="text-center">
                          {mark.internal}/{subject?.maxMarks.internal}
                        </TableCell>
                        <TableCell className="text-center">
                          {mark.endSem}/{subject?.maxMarks.endSem}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                            <Progress value={percentage} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={percentage >= 75 ? "success" : percentage >= 50 ? "warning" : "destructive"}
                          >
                            {percentage >= 75 ? "Excellent" : percentage >= 50 ? "Good" : "Needs Improvement"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        {studentData.prediction && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Feedback */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  AI Feedback & Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized insights based on your performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentData.prediction.feedback.map((feedback, index) => (
                  <Alert key={index}>
                    <AlertDescription>{feedback}</AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>

            {/* Subject-wise Feedback */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Subject-wise Insights
                </CardTitle>
                <CardDescription>
                  Specific recommendations for each subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentData.prediction.subjectWiseFeedback.slice(0, 3).map((subject, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">
                        {getSubjectCode(subject.subjectId)}
                      </h4>
                      <span className="text-xs font-medium text-muted-foreground">
                        Expected: {subject.prediction.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {subject.feedback}
                    </p>
                    <p className="text-sm text-primary">
                      💡 {subject.improvement}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Tracking */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Track your progress across different assessment components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['mid1', 'mid2', 'internal', 'endSem'].map((component) => {
                const componentName = component === 'mid1' ? 'Mid-1' : 
                                     component === 'mid2' ? 'Mid-2' : 
                                     component === 'internal' ? 'Internal' : 'End-Sem';
                
                const averagePercentage = studentData.marks.reduce((sum, mark) => {
                  const subject = mockSubjects.find(s => s.id === mark.subjectId);
                  if (!subject) return sum;
                  
                  const maxMark = subject.maxMarks[component as keyof typeof subject.maxMarks];
                  const obtainedMark = mark[component as keyof typeof mark];
                  return sum + ((obtainedMark as number) / maxMark) * 100;
                }, 0) / studentData.marks.length;

                return (
                  <div key={component} className="text-center">
                    <h3 className="font-medium mb-2">{componentName}</h3>
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${averagePercentage}, 100`}
                          className="text-primary"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-muted"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{averagePercentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <Badge 
                      variant={averagePercentage >= 75 ? "success" : averagePercentage >= 50 ? "warning" : "destructive"}
                      className="text-xs"
                    >
                      {averagePercentage >= 75 ? "Excellent" : averagePercentage >= 50 ? "Good" : "Improve"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;