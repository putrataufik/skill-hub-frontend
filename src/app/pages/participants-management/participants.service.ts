// src/app/services/participants.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClassInfo {
  id: number;
  className: string;
  instructor: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: number;
  class: ClassInfo;
  enrollmentDate: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantDetail extends Participant {
  enrollments: Enrollment[];
}

export interface CreateParticipantDto {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

@Injectable({
  providedIn: 'root',
})
export class ParticipantsService {
  private readonly baseUrl = 'http://localhost:3000/participants';

  constructor(private http: HttpClient) {}

  getParticipants(): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.baseUrl}`);
  }

  getParticipant(id: number): Observable<ParticipantDetail> {
    return this.http.get<ParticipantDetail>(`${this.baseUrl}/${id}`);
  }

  createParticipant(dto: CreateParticipantDto): Observable<ParticipantDetail> {
    return this.http.post<ParticipantDetail>(`${this.baseUrl}`, dto);
  }

  deleteParticipant(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
