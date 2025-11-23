import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ParticipantsManagementComponent } from './pages/participants-management/participants-management.component';
import { ClassManagementComponent } from './pages/class-management/class-management.component';
import { EnrollmentManagementComponent } from './pages/enrollment-management/enrollment-management.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard | Skill Hub',
  },
  {
    path: 'participants-management',
    component: ParticipantsManagementComponent,
    title: 'Participants Management | Skill Hub',
  },
  {
    path: 'class-management',
    component: ClassManagementComponent,
    title: 'Class Management | Skill Hub',
  },
  {
    path: 'enrollment-management',
    component: EnrollmentManagementComponent,
    title: 'Enrollment Management | Skill Hub',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
