import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnrollmentParticipant {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentClass {
  id: number;
  className: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: number;
  participant: EnrollmentParticipant;
  class: EnrollmentClass;
  enrollmentDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnrollmentDto {
  participantId: number;
  classId: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsService {
  private readonly baseUrl = 'http://localhost:3000/enrollments';

  constructor(private http: HttpClient) {}

  getEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}`);
  }

  createEnrollment(dto: CreateEnrollmentDto): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.baseUrl}`, dto);
  }
}
