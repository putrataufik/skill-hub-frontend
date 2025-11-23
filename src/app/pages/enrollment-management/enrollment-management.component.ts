import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

import {
  EnrollmentsService,
  Enrollment,
  CreateEnrollmentDto,
} from './enrollement.service';
import {
  ParticipantsService,
  Participant,
} from '../../pages/participants-management/participants.service';
import {
  ClassesService,
  ClassSummary,
} from '../../pages/class-management/classes.service';

@Component({
  selector: 'app-enrollment-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enrollment-management.component.html',
  styleUrls: ['./enrollment-management.component.scss'],
})
export class EnrollmentManagementComponent implements OnInit {
  enrollments: Enrollment[] = [];
  selectedEnrollment?: Enrollment;

  isLoadingList = false;

  showAddModal = false;
  addForm!: FormGroup;
  isSubmitting = false;

  participants: Participant[] = [];
  classes: ClassSummary[] = [];
  isLoadingParticipants = false;
  isLoadingClasses = false;

  constructor(
    private enrollmentsService: EnrollmentsService,
    private participantsService: ParticipantsService,
    private classesService: ClassesService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEnrollments();
    this.loadParticipants();
    this.loadClasses();
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      participantId: [null, [Validators.required]],
      classId: [null, [Validators.required]],
      notes: [''],
    });
  }

  loadEnrollments(): void {
    this.isLoadingList = true;
    this.enrollmentsService.getEnrollments().subscribe({
      next: (data) => {
        this.enrollments = data;
        this.isLoadingList = false;

        if (!this.selectedEnrollment && this.enrollments.length > 0) {
          this.onSelectEnrollment(this.enrollments[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load enrollments', err);
        this.isLoadingList = false;
        Swal.fire(
          'Error',
          'Failed to load enrollments list. Please try again.',
          'error',
        );
      },
    });
  }

  loadParticipants(): void {
    this.isLoadingParticipants = true;
    this.participantsService.getParticipants().subscribe({
      next: (data) => {
        this.participants = data;
        this.isLoadingParticipants = false;
      },
      error: (err) => {
        console.error('Failed to load participants for enrollment', err);
        this.isLoadingParticipants = false;
        Swal.fire(
          'Error',
          'Failed to load participants for enrollment form.',
          'error',
        );
      },
    });
  }

  loadClasses(): void {
    this.isLoadingClasses = true;
    this.classesService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.isLoadingClasses = false;
      },
      error: (err) => {
        console.error('Failed to load classes for enrollment', err);
        this.isLoadingClasses = false;
        Swal.fire(
          'Error',
          'Failed to load classes for enrollment form.',
          'error',
        );
      },
    });
  }

  onSelectEnrollment(row: Enrollment): void {
    this.selectedEnrollment = row;
  }

  openAddModal(): void {
    this.addForm.reset({
      participantId: null,
      classId: null,
      status: 'CONFIRMED',
      notes: '',
    });

    this.showAddModal = true;
  }

  closeAddModal(): void {
    if (this.isSubmitting) return;
    this.showAddModal = false;
  }

  submitAddEnrollment(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const raw = this.addForm.value;

    const payload: CreateEnrollmentDto = {
      participantId: Number(raw.participantId),
      classId: Number(raw.classId),
      notes: raw.notes || undefined,
    };

    this.isSubmitting = true;

    this.enrollmentsService.createEnrollment(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showAddModal = false;

        this.enrollments.push(created);
        this.onSelectEnrollment(created);

        Swal.fire('Success', 'Enrollment has been created.', 'success');
      },
      error: (err) => {
        console.error('Failed to create enrollment', err);
        this.isSubmitting = false;
        Swal.fire(
          'Error',
          err.error?.message || 'Failed to create enrollment.',
          'error',
        );
      },
    });
  }

  onDeleteEnrollment(): void {
    if (!this.selectedEnrollment) return;

    const e = this.selectedEnrollment;
    const title = e.participant?.fullName
      ? `Enrollment for "${e.participant.fullName}"?`
      : `Enrollment ID ${e.id}?`;

    Swal.fire({
      title: 'Delete this enrollment?',
      text: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.enrollmentsService.deleteEnrollment(e.id).subscribe({
        next: (res) => {
          this.enrollments = this.enrollments.filter(
            (item) => item.id !== e.id,
          );

          if (this.enrollments.length > 0) {
            this.onSelectEnrollment(this.enrollments[0]);
          } else {
            this.selectedEnrollment = undefined;
          }

          Swal.fire(
            'Deleted',
            res?.message || 'Enrollment has been deleted.',
            'success',
          );
        },
        error: (err) => {
          console.error('Failed to delete enrollment', err);
          Swal.fire(
            'Error',
            err.error?.message || 'Failed to delete enrollment.',
            'error',
          );
        },
      });
    });
  }

  get participantIdCtrl() {
    return this.addForm.get('participantId');
  }

  get classIdCtrl() {
    return this.addForm.get('classId');
  }
}
