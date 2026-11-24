import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  Student,
  StudentFilterCriteria,
  StudentPayload
} from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/students';

  getStudents(): Observable<Student[]> {
    return this.http
      .get<Student[]>(this.apiUrl)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'load student records')));
  }

  getStudentById(id: string): Observable<Student> {
    return this.http
      .get<Student>(`${this.apiUrl}/${encodeURIComponent(id)}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'load student record')));
  }

  searchStudents(criteria: StudentFilterCriteria): Observable<Student[]> {
    const query = (criteria.searchTerm ?? '').trim().toLowerCase();
    const course = (criteria.course ?? '').trim();
    const yearLevel = criteria.yearLevel ?? null;

    return this.getStudents().pipe(
      map((students) =>
        students.filter((student) => {
          const matchesQuery =
            !query ||
            student.fullName.toLowerCase().includes(query) ||
            student.studentNumber.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query) ||
            student.course.toLowerCase().includes(query) ||
            student.advisor.toLowerCase().includes(query);

          const matchesCourse = !course || student.course === course;
          const matchesYear = yearLevel === null || student.yearLevel === yearLevel;

          return matchesQuery && matchesCourse && matchesYear;
        })
      )
    );
  }

  addStudent(payload: StudentPayload): Observable<Student> {
    return this.http
      .post<Student>(this.apiUrl, payload)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'create student record')));
  }

  updateStudent(id: string, payload: StudentPayload): Observable<Student> {
    return this.http
      .put<Student>(`${this.apiUrl}/${encodeURIComponent(id)}`, { id, ...payload })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'update student record')));
  }

  deleteStudent(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'delete student record')));
  }

  private handleError(error: HttpErrorResponse, action: string): Observable<never> {
    let message = `Unable to ${action}. Please try again.`;

    if (error.status === 0) {
      message =
        'Cannot reach the local API server at http://localhost:3000. Start json-server and retry.';
    } else if (error.status === 404) {
      message = 'The requested student record was not found.';
    } else if (error.status >= 500) {
      message = `The API server encountered an internal error (${error.status}) while attempting to ${action}.`;
    } else if (error.status >= 400) {
      message = `Request rejected (${error.status}) while attempting to ${action}. Verify your inputs.`;
    }

    return throwError(() => new Error(message));
  }
}
