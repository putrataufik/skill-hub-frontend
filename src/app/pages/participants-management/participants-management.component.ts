// src/app/pages/participants-management/participants-management.component.ts
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
  ParticipantsService,
  Participant,
  ParticipantDetail,
  CreateParticipantDto,
} from './participants.service';

@Component({
  selector: 'app-participants-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './participants-management.component.html',
  styleUrls: ['./participants-management.component.scss'],
})
export class ParticipantsManagementComponent implements OnInit {
  participants: Participant[] = [];
  selectedParticipant?: ParticipantDetail;

  isLoadingList = false;
  isLoadingDetail = false;

  showAddModal = false;
  addForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private participantsService: ParticipantsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadParticipants();
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
    });
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'Unknown error';
    const raw = err?.error?.message ?? err?.message ?? err?.statusText ?? err?.error;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    try {
      return JSON.stringify(raw);
    } catch {
      return 'Unknown error';
    }
  }

  // ===== LIST & DETAIL =====

  loadParticipants(): void {
    this.isLoadingList = true;
    this.participantsService.getParticipants().subscribe({
      next: (data) => {
        this.participants = data;
        this.isLoadingList = false;

        if (!this.selectedParticipant && this.participants.length > 0) {
          this.onSelectParticipant(this.participants[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load participants', err);
        this.isLoadingList = false;
        Swal.fire('Error', this.extractErrorMessage(err), 'error');
      },
    });
  }

  onSelectParticipant(row: Participant): void {
    if (!row?.id) return;

    if (this.selectedParticipant && this.selectedParticipant.id === row.id) {
      return;
    }

    this.isLoadingDetail = true;
    this.selectedParticipant = undefined;

    this.participantsService.getParticipant(row.id).subscribe({
      next: (detail) => {
        this.selectedParticipant = detail;
        this.isLoadingDetail = false;
      },
      error: (err) => {
        console.error('Failed to load participant detail', err);
        this.isLoadingDetail = false;
        Swal.fire('Error', this.extractErrorMessage(err), 'error');
      },
    });
  }

  // ===== DELETE PARTICIPANT =====

  onDeleteParticipant(): void {
    if (!this.selectedParticipant) return;

    const p = this.selectedParticipant;

    Swal.fire({
      title: 'Delete this participant?',
      text: `Participant "${p.fullName}" (ID: ${p.id}) will be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.participantsService.deleteParticipant(p.id).subscribe({
        next: () => {
          // hapus dari list
          this.participants = this.participants.filter(
            (item) => item.id !== p.id
          );

          // reset / pilih yang lain
          if (this.participants.length > 0) {
            this.onSelectParticipant(this.participants[0]);
          } else {
            this.selectedParticipant = undefined;
          }

          Swal.fire('Deleted', 'Participant has been deleted.', 'success');
        },
        error: (err) => {
          console.error('Failed to delete participant', err);
          Swal.fire('Error', this.extractErrorMessage(err), 'error');
        },
      });
    });
  }

  // ===== MODAL ADD PARTICIPANT =====

  openAddModal(): void {
    this.addForm.reset();
    this.showAddModal = true;
  }

  closeAddModal(): void {
    if (this.isSubmitting) return;
    this.showAddModal = false;
  }

  submitAddParticipant(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const raw = this.addForm.value;

    const payload: CreateParticipantDto = {
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      dateOfBirth: raw.dateOfBirth, // input[type=date] -> yyyy-mm-dd
    };

    this.isSubmitting = true;

    this.participantsService.createParticipant(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showAddModal = false;

        this.participants.push(created);
        this.onSelectParticipant(created);

        Swal.fire('Success', 'Participant has been created.', 'success');
      },
      error: (err) => {
        console.error('Failed to create participant', err);
        this.isSubmitting = false;
        Swal.fire('Error', this.extractErrorMessage(err), 'error');
      },
    });
  }

  // Helpers untuk template
  get fullNameCtrl() {
    return this.addForm.get('fullName');
  }
  get emailCtrl() {
    return this.addForm.get('email');
  }
  get phoneCtrl() {
    return this.addForm.get('phone');
  }
  get dobCtrl() {
    return this.addForm.get('dateOfBirth');
  }
}
