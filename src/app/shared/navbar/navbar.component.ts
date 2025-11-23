// src/app/shared/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgForOf } from '@angular/common';

interface NavItem {
  label: string;
  path: string;
  exact: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgForOf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', exact: true },
    {
      label: 'Participants',
      path: '/participants-management',
      exact: false,
    },
    {
      label: 'Classes',
      path: '/class-management',
      exact: false,
    },
    {
      label: 'Enrollments',
      path: '/enrollment-management',
      exact: false,
    },
  ];
}
