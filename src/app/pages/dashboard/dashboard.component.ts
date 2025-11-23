// src/app/pages/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CurrentActivity {
  className: string;
  startDate: string;   // bisa nanti diganti Date kalau mau
  endDate: string;
  instructor: string;
  capacity: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  totalClasses = 8;
  totalParticipants = 120;
  totalInstructors = 15;

  currentActivities: CurrentActivity[] = [
    {
      className: 'Angular Fundamentals',
      startDate: '2025-11-20',
      endDate: '2025-11-25',
      instructor: 'John Doe',
      capacity: 25,
    },
    {
      className: 'NestJS Backend Development',
      startDate: '2025-11-22',
      endDate: '2025-11-28',
      instructor: 'Jane Smith',
      capacity: 30,
    },
    {
      className: 'Database Design Basics',
      startDate: '2025-11-23',
      endDate: '2025-11-30',
      instructor: 'Michael Lee',
      capacity: 20,
    },
  ];
}
