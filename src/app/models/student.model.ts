export type StudentStatus = 'Active' | 'Probation' | 'On Leave' | 'Graduated';

export type YearLevel = 1 | 2 | 3 | 4;

export interface Student {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  course: string;
  yearLevel: YearLevel;
  gpa: number;
  status: StudentStatus;
  enrolledDate: string;
  advisor: string;
}

export type StudentPayload = Omit<Student, 'id'>;

export interface StudentFilterCriteria {
  searchTerm?: string;
  course?: string;
  yearLevel?: number | null;
}

export const COURSE_OPTIONS: readonly string[] = [
  'BSCS',
  'BSIT',
  'BSIS',
  'BSCE',
  'BSECE'
] as const;

export const YEAR_LEVEL_OPTIONS: readonly { value: YearLevel; label: string }[] = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' }
] as const;

export const STATUS_OPTIONS: readonly StudentStatus[] = [
  'Active',
  'Probation',
  'On Leave',
  'Graduated'
] as const;
