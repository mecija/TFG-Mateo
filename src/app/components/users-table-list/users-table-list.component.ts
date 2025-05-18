import { Component, effect, inject, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserView } from '../../api';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-users-table-list',
  templateUrl: './users-table-list.component.html',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatIcon, NgClass],
})
export class UsersTableListComponent {
  users = input<UserView[]>();

  displayedColumns: string[] = [
    'ver',
    'id',
    'name',
    'email',
    'enabled',
  ];
  router = inject(Router);

  dataSource = new MatTableDataSource<any>(this.users());

  constructor() {
    effect(() => {
      this.dataSource.data = this.users() ?? [];
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verDetalle(user: any) {
    this.router.navigate(['/admin/users', user.id]);
  }
}