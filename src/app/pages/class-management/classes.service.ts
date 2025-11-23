// src/app/pages/class-management/classes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClassSummary {
  id: number;
  className: string;
  instructor: string; // plain text
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSession {
  id: number;
  sessionNumber: number;
  topic: string;
  sessionDate: string;
  startTime: string; // "09:00:00"
  endTime: string;   // "11:00:00"
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassParticipant {
  fullName: string;
  email: string;
  phone: string;
}

export interface ClassDetail extends ClassSummary {
  sessions: ClassSession[];
  participants: ClassParticipant[];
  participantCount: number;
}

export interface ClassSessionDto {
  sessionNumber: number;
  topic: string;
  sessionDate: string; // "YYYY-MM-DD"
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
}

export interface CreateClassDto {
  className: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  instructor: string;
  sessions: ClassSessionDto[];
}

@Injectable({
  providedIn: 'root',
})
export class ClassesService {
  private readonly baseUrl = 'http://localhost:3000/classes';

  constructor(private http: HttpClient) {}

  getClasses(): Observable<ClassSummary[]> {
    return this.http.get<ClassSummary[]>(this.baseUrl);
  }

  getClass(id: number): Observable<ClassDetail> {
    return this.http.get<ClassDetail>(`${this.baseUrl}/${id}`);
  }

  createClass(dto: CreateClassDto): Observable<ClassDetail> {
    return this.http.post<ClassDetail>(this.baseUrl, dto);
  }

  updateStatus(id: number, status: 'ACTIVE' | 'INACTIVE' | string): Observable<ClassDetail> {
    return this.http.patch<ClassDetail>(`${this.baseUrl}/${id}`, { status });
  }

  deleteClass(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
