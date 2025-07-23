import { Subject, Student, StudentMarks } from '@/types';

export const mockSubjects: Subject[] = [
  {
    id: 'sub1',
    code: 'CS401',
    name: 'Data Structures and Algorithms',
    maxMarks: { mid1: 20, mid2: 20, internal: 10, endSem: 50 }
  },
  {
    id: 'sub2',
    code: 'CS402',
    name: 'Database Management Systems',
    maxMarks: { mid1: 20, mid2: 20, internal: 10, endSem: 50 }
  },
  {
    id: 'sub3',
    code: 'CS403',
    name: 'Computer Networks',
    maxMarks: { mid1: 20, mid2: 20, internal: 10, endSem: 50 }
  },
  {
    id: 'sub4',
    code: 'CS404',
    name: 'Software Engineering',
    maxMarks: { mid1: 20, mid2: 20, internal: 10, endSem: 50 }
  },
  {
    id: 'sub5',
    code: 'CS405',
    name: 'Machine Learning',
    maxMarks: { mid1: 20, mid2: 20, internal: 10, endSem: 50 }
  }
];

// Generate mock student data
export const generateMockStudents = (count: number = 70): Student[] => {
  const students: Student[] = [];
  const names = [
    'Alice Johnson', 'Bob Wilson', 'Charlie Brown', 'Diana Prince', 'Edward Smith',
    'Fiona Davis', 'George Miller', 'Hannah Garcia', 'Ivan Rodriguez', 'Julia Martinez',
    'Kevin Anderson', 'Laura Taylor', 'Michael Thomas', 'Nina Hernandez', 'Oliver Moore'
  ];

  for (let i = 0; i < count; i++) {
    const studentId = `student_${i + 1}`;
    const pin = `CS2021${String(i + 1).padStart(3, '0')}`;
    const name = names[i % names.length] + ` ${i + 1}`;
    
    // Generate marks for each subject
    const marks: StudentMarks[] = mockSubjects.map(subject => ({
      studentId,
      subjectId: subject.id,
      mid1: Math.floor(Math.random() * subject.maxMarks.mid1 * 0.9) + subject.maxMarks.mid1 * 0.1,
      mid2: Math.floor(Math.random() * subject.maxMarks.mid2 * 0.9) + subject.maxMarks.mid2 * 0.1,
      internal: Math.floor(Math.random() * subject.maxMarks.internal * 0.9) + subject.maxMarks.internal * 0.1,
      endSem: Math.floor(Math.random() * subject.maxMarks.endSem * 0.9) + subject.maxMarks.endSem * 0.1,
      attendance: Math.floor(Math.random() * 30) + 70, // 70-100%
      assignmentCompletion: Math.floor(Math.random() * 40) + 60 // 60-100%
    }));

    students.push({
      id: studentId,
      pin,
      name,
      email: `${pin.toLowerCase()}@university.edu`,
      semester: 6,
      marks
    });
  }

  return students;
};

export const mockStudents = generateMockStudents();

// CSV template for faculty upload
export const csvTemplate = `PIN,Name,${mockSubjects.map(s => `${s.code}_MID1,${s.code}_MID2,${s.code}_INTERNAL,${s.code}_ENDSEM`).join(',')},ATTENDANCE
CS2021001,Alice Johnson,${mockSubjects.map(s => `${s.maxMarks.mid1},${s.maxMarks.mid2},${s.maxMarks.internal},${s.maxMarks.endSem}`).join(',')},85
CS2021002,Bob Wilson,${mockSubjects.map(s => `${Math.floor(s.maxMarks.mid1 * 0.8)},${Math.floor(s.maxMarks.mid2 * 0.8)},${Math.floor(s.maxMarks.internal * 0.8)},${Math.floor(s.maxMarks.endSem * 0.8)}`).join(',')},78`;

export const getStoredStudents = (): Student[] => {
  const stored = localStorage.getItem('students');
  return stored ? JSON.parse(stored) : mockStudents;
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem('students', JSON.stringify(students));
};