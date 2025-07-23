import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getStoredStudents, mockSubjects } from '@/data/mockData';
import { Student, AnalyticsData } from '@/types';
import { BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const storedStudents = getStoredStudents();
    setStudents(storedStudents);
    generateAnalytics(storedStudents);
  }, []);

  const generateAnalytics = (studentData: Student[]) => {
    const studentsWithPredictions = studentData.filter(s => s.prediction);
    
    if (studentsWithPredictions.length === 0) {
      setAnalytics(null);
      return;
    }

    const totalStudents = studentsWithPredictions.length;
    const atRiskStudents = studentsWithPredictions.filter(
      s => s.prediction?.riskStatus === 'high' || s.prediction?.riskStatus === 'medium'
    ).length;

    const averageSGPA = studentsWithPredictions.reduce(
      (sum, student) => sum + (student.prediction?.expectedSGPA || 0), 0
    ) / totalStudents;

    // Subject-wise performance
    const subjectWisePerformance = mockSubjects.map(subject => {
      const subjectMarks = studentsWithPredictions.map(student => {
        const marks = student.marks.find(m => m.subjectId === subject.id);
        if (!marks) return 0;
        
        const totalObtained = marks.mid1 + marks.mid2 + marks.internal + marks.endSem;
        const totalMax = subject.maxMarks.mid1 + subject.maxMarks.mid2 + 
                        subject.maxMarks.internal + subject.maxMarks.endSem;
        return (totalObtained / totalMax) * 100;
      });

      const average = subjectMarks.reduce((sum, mark) => sum + mark, 0) / subjectMarks.length;
      const passRate = (subjectMarks.filter(mark => mark >= 40).length / subjectMarks.length) * 100;

      return {
        subjectId: subject.id,
        average,
        passRate
      };
    });

    // SGPA distribution
    const sgpaRanges = [
      { range: '9.0-10.0', min: 9.0, max: 10.0 },
      { range: '8.0-8.9', min: 8.0, max: 8.9 },
      { range: '7.0-7.9', min: 7.0, max: 7.9 },
      { range: '6.0-6.9', min: 6.0, max: 6.9 },
      { range: '5.0-5.9', min: 5.0, max: 5.9 },
      { range: '0.0-4.9', min: 0.0, max: 4.9 }
    ];

    const sgpaDistribution = sgpaRanges.map(range => ({
      range: range.range,
      count: studentsWithPredictions.filter(
        s => s.prediction && 
        s.prediction.expectedSGPA >= range.min && 
        s.prediction.expectedSGPA <= range.max
      ).length
    }));

    setAnalytics({
      totalStudents,
      atRiskStudents,
      averageSGPA,
      subjectWisePerformance,
      sgpaDistribution
    });
  };

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analytics Available</h3>
          <p className="text-muted-foreground">
            Please upload student data and generate predictions first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80">Total Students</p>
                <p className="text-3xl font-bold">{analytics.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-primary-foreground/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-warning text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning-foreground/80">At Risk Students</p>
                <p className="text-3xl font-bold">{analytics.atRiskStudents}</p>
                <p className="text-sm text-warning-foreground/80">
                  {((analytics.atRiskStudents / analytics.totalStudents) * 100).toFixed(1)}% of total
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning-foreground/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-success text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-foreground/80">Average SGPA</p>
                <p className="text-3xl font-bold">{analytics.averageSGPA.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success-foreground/80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Pass Rate</p>
                <p className="text-3xl font-bold text-foreground">
                  {((analytics.totalStudents - analytics.atRiskStudents) / analytics.totalStudents * 100).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SGPA Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>SGPA Distribution</CardTitle>
          <CardDescription>
            Distribution of predicted SGPA across different grade ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.sgpaDistribution.map((dist, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">
                  {dist.range}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={(dist.count / analytics.totalStudents) * 100} 
                    className="h-6"
                  />
                </div>
                <div className="w-16 text-sm text-right">
                  {dist.count} students
                </div>
                <div className="w-12 text-sm text-muted-foreground text-right">
                  {((dist.count / analytics.totalStudents) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Performance</CardTitle>
          <CardDescription>
            Average performance and pass rates for each subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.subjectWisePerformance.map((subject, index) => {
              const subjectInfo = mockSubjects.find(s => s.id === subject.subjectId);
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{subjectInfo?.name}</h3>
                      <p className="text-sm text-muted-foreground">{subjectInfo?.code}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={subject.average >= 70 ? "success" : subject.average >= 50 ? "warning" : "destructive"}
                      >
                        {subject.average.toFixed(1)}% Average
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Performance</span>
                        <span>{subject.average.toFixed(1)}%</span>
                      </div>
                      <Progress value={subject.average} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Pass Rate</span>
                        <span>{subject.passRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={subject.passRate} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
          <CardDescription>
            Breakdown of student risk categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['high', 'medium', 'low'].map(risk => {
              const count = students.filter(s => s.prediction?.riskStatus === risk).length;
              const percentage = analytics.totalStudents > 0 ? (count / analytics.totalStudents) * 100 : 0;
              
              return (
                <Card key={risk}>
                  <CardContent className="p-4 text-center">
                    <Badge 
                      variant={risk === 'high' ? 'destructive' : risk === 'medium' ? 'warning' : 'success'}
                      className="mb-2"
                    >
                      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                    </Badge>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}% of students
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;