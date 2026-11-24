import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  STATUS_META_LIST,
  Student,
  YEAR_LEVEL_OPTIONS,
  YearLevel,
  getStatusMeta
} from '../../models/student.model';
import { StudentService } from '../../services/student.service';

type DashboardViewState = 'loading' | 'error' | 'empty' | 'ready';

interface CourseSummary {
  course: string;
  count: number;
  percentage: number;
}

interface YearSummary {
  yearLevel: YearLevel;
  label: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly students = signal<Student[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly statusLegend = STATUS_META_LIST;
  readonly getStatusMeta = getStatusMeta;

  readonly viewState = computed<DashboardViewState>(() => {
    if (this.isLoading()) {
      return 'loading';
    }
    if (this.errorMessage()) {
      return 'error';
    }
    if (this.students().length === 0) {
      return 'empty';
    }
    return 'ready';
  });

  readonly totalStudents = computed(() => this.students().length);

  readonly activeCount = computed(
    () => this.students().filter((student) => student.status === 'Active').length
  );

  readonly attentionCount = computed(
    () =>
      this.students().filter(
        (student) => student.status === 'Probation' || student.status === 'On Leave'
      ).length
  );

  readonly averageGpa = computed(() => {
    const list = this.students();
    if (list.length === 0) {
      return 0;
    }
    const sum = list.reduce((acc, student) => acc + Number(student.gpa), 0);
    return sum / list.length;
  });

  readonly courseBreakdown = computed<CourseSummary[]>(() => {
    const list = this.students();
    const total = list.length;
    if (total === 0) {
      return [];
    }

    const counts = new Map<string, number>();
    for (const student of list) {
      counts.set(student.course, (counts.get(student.course) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([course, count]) => ({
        course,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count || a.course.localeCompare(b.course));
  });

  readonly yearBreakdown = computed<YearSummary[]>(() => {
    const list = this.students();
    return YEAR_LEVEL_OPTIONS.map((option) => ({
      yearLevel: option.value,
      label: option.label,
      count: list.filter((student) => student.yearLevel === option.value).length
    }));
  });

  readonly recentStudents = computed(() =>
    [...this.students()]
      .sort((a, b) => b.enrolledDate.localeCompare(a.enrolledDate))
      .slice(0, 9)
  );

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.studentService
      .getStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.students.set(data);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        }
      });
  }

  openCourseFilter(course: string): void {
    void this.router.navigate(['/students'], {
      queryParams: { course }
    });
  }

  openYearFilter(yearLevel: YearLevel): void {
    void this.router.navigate(['/students'], {
      queryParams: { yearLevel }
    });
  }

  formatYearLabel(yearLevel: YearLevel): string {
    const found = YEAR_LEVEL_OPTIONS.find((item) => item.value === yearLevel);
    return found ? found.label : `Year ${yearLevel}`;
  }
}
