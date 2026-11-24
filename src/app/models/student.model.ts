export type StudentStatus = 'Active' | 'Probation' | 'On Leave' | 'Graduated';

export type YearLevel = 1 | 2 | 3 | 4;

export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
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

export interface StudentStatusMeta {
  value: StudentStatus;
  label: string;
  shortDescription: string;
  description: string;
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

export const STATUS_METADATA: Readonly<Record<StudentStatus, StudentStatusMeta>> = {
  Active: {
    value: 'Active',
    label: 'Active',
    shortDescription: 'Currently enrolled in good standing',
    description: 'Currently enrolled this term and meeting academic requirements.'
  },
  Probation: {
    value: 'Probation',
    label: 'Academic Probation',
    shortDescription: 'Below required GPA; under review',
    description: 'Enrolled under academic monitoring due to a GPA below the required standing.'
  },
  'On Leave': {
    value: 'On Leave',
    label: 'On Leave',
    shortDescription: 'Approved temporary leave of absence',
    description: 'Not enrolled this term due to an approved temporary leave of absence.'
  },
  Graduated: {
    value: 'Graduated',
    label: 'Graduated',
    shortDescription: 'Completed degree requirements',
    description: 'Completed all degree requirements and officially conferred.'
  }
};

export const STATUS_META_LIST: readonly StudentStatusMeta[] = STATUS_OPTIONS.map(
  (status) => STATUS_METADATA[status]
);

export function getStatusMeta(status: StudentStatus): StudentStatusMeta {
  return STATUS_METADATA[status] ?? STATUS_METADATA.Active;
}

export function buildFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? '', lastName: '' };
  }
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1]
  };
}

export function resolveStudentName(
  student: Pick<Student, 'fullName'> & Partial<Pick<Student, 'firstName' | 'lastName'>>
): { firstName: string; lastName: string } {
  const firstName = student.firstName?.trim() ?? '';
  const lastName = student.lastName?.trim() ?? '';
  if (firstName || lastName) {
    return { firstName, lastName };
  }
  return splitFullName(student.fullName ?? '');
}
