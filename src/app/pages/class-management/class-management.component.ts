// src/app/pages/class-management/class-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

import {
  ClassesService,
  ClassSummary,
  ClassDetail,
  CreateClassDto,
  ClassSessionDto,
} from './classes.service';

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './class-management.component.html',
  styleUrls: ['./class-management.component.scss'],
})
export class ClassManagementComponent implements OnInit {
  classes: ClassSummary[] = [];
  selectedClass?: ClassDetail;

  isLoadingList = false;
  isLoadingDetail = false;

  showAddModal = false;
  addForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private classesService: ClassesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClasses();
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      className: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      capacity: [25, [Validators.required, Validators.min(1)]],
      instructor: [null, [Validators.required]],
      sessions: this.fb.array([]),
    });
    this.addSessionRow();
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'Unknown error';
    const raw = err.error?.message ?? err.message ?? err.statusText ?? err.error;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    return JSON.stringify(raw);
  }

  get sessionsArray(): FormArray {
    return this.addForm.get('sessions') as FormArray;
  }

  createSessionGroup(initial?: Partial<ClassSessionDto>): FormGroup {
    return this.fb.group({
      sessionNumber: [
        initial?.sessionNumber ?? this.sessionsArray.length + 1,
        [Validators.required, Validators.min(1)],
      ],
      topic: [
        initial?.topic ?? '',
        [Validators.required, Validators.minLength(3)],
      ],
      sessionDate: [initial?.sessionDate ?? '', [Validators.required]],
      startTime: [initial?.startTime ?? '', [Validators.required]],
      endTime: [initial?.endTime ?? '', [Validators.required]],
    });
  }

  addSessionRow(): void {
    this.sessionsArray.push(this.createSessionGroup());
  }

  removeSessionRow(index: number): void {
    if (this.sessionsArray.length <= 1) return;
    this.sessionsArray.removeAt(index);
    this.sessionsArray.controls.forEach((ctrl, i) => {
      ctrl.get('sessionNumber')?.setValue(i + 1);
    });
  }


  loadClasses(): void {
    this.isLoadingList = true;
    this.classesService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.isLoadingList = false;

        if (!this.selectedClass && this.classes.length > 0) {
          this.onSelectClass(this.classes[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load classes', err);
        this.isLoadingList = false;
        Swal.fire('Error', this.extractErrorMessage(err), 'error');
      },
    });
  }

  onSelectClass(row: ClassSummary): void {
    if (!row?.id) return;

    if (this.selectedClass && this.selectedClass.id === row.id) {
      return;
    }

    this.isLoadingDetail = true;
    this.selectedClass = undefined;

    this.classesService.getClass(row.id).subscribe({
      next: (detail) => {
        this.selectedClass = detail;
        this.isLoadingDetail = false;
      },
      error: (err) => {
        console.error('Failed to load class detail', err);
        this.isLoadingDetail = false;
        Swal.fire('Error', this.extractErrorMessage(err), 'error');
      },
    });
  }

  onToggleStatus(): void {
    if (!this.selectedClass) return;
    const current = this.selectedClass.status;
    const newStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    this.classesService.updateStatus(this.selectedClass.id, newStatus).subscribe({
      next: (updated) => {
        this.selectedClass = {
          ...this.selectedClass!,
          ...updated,
          status: newStatus,
        };
        const idx = this.classes.findIndex((c) => c.id === updated.id);
        if (idx !== -1) {
          this.classes[idx] = {
            ...this.classes[idx],
            ...updated,
            status: newStatus,
          };
        }

        Swal.fire('Success', `Status updated to ${newStatus}.`, 'success');
      },
      error: (err) => {
        console.error('Failed to update status', err);
        Swal.fire('Error', this.extractErrorMessage(err), 'error');
      },
    });
  }

  onDeleteClass(): void {
    if (!this.selectedClass) return;

    Swal.fire({
      title: 'Delete this class?',
      text: `Class "${this.selectedClass.className}" will be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (!result.isConfirmed || !this.selectedClass) return;

      const id = this.selectedClass.id;

      this.classesService.deleteClass(id).subscribe({
        next: () => {
          this.classes = this.classes.filter((c) => c.id !== id);
         
          if (this.classes.length > 0) {
            this.onSelectClass(this.classes[0]);
          } else {
            this.selectedClass = undefined;
          }

          Swal.fire('Deleted', 'Class has been deleted.', 'success');
        },
        error: (err) => {
          console.error('Failed to delete class', err);
          Swal.fire('Error', this.extractErrorMessage(err), 'error');
        },
      });
    });
  }

  openAddModal(): void {
    this.addForm.reset({
      capacity: 25,
      instructor: null,
    });

    while (this.sessionsArray.length > 0) {
      this.sessionsArray.removeAt(0);
    }
    this.addSessionRow();

    this.showAddModal = true;
  }

  closeAddModal(): void {
    if (this.isSubmitting) return;
    this.showAddModal = false;
  }

  submitAddClass(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const raw = this.addForm.value;

    const sessionsPayload: ClassSessionDto[] = (raw.sessions || []).map(
      (s: any, index: number) => ({
        sessionNumber: s.sessionNumber ?? index + 1,
        topic: s.topic,
        sessionDate: s.sessionDate,
        startTime: s.startTime,
        endTime: s.endTime,
      })
    );

    const payload: CreateClassDto = {
      className: raw.className,
      description: raw.description,
      startDate: raw.startDate,
      endDate: raw.endDate,
      capacity: Number(raw.capacity),
      instructor: raw.instructor,
      sessions: sessionsPayload,
    };

    this.isSubmitting = true;

    this.classesService.createClass(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showAddModal = false;

        this.classes.push(created);
        this.onSelectClass(created);

        Swal.fire('Success', 'Class has been created.', 'success');
      },
      error: (err) => {
        console.error('Failed to create class', err);
        this.isSubmitting = false;
        Swal.fire('Error', this.extractErrorMessage(err), 'error');
      },
    });
  }

  get classNameCtrl() {
    return this.addForm.get('className');
  }
  get descriptionCtrl() {
    return this.addForm.get('description');
  }
  get startDateCtrl() {
    return this.addForm.get('startDate');
  }
  get endDateCtrl() {
    return this.addForm.get('endDate');
  }
  get capacityCtrl() {
    return this.addForm.get('capacity');
  }
  get instructorCtrl() {
    return this.addForm.get('instructor');
  }
}
