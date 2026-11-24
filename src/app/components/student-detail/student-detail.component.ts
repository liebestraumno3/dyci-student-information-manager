import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
import {
  COURSE_OPTIONS,
  STATUS_META_LIST,
  STATUS_OPTIONS,
  Student,
  StudentPayload,
  StudentStatus,
  YEAR_LEVEL_OPTIONS,
  YearLevel,
  buildFullName,
  getStatusMeta,
  resolveStudentName
} from '../../models/student.model';
import { StudentService } from '../../services/student.service';

type DetailPageState = 'loading' | 'error' | 'view' | 'create' | 'edit';

interface StudentFormModel {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  yearLevel: YearLevel;
  gpa: number | null;
  status: StudentStatus;
  enrolledDate: string;
  advisor: string;
}

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css',
  host: {
    '(document:keydown.escape)': 'cancelDelete()'
  }
})
export class StudentDetailComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly courseOptions = COURSE_OPTIONS;
  readonly yearLevelOptions = YEAR_LEVEL_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly statusMetaList = STATUS_META_LIST;
  readonly getStatusMeta = getStatusMeta;
  readonly resolveStudentName = resolveStudentName;

  readonly pageState = signal<DetailPageState>('loading');
  readonly student = signal<Student | null>(null);
  readonly currentId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);
  readonly validationBanner = signal<string | null>(null);

  readonly formSubmitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly isDeleting = signal(false);

  // Two-way bound template-driven form model
  formModel: StudentFormModel = this.createEmptyFormModel();

  readonly breadcrumbLabel = computed(() => {
    const state = this.pageState();
    if (state === 'create') {
      return 'Register Student';
    }
    const record = this.student();
    if (record) {
      return state === 'edit' ? `${record.studentNumber} / Edit` : record.studentNumber;
    }
    return this.currentId() ?? 'Record';
  });

  ngOnInit(): void {
    const navState = history.state as { feedback?: string } | undefined;
    if (navState?.feedback) {
      this.feedbackMessage.set(navState.feedback);
    }

    combineLatest([this.route.data, this.route.paramMap, this.route.queryParamMap])
      .pipe(
        switchMap(([data, params, queryParams]) => {
          this.errorMessage.set(null);
          this.validationBanner.set(null);
          this.formSubmitted.set(false);
          this.showDeleteConfirm.set(false);

          const routeMode = data['mode'] as string | undefined;
          const id = params.get('id');
          const editFlag = queryParams.get('edit') === 'true';

          if (routeMode === 'create' || !id) {
            this.currentId.set(null);
            this.student.set(null);
            this.formModel = this.createEmptyFormModel();
            this.pageState.set('create');
            return of(null);
          }

          this.currentId.set(id);
          this.pageState.set('loading');

          return this.studentService.getStudentById(id).pipe(
            map((record) => ({
              record,
              targetState: (editFlag ? 'edit' : 'view') as 'view' | 'edit'
            })),
            catchError((err: Error) => {
              this.student.set(null);
              this.errorMessage.set(err.message);
              this.pageState.set('error');
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.student.set(result.record);
        this.populateForm(result.record);
        this.pageState.set(result.targetState);
      });
  }

  fetchStudent(id: string, targetState: 'view' | 'edit'): void {
    this.pageState.set('loading');
    this.errorMessage.set(null);

    this.studentService
      .getStudentById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (record) => {
          this.student.set(record);
          this.populateForm(record);
          this.pageState.set(targetState);
        },
        error: (err: Error) => {
          this.student.set(null);
          this.errorMessage.set(err.message);
          this.pageState.set('error');
        }
      });
  }

  retryLoad(): void {
    const id = this.currentId();
    if (id) {
      this.fetchStudent(id, 'view');
    }
  }

  enterEditMode(): void {
    const record = this.student();
    if (!record) {
      return;
    }
    this.populateForm(record);
    this.validationBanner.set(null);
    this.feedbackMessage.set(null);
    this.formSubmitted.set(false);
    this.showDeleteConfirm.set(false);
    this.pageState.set('edit');

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: 'true' },
      replaceUrl: true
    });
  }

  cancelEdit(): void {
    if (this.pageState() === 'create') {
      void this.router.navigate(['/students']);
      return;
    }

    const record = this.student();
    if (record) {
      this.populateForm(record);
    }
    this.validationBanner.set(null);
    this.formSubmitted.set(false);
    this.pageState.set('view');

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: null },
      replaceUrl: true
    });
  }

  submitForm(form: NgForm): void {
    this.formSubmitted.set(true);
    this.validationBanner.set(null);
    this.errorMessage.set(null);

    const firstName = this.formModel.firstName.trim();
    const lastName = this.formModel.lastName.trim();
    const advisor = this.formModel.advisor.trim();
    const hasInvalidTrimmedName = firstName.length < 2 || lastName.length < 2 || advisor.length < 3;

    const gpaValue = this.formModel.gpa;
    const isGpaOutOfRange =
      gpaValue === null || Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4;

    if (form.invalid || isGpaOutOfRange || hasInvalidTrimmedName) {
      this.validationBanner.set(
        'Please fix the highlighted validation errors before submitting.'
      );
      return;
    }

    const payload: StudentPayload = {
      studentNumber: this.formModel.studentNumber.trim(),
      firstName,
      lastName,
      fullName: buildFullName(firstName, lastName),
      email: this.formModel.email.trim(),
      course: this.formModel.course,
      yearLevel: Number(this.formModel.yearLevel) as YearLevel,
      gpa: Number(Number(gpaValue).toFixed(2)),
      status: this.formModel.status,
      enrolledDate: this.formModel.enrolledDate,
      advisor
    };

    this.isSubmitting.set(true);

    if (this.pageState() === 'create') {
      this.studentService
        .addStudent(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (created) => {
            this.isSubmitting.set(false);
            void this.router.navigate(['/students', created.id], {
              state: {
                feedback: `Registered ${created.fullName} (${created.studentNumber}).`
              }
            });
          },
          error: (err: Error) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(err.message);
          }
        });
      return;
    }

    const id = this.currentId();
    if (!id) {
      this.isSubmitting.set(false);
      return;
    }

    this.studentService
      .updateStudent(id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.student.set(updated);
          this.populateForm(updated);
          this.isSubmitting.set(false);
          this.feedbackMessage.set(`Saved updates for ${updated.fullName}.`);
          this.pageState.set('view');
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { edit: null },
            replaceUrl: true
          });
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.message);
        }
      });
  }

  requestDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    if (!this.isDeleting()) {
      this.showDeleteConfirm.set(false);
    }
  }

  confirmDelete(): void {
    const record = this.student();
    if (!record || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.studentService
      .deleteStudent(record.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          void this.router.navigate(['/students'], {
            state: {
              feedback: `Deleted record for ${record.fullName} (${record.studentNumber}).`
            }
          });
        },
        error: (err: Error) => {
          this.isDeleting.set(false);
          this.showDeleteConfirm.set(false);
          this.errorMessage.set(err.message);
        }
      });
  }

  dismissFeedback(): void {
    this.feedbackMessage.set(null);
  }

  formatYearLabel(yearLevel: YearLevel): string {
    const found = YEAR_LEVEL_OPTIONS.find((item) => item.value === yearLevel);
    return found ? found.label : `Year ${yearLevel}`;
  }

  private populateForm(record: Student): void {
    const { firstName, lastName } = resolveStudentName(record);
    this.formModel = {
      studentNumber: record.studentNumber,
      firstName,
      lastName,
      email: record.email,
      course: record.course,
      yearLevel: record.yearLevel,
      gpa: record.gpa,
      status: record.status,
      enrolledDate: record.enrolledDate,
      advisor: record.advisor
    };
  }

  private createEmptyFormModel(): StudentFormModel {
    return {
      studentNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      course: 'BSCS',
      yearLevel: 1,
      gpa: null,
      status: 'Active',
      enrolledDate: new Date().toISOString().slice(0, 10),
      advisor: ''
    };
  }
}
