import { Component, effect, inject, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { BillEdit } from '../../api/model/billEdit';

@Component({
  selector: 'app-billing-table-list',
  templateUrl: './billing-table-list.component.html',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatIcon],
})
export class BillingTableListComponent {
  bills = input<BillEdit[]>();

  displayedColumns: string[] = [
    'ver',
    'destinatarioDenomSocial',
    'destinatarioNif',
    'destinatarioDireccionFiscal',
    'emisorDenomSocial',
    'emisorNif',
    'numeroCorrelativo',
  ];

  router = inject(Router);

  dataSource = new MatTableDataSource<any>(this.bills());

  constructor() {
    effect(() => {
      this.dataSource.data = this.bills() ?? [];
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verDetalle(bill: any) {
    this.router.navigate(['/billing', bill.id]);
  }
}
