import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student, StudentPayload } from '../models/student.model';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const mockStudents: Student[] = [
    {
      id: '1',
      studentNumber: '2023-00101',
      firstName: 'Elena',
      lastName: 'Cruz',
      fullName: 'Elena Cruz',
      email: 'elena.cruz@univ.edu',
      course: 'BSCS',
      yearLevel: 4,
      gpa: 3.88,
      status: 'Active',
      enrolledDate: '2023-08-14',
      advisor: 'Dr. Ramon Santos'
    },
    {
      id: '2',
      studentNumber: '2024-00214',
      firstName: 'Marco',
      lastName: 'Villanueva',
      fullName: 'Marco Villanueva',
      email: 'marco.villanueva@univ.edu',
      course: 'BSIT',
      yearLevel: 3,
      gpa: 3.42,
      status: 'Active',
      enrolledDate: '2024-08-12',
      advisor: 'Prof. Carla Mendoza'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve all students via GET /students', () => {
    let result: Student[] = [];
    service.getStudents().subscribe((data) => (result = data));

    const req = httpMock.expectOne('http://localhost:3000/students');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);

    expect(result.length).toBe(2);
    expect(result[0].fullName).toBe('Elena Cruz');
  });

  it('should filter students by searchTerm, course, and yearLevel', () => {
    let result: Student[] = [];
    service
      .searchStudents({ searchTerm: 'elena', course: 'BSCS', yearLevel: 4 })
      .subscribe((data) => (result = data));

    const req = httpMock.expectOne('http://localhost:3000/students');
    req.flush(mockStudents);

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('should create a student via POST /students', () => {
    const payload: StudentPayload = {
      studentNumber: '2026-00999',
      firstName: 'Lukas',
      lastName: 'Bautista',
      fullName: 'Lukas Bautista',
      email: 'lukas.bautista@univ.edu',
      course: 'BSIS',
      yearLevel: 1,
      gpa: 3.55,
      status: 'Active',
      enrolledDate: '2026-08-17',
      advisor: 'Prof. Teresa Aquino'
    };

    let created: Student | undefined;
    service.addStudent(payload).subscribe((data) => (created = data));

    const req = httpMock.expectOne('http://localhost:3000/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '6', ...payload });

    expect(created?.id).toBe('6');
  });

  it('should update a student via PUT /students/:id', () => {
    const updatedPayload: StudentPayload = {
      studentNumber: '2023-00101',
      firstName: 'Elena',
      lastName: 'Cruz',
      fullName: 'Elena Cruz',
      email: 'elena.cruz@univ.edu',
      course: 'BSCS',
      yearLevel: 4,
      gpa: 3.95,
      status: 'Graduated',
      enrolledDate: '2023-08-14',
      advisor: 'Dr. Ramon Santos'
    };

    let updated: Student | undefined;
    service.updateStudent('1', updatedPayload).subscribe((data) => (updated = data));

    const req = httpMock.expectOne('http://localhost:3000/students/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '1', ...updatedPayload });

    expect(updated?.gpa).toBe(3.95);
    expect(updated?.status).toBe('Graduated');
  });

  it('should delete a student via DELETE /students/:id', () => {
    let completed = false;
    service.deleteStudent('2').subscribe(() => (completed = true));

    const req = httpMock.expectOne('http://localhost:3000/students/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });

  it('should map network failure (status 0) to an actionable message', () => {
    let capturedError = '';
    service.getStudents().subscribe({
      error: (err: Error) => (capturedError = err.message)
    });

    const req = httpMock.expectOne('http://localhost:3000/students');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(capturedError).toContain('http://localhost:3000');
  });

  it('should match search queries against firstName, lastName, and readable status labels', () => {
    let byLastName: Student[] = [];
    service.searchStudents({ searchTerm: 'villanueva' }).subscribe((data) => (byLastName = data));
    httpMock.expectOne('http://localhost:3000/students').flush(mockStudents);

    expect(byLastName.length).toBe(1);
    expect(byLastName[0].firstName).toBe('Marco');
    expect(byLastName[0].lastName).toBe('Villanueva');

    let byStatusLabel: Student[] = [];
    service.searchStudents({ searchTerm: 'enrolled' }).subscribe((data) => (byStatusLabel = data));
    httpMock.expectOne('http://localhost:3000/students').flush(mockStudents);

    expect(byStatusLabel.length).toBe(2);
  });
});
