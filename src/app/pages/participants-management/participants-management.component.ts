// src/app/features/participants/participants-management.component.ts
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
  UpdateParticipantDto,
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

  // ADD modal
  showAddModal = false;
  addForm!: FormGroup;
  isSubmitting = false;

  // EDIT modal
  showEditModal = false;
  editForm!: FormGroup;
  isEditSubmitting = false;

  constructor(
    private participantsService: ParticipantsService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initAddForm();
    this.initEditForm();
    this.loadParticipants();
  }

  private initAddForm(): void {
    this.addForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
    });
  }

  private initEditForm(): void {
    this.editForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
    });
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'Unknown error';
    const raw =
      err?.error?.message ?? err?.message ?? err?.statusText ?? err?.error;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    try {
      return JSON.stringify(raw);
    } catch {
      return 'Unknown error';
    }
  }

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
          this.participants = this.participants.filter(
            (item) => item.id !== p.id,
          );
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
      dateOfBirth: raw.dateOfBirth,
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

  openEditModal(): void {
    if (!this.selectedParticipant) return;

    const p = this.selectedParticipant;

    this.editForm.reset();
    this.editForm.patchValue({
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      dateOfBirth: p.dateOfBirth,
    });

    this.showEditModal = true;
  }

  closeEditModal(): void {
    if (this.isEditSubmitting) return;
    this.showEditModal = false;
  }

  submitEditParticipant(): void {
    if (!this.selectedParticipant) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.value;

    const payload: UpdateParticipantDto = {
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      dateOfBirth: raw.dateOfBirth,
    };

    this.isEditSubmitting = true;

    this.participantsService
      .updateParticipant(this.selectedParticipant.id, payload)
      .subscribe({
        next: (updated) => {
          this.isEditSubmitting = false;
          this.showEditModal = false;

          const idx = this.participants.findIndex(
            (item) => item.id === updated.id,
          );
          if (idx !== -1) {
            this.participants[idx] = {
              ...this.participants[idx],
              ...updated,
            };
          }

          this.selectedParticipant = updated;

          Swal.fire('Updated', 'Participant has been updated.', 'success');
        },
        error: (err) => {
          console.error('Failed to update participant', err);
          this.isEditSubmitting = false;
          Swal.fire('Error', this.extractErrorMessage(err), 'error');
        },
      });
  }

  // getters ADD form
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

  get editFullNameCtrl() {
    return this.editForm.get('fullName');
  }
  get editEmailCtrl() {
    return this.editForm.get('email');
  }
  get editPhoneCtrl() {
    return this.editForm.get('phone');
  }
  get editDobCtrl() {
    return this.editForm.get('dateOfBirth');
  }
}
