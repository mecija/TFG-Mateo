import { Component, effect, inject, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { OrderEdit } from '../../api/model/orderEdit';
import { NgClass } from '@angular/common';
import { OrderStatusPipe } from '../../pipes/order-status.pipe';

@Component({
  selector: 'app-order-table-list',
  templateUrl: './order-table-list.component.html',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatIcon, NgClass, OrderStatusPipe],
})
export class OrderTableListComponent {
  orders = input<OrderEdit[]>();

  displayedColumns: string[] = [
    'ver',
    'orderId',
    'clientId',
    'orderStatus',
    'amount',
    'creationTime',
    'deliveryTime',
    'deliveryAddress',
  ];

  router = inject(Router);

  dataSource = new MatTableDataSource<any>(this.orders());

  constructor() {
    effect(() => {
      this.dataSource.data = this.orders() ?? [];
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verDetalle(order: any) {
    this.router.navigate(['/orders', order.orderId]);
  }
}