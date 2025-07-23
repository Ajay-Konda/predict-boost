import { StudentMarks, Prediction, Subject } from '@/types';

// Simulated ML model for student performance prediction
export class StudentPerformancePredictor {
  private weights = {
    mid1: 0.2,
    mid2: 0.25,
    internal: 0.15,
    endSem: 0.4
  };

  // Simulate feature importance for explainability
  private featureImportance = {
    mid1: 0.15,
    mid2: 0.20,
    internal: 0.10,
    endSem: 0.35,
    attendance: 0.12,
    consistency: 0.08
  };

  predictSGPA(marks: StudentMarks[], subjects: Subject[]): number {
    if (!marks.length) return 0;

    let totalWeightedScore = 0;
    let totalMaxScore = 0;

    marks.forEach(mark => {
      const subject = subjects.find(s => s.id === mark.subjectId);
      if (!subject) return;

      const weightedScore = 
        (mark.mid1 / subject.maxMarks.mid1) * this.weights.mid1 +
        (mark.mid2 / subject.maxMarks.mid2) * this.weights.mid2 +
        (mark.internal / subject.maxMarks.internal) * this.weights.internal +
        (mark.endSem / subject.maxMarks.endSem) * this.weights.endSem;

      totalWeightedScore += weightedScore;
      totalMaxScore += 1;
    });

    const averageScore = totalWeightedScore / totalMaxScore;
    return Math.min(Math.max(averageScore * 10, 0), 10); // Convert to 10-point SGPA
  }

  calculateRiskStatus(sgpa: number): 'low' | 'medium' | 'high' {
    if (sgpa >= 7.5) return 'low';
    if (sgpa >= 6.0) return 'medium';
    return 'high';
  }

  generateFeedback(marks: StudentMarks[], subjects: Subject[], sgpa: number): string[] {
    const feedback: string[] = [];
    const riskStatus = this.calculateRiskStatus(sgpa);

    if (riskStatus === 'high') {
      feedback.push('⚠️ High risk of poor performance. Immediate attention needed.');
    } else if (riskStatus === 'medium') {
      feedback.push('⚡ Moderate risk. Focus on improving weak areas.');
    } else {
      feedback.push('✅ Good performance. Keep up the excellent work!');
    }

    // Analyze subject-wise performance
    marks.forEach(mark => {
      const subject = subjects.find(s => s.id === mark.subjectId);
      if (!subject) return;

      const subjectPercentage = this.calculateSubjectPercentage(mark, subject);
      
      if (subjectPercentage < 40) {
        feedback.push(`🔴 Critical: ${subject.name} needs immediate attention (${subjectPercentage.toFixed(1)}%)`);
      } else if (subjectPercentage < 60) {
        feedback.push(`🟡 Warning: Improve ${subject.name} performance (${subjectPercentage.toFixed(1)}%)`);
      }
    });

    return feedback;
  }

  generateSubjectWiseFeedback(marks: StudentMarks[], subjects: Subject[]) {
    return marks.map(mark => {
      const subject = subjects.find(s => s.id === mark.subjectId);
      if (!subject) return null;

      const currentPercentage = this.calculateSubjectPercentage(mark, subject);
      const prediction = Math.min(currentPercentage + Math.random() * 10 - 5, 100);
      
      let feedback = '';
      let improvement = '';

      if (currentPercentage < 40) {
        feedback = `Critical performance in ${subject.name}. Focus on fundamentals.`;
        improvement = `Aim to improve by at least 20 points to reach passing grade.`;
      } else if (currentPercentage < 60) {
        feedback = `Below average performance in ${subject.name}.`;
        improvement = `Focus on end semester preparation to improve by 10-15 points.`;
      } else if (currentPercentage < 80) {
        feedback = `Good performance in ${subject.name}.`;
        improvement = `With consistent effort, you can achieve distinction.`;
      } else {
        feedback = `Excellent performance in ${subject.name}!`;
        improvement = `Maintain this level and help peers in this subject.`;
      }

      return {
        subjectId: mark.subjectId,
        prediction,
        feedback,
        improvement
      };
    }).filter(Boolean);
  }

  private calculateSubjectPercentage(mark: StudentMarks, subject: Subject): number {
    const totalObtained = mark.mid1 + mark.mid2 + mark.internal + mark.endSem;
    const totalMax = subject.maxMarks.mid1 + subject.maxMarks.mid2 + 
                    subject.maxMarks.internal + subject.maxMarks.endSem;
    return (totalObtained / totalMax) * 100;
  }

  predict(studentMarks: StudentMarks[], subjects: Subject[]): Prediction {
    const sgpa = this.predictSGPA(studentMarks, subjects);
    const riskStatus = this.calculateRiskStatus(sgpa);
    const feedback = this.generateFeedback(studentMarks, subjects, sgpa);
    const subjectWiseFeedback = this.generateSubjectWiseFeedback(studentMarks, subjects);
    
    // Simulate model confidence based on data completeness
    const completeness = studentMarks.length > 0 ? 
      studentMarks.reduce((acc, mark) => {
        const hasAllMarks = mark.mid1 > 0 && mark.mid2 > 0 && mark.internal > 0 && mark.endSem > 0;
        return acc + (hasAllMarks ? 1 : 0.5);
      }, 0) / studentMarks.length : 0;
    
    const confidence = Math.min(completeness * 0.9 + Math.random() * 0.1, 1);

    return {
      studentId: studentMarks[0]?.studentId || '',
      expectedSGPA: sgpa,
      riskStatus,
      confidence,
      feedback,
      subjectWiseFeedback
    };
  }
}

export const mlPredictor = new StudentPerformancePredictor();