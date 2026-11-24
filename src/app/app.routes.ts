import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard | Student Information Manager'
  },
  {
    path: 'students',
    component: StudentListComponent,
    title: 'Student Directory | Student Information Manager'
  },
  {
    path: 'students/new',
    component: StudentDetailComponent,
    data: { mode: 'create' },
    title: 'Register Student | Student Information Manager'
  },
  {
    path: 'students/:id',
    component: StudentDetailComponent,
    data: { mode: 'view' },
    title: 'Student Record | Student Information Manager'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
