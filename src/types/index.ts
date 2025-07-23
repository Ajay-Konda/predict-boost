export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'faculty';
  pin?: string;
  semester?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  maxMarks: {
    mid1: number;
    mid2: number;
    internal: number;
    endSem: number;
  };
}

export interface StudentMarks {
  studentId: string;
  subjectId: string;
  mid1: number;
  mid2: number;
  internal: number;
  endSem: number;
  attendance?: number;
  assignmentCompletion?: number;
}

export interface Prediction {
  studentId: string;
  expectedSGPA: number;
  riskStatus: 'low' | 'medium' | 'high';
  confidence: number;
  feedback: string[];
  subjectWiseFeedback: {
    subjectId: string;
    prediction: number;
    feedback: string;
    improvement: string;
  }[];
}

export interface Student {
  id: string;
  pin: string;
  name: string;
  email: string;
  semester: number;
  marks: StudentMarks[];
  prediction?: Prediction;
}

export interface AnalyticsData {
  totalStudents: number;
  atRiskStudents: number;
  averageSGPA: number;
  subjectWisePerformance: {
    subjectId: string;
    average: number;
    passRate: number;
  }[];
  sgpaDistribution: {
    range: string;
    count: number;
  }[];
}