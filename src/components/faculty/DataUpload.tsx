import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import { mockSubjects, csvTemplate, getStoredStudents, saveStudents } from '@/data/mockData';
import { mlPredictor } from '@/utils/mlPredictor';
import { Student, StudentMarks } from '@/types';
import { useToast } from '@/hooks/use-toast';

const DataUpload = () => {
  const [csvData, setCsvData] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [manualEntries, setManualEntries] = useState<any[]>([{ pin: '', name: '' }]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_marks_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded successfully.",
    });
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const expectedHeaders = ['PIN', 'Name'];
    mockSubjects.forEach(subject => {
      expectedHeaders.push(
        `${subject.code}_MID1`,
        `${subject.code}_MID2`,
        `${subject.code}_INTERNAL`,
        `${subject.code}_ENDSEM`
      );
    });
    expectedHeaders.push('ATTENDANCE');

    // Validate headers
    const errors: string[] = [];
    expectedHeaders.forEach(header => {
      if (!headers.includes(header)) {
        errors.push(`Missing column: ${header}`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return [];
    }

    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      // Validate data
      if (!row.PIN || !row.Name) {
        errors.push(`Row ${index + 2}: Missing PIN or Name`);
      }

      // Validate marks
      mockSubjects.forEach(subject => {
        const mid1 = parseInt(row[`${subject.code}_MID1`]);
        const mid2 = parseInt(row[`${subject.code}_MID2`]);
        const internal = parseInt(row[`${subject.code}_INTERNAL`]);
        const endSem = parseInt(row[`${subject.code}_ENDSEM`]);

        if (mid1 > subject.maxMarks.mid1) {
          errors.push(`Row ${index + 2}: ${subject.code} MID1 exceeds max marks (${subject.maxMarks.mid1})`);
        }
        if (mid2 > subject.maxMarks.mid2) {
          errors.push(`Row ${index + 2}: ${subject.code} MID2 exceeds max marks (${subject.maxMarks.mid2})`);
        }
        if (internal > subject.maxMarks.internal) {
          errors.push(`Row ${index + 2}: ${subject.code} INTERNAL exceeds max marks (${subject.maxMarks.internal})`);
        }
        if (endSem > subject.maxMarks.endSem) {
          errors.push(`Row ${index + 2}: ${subject.code} ENDSEM exceeds max marks (${subject.maxMarks.endSem})`);
        }
      });

      return row;
    });

    setValidationErrors(errors);
    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      const parsed = parseCSV(text);
      setPreviewData(parsed);
    };
    reader.readAsText(file);
  };

  const processData = async () => {
    setIsProcessing(true);
    
    try {
      const students = getStoredStudents();
      const newStudents: Student[] = [];

      previewData.forEach(row => {
        const studentMarks: StudentMarks[] = mockSubjects.map(subject => ({
          studentId: row.PIN,
          subjectId: subject.id,
          mid1: parseInt(row[`${subject.code}_MID1`]) || 0,
          mid2: parseInt(row[`${subject.code}_MID2`]) || 0,
          internal: parseInt(row[`${subject.code}_INTERNAL`]) || 0,
          endSem: parseInt(row[`${subject.code}_ENDSEM`]) || 0,
          attendance: parseInt(row.ATTENDANCE) || 85,
          assignmentCompletion: 85
        }));

        const prediction = mlPredictor.predict(studentMarks, mockSubjects);

        const student: Student = {
          id: row.PIN,
          pin: row.PIN,
          name: row.Name,
          email: `${row.PIN.toLowerCase()}@university.edu`,
          semester: 6,
          marks: studentMarks,
          prediction
        };

        newStudents.push(student);
      });

      // Update existing students or add new ones
      const updatedStudents = [...students];
      newStudents.forEach(newStudent => {
        const existingIndex = updatedStudents.findIndex(s => s.pin === newStudent.pin);
        if (existingIndex >= 0) {
          updatedStudents[existingIndex] = newStudent;
        } else {
          updatedStudents.push(newStudent);
        }
      });

      saveStudents(updatedStudents);
      
      toast({
        title: "Data Processed Successfully",
        description: `${newStudents.length} student records processed with predictions generated.`,
      });

      // Clear form
      setCsvData('');
      setPreviewData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the data.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addManualEntry = () => {
    setManualEntries([...manualEntries, { pin: '', name: '' }]);
  };

  const removeManualEntry = (index: number) => {
    setManualEntries(manualEntries.filter((_, i) => i !== index));
  };

  const updateManualEntry = (index: number, field: string, value: string) => {
    const updated = [...manualEntries];
    updated[index][field] = value;
    setManualEntries(updated);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV File Upload</CardTitle>
              <CardDescription>
                Upload a CSV file with student marks. Download the template first to ensure correct format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                
                <div className="flex-1">
                  <Label htmlFor="csvFile">Upload CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="mt-1"
                  />
                </div>
              </div>

              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Validation Errors:</p>
                      {validationErrors.map((error, index) => (
                        <p key={index} className="text-sm">• {error}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {previewData.length > 0 && validationErrors.length === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Preview Data</h3>
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle className="h-4 w-4" />
                      {previewData.length} records ready for processing
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>PIN</TableHead>
                          <TableHead>Name</TableHead>
                          {mockSubjects.map(subject => (
                            <TableHead key={subject.id} className="text-center">
                              {subject.code}
                            </TableHead>
                          ))}
                          <TableHead>Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.slice(0, 5).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.PIN}</TableCell>
                            <TableCell>{row.Name}</TableCell>
                            {mockSubjects.map(subject => (
                              <TableCell key={subject.id} className="text-center text-xs">
                                {row[`${subject.code}_MID1`]}/{row[`${subject.code}_MID2`]}/
                                {row[`${subject.code}_INTERNAL`]}/{row[`${subject.code}_ENDSEM`]}
                              </TableCell>
                            ))}
                            <TableCell className="text-center">{row.ATTENDANCE}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {previewData.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      Showing first 5 rows. Total: {previewData.length} records
                    </p>
                  )}

                  <Button 
                    onClick={processData} 
                    disabled={isProcessing}
                    className="w-full bg-gradient-primary shadow-button"
                  >
                    {isProcessing ? (
                      <>Processing & Generating Predictions...</>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Process Data & Generate Predictions
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Data Entry</CardTitle>
              <CardDescription>
                Enter student data manually as a backup option.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Manual entry form will be implemented with dynamic subject rows and validation.
                  For now, please use the CSV upload feature.
                </AlertDescription>
              </Alert>
              
              {manualEntries.map((entry, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Student PIN</Label>
                    <Input
                      value={entry.pin}
                      onChange={(e) => updateManualEntry(index, 'pin', e.target.value)}
                      placeholder="CS2021001"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Student Name</Label>
                    <Input
                      value={entry.name}
                      onChange={(e) => updateManualEntry(index, 'name', e.target.value)}
                      placeholder="Student Name"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeManualEntry(index)}
                    disabled={manualEntries.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button onClick={addManualEntry} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Student
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataUpload;