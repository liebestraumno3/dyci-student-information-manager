import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import {
  COURSE_OPTIONS,
  Student,
  StudentFilterCriteria,
  YEAR_LEVEL_OPTIONS,
  YearLevel
} from '../../models/student.model';
import { StudentService } from '../../services/student.service';

type ListViewState = 'loading' | 'error' | 'empty-db' | 'empty-filter' | 'ready';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css',
  host: {
    '(document:keydown.escape)': 'cancelDelete()'
  }
})
export class StudentListComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly courseOptions = COURSE_OPTIONS;
  readonly yearLevelOptions = YEAR_LEVEL_OPTIONS;

  readonly students = signal<Student[]>([]);
  readonly totalDatabaseCount = signal(0);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);

  // Two-way bound filter controls synchronized with Angular Router query parameters
  readonly searchTerm = signal('');
  readonly selectedCourse = signal('');
  readonly selectedYearLevel = signal<string>('');

  // Delete confirmation dialog state
  readonly pendingDelete = signal<Student | null>(null);
  readonly isDeleting = signal(false);

  private readonly searchTrigger$ = new Subject<StudentFilterCriteria>();

  readonly hasActiveFilters = computed(
    () =>
      this.searchTerm().trim().length > 0 ||
      this.selectedCourse().length > 0 ||
      this.selectedYearLevel().length > 0
  );

  readonly viewState = computed<ListViewState>(() => {
    if (this.isLoading()) {
      return 'loading';
    }
    if (this.errorMessage()) {
      return 'error';
    }
    if (this.students().length === 0) {
      return this.hasActiveFilters() && this.totalDatabaseCount() > 0 ? 'empty-filter' : 'empty-db';
    }
    return 'ready';
  });

  ngOnInit(): void {
    const navState = history.state as { feedback?: string } | undefined;
    if (navState?.feedback) {
      this.feedbackMessage.set(navState.feedback);
    }

    this.searchTrigger$
      .pipe(
        debounceTime(120),
        tap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap((criteria) =>
          this.studentService.searchStudents(criteria).pipe(
            catchError((err: Error) => {
              this.errorMessage.set(err.message);
              return of<Student[] | null>(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((results) => {
        if (results !== null) {
          this.students.set(results);
          if (!this.hasActiveFilters()) {
            this.totalDatabaseCount.set(results.length);
          } else if (this.totalDatabaseCount() === 0 && results.length > 0) {
            this.totalDatabaseCount.set(results.length);
          }
        }
        this.isLoading.set(false);
      });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.searchTerm.set(params.get('q') ?? '');
        this.selectedCourse.set(params.get('course') ?? '');
        this.selectedYearLevel.set(params.get('yearLevel') ?? '');
        this.loadStudents();
      });
  }

  loadStudents(): void {
    // Track total unfiltered database size once when landing directly on a filtered URL
    if (this.hasActiveFilters() && this.totalDatabaseCount() === 0) {
      this.studentService
        .getStudents()
        .pipe(
          catchError(() => of<Student[]>([])),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((all) => {
          this.totalDatabaseCount.set(all.length);
        });
    }

    const yearRaw = this.selectedYearLevel();
    this.searchTrigger$.next({
      searchTerm: this.searchTerm(),
      course: this.selectedCourse(),
      yearLevel: yearRaw ? Number(yearRaw) : null
    });
  }

  onFiltersChanged(): void {
    const q = this.searchTerm().trim();
    const course = this.selectedCourse();
    const yearLevel = this.selectedYearLevel();

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: q || null,
        course: course || null,
        yearLevel: yearLevel || null
      },
      replaceUrl: true
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCourse.set('');
    this.selectedYearLevel.set('');
    this.onFiltersChanged();
  }

  requestDelete(student: Student): void {
    this.pendingDelete.set(student);
  }

  cancelDelete(): void {
    if (!this.isDeleting()) {
      this.pendingDelete.set(null);
    }
  }

  confirmDelete(): void {
    const target = this.pendingDelete();
    if (!target || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.studentService
      .deleteStudent(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.students.update((list) => list.filter((item) => item.id !== target.id));
          this.totalDatabaseCount.update((count) => Math.max(0, count - 1));
          this.feedbackMessage.set(
            `Deleted record for ${target.fullName} (${target.studentNumber}).`
          );
          this.pendingDelete.set(null);
          this.isDeleting.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.pendingDelete.set(null);
          this.isDeleting.set(false);
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
}
