import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ClassesService,
  ClassSummary,
} from '../class-management/classes.service';
import { Participant, ParticipantsService } from '../participants-management/participants.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  totalClasses = 0;
  totalParticipants = 0;

  participants: Participant[] = [];
  classes: ClassSummary[] = [];

  isLoadingParticipants = false;
  isLoadingClasses = false;

  constructor(
    private classesService: ClassesService,
    private participantsService: ParticipantsService
  ) {}

  ngOnInit(): void {
    this.loadParticipants();
    this.loadClasses();
  }

  private loadParticipants(): void {
    this.isLoadingParticipants = true;
    this.participantsService.getParticipants().subscribe({
      next: (data) => {
        this.participants = data;
        this.totalParticipants = data.length;
        this.isLoadingParticipants = false;
      },
      error: (err) => {
        console.error('Failed to load participants for dashboard', err);
        this.participants = [];
        this.totalParticipants = 0;
        this.isLoadingParticipants = false;
      },
    });
  }

  private loadClasses(): void {
    this.isLoadingClasses = true;
    this.classesService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.totalClasses = data.length;
        this.isLoadingClasses = false;
      },
      error: (err) => {
        console.error('Failed to load classes for dashboard', err);
        this.classes = [];
        this.totalClasses = 0;
        this.isLoadingClasses = false;
      },
    });
  }
}
