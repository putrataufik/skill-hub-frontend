import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantsManagementComponent } from './participants-management.component';

describe('ParticipantsManagementComponent', () => {
  let component: ParticipantsManagementComponent;
  let fixture: ComponentFixture<ParticipantsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
