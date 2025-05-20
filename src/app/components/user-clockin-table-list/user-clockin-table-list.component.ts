import { Component, effect, inject, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { FichajeEdit } from '../../api/model/fichajeEdit';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-clockin-table-list',
  templateUrl: './user-clockin-table-list.component.html',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatIcon, DatePipe],
})
export class UserClockinTableListComponent {
  fichajes = input<FichajeEdit[]>();

  displayedColumns: string[] = [
    'id',
    'initialTime',
    'exitTime',
  ];

  dataSource = new MatTableDataSource<any>(this.fichajes());

  constructor() {
    effect(() => {
      this.dataSource.data = this.fichajes() ?? [];
    });
  }
}
