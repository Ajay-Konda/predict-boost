import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getStoredStudents, mockSubjects } from '@/data/mockData';
import { Student } from '@/types';
import { Search, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

const PredictionResults = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const storedStudents = getStoredStudents();
    setStudents(storedStudents);
    setFilteredStudents(storedStudents);
  }, []);

  useEffect(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.pin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(student =>
        student.prediction?.riskStatus === riskFilter
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, riskFilter]);

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <TrendingDown className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <TrendingUp className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  if (students.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No student data found. Please upload student marks first using the Data Upload tab.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or PIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{filteredStudents.length}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">
                {filteredStudents.filter(s => s.prediction?.riskStatus === 'high').length}
              </p>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {filteredStudents.filter(s => s.prediction?.riskStatus === 'medium').length}
              </p>
              <p className="text-sm text-muted-foreground">Medium Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {filteredStudents.filter(s => s.prediction?.riskStatus === 'low').length}
              </p>
              <p className="text-sm text-muted-foreground">Low Risk</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Predictions</CardTitle>
          <CardDescription>
            AI-generated predictions and feedback for all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PIN</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Predicted SGPA</TableHead>
                  <TableHead>Risk Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.pin}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      {student.prediction ? (
                        <span className="font-medium">
                          {student.prediction.expectedSGPA.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.prediction ? (
                        <Badge 
                          variant={getRiskBadgeVariant(student.prediction.riskStatus)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getRiskIcon(student.prediction.riskStatus)}
                          {student.prediction.riskStatus.charAt(0).toUpperCase() + 
                           student.prediction.riskStatus.slice(1)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No Prediction</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.prediction ? (
                        <span className="text-sm">
                          {(student.prediction.confidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {selectedStudent.name} ({selectedStudent.pin})
                </CardTitle>
                <CardDescription>
                  Detailed prediction and feedback
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedStudent.prediction && (
              <>
                {/* Prediction Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">
                        {selectedStudent.prediction.expectedSGPA.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Predicted SGPA</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Badge 
                        variant={getRiskBadgeVariant(selectedStudent.prediction.riskStatus)}
                        className="text-lg px-4 py-2"
                      >
                        {selectedStudent.prediction.riskStatus.charAt(0).toUpperCase() + 
                         selectedStudent.prediction.riskStatus.slice(1)} Risk
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">
                        {(selectedStudent.prediction.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </CardContent>
                  </Card>
                </div>

                {/* General Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">General Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedStudent.prediction.feedback.map((feedback, index) => (
                        <p key={index} className="text-sm">
                          {feedback}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Subject-wise Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subject-wise Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedStudent.prediction.subjectWiseFeedback.map((subject, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              {getSubjectName(subject.subjectId)}
                            </h4>
                            <span className="text-sm font-medium">
                              Predicted: {subject.prediction.toFixed(1)}%
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
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictionResults;