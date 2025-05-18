import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { OrderTableListComponent } from '../../components/order-table-list/order-table-list.component';
import { OrderControllerService } from '../../api/api/orderController.service';
import { OrderEdit } from '../../api/model/orderEdit';
import { FilterComponent } from '../../components/filter/filter.component';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { OrderFilter } from '../../api/model/orderFilter';

@Component({
  selector: 'app-order-page',
  imports: [OrderTableListComponent, FilterComponent, RouterLink, MatPaginatorModule],
  templateUrl: './order-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPageComponent implements OnInit {
  orders = signal<OrderEdit[]>([]);
  orderService = inject(OrderControllerService);

  totalPages = 1;
  currentPage = 0;
  size = 10;
  totalElements = 0;

  // Filtro: usa los campos de OrderFilter
  filterFields = [
    'id',
    'creationTimeStart',
    'creationTimeEnd',
    'deliveryTimeStart',
    'deliveryTimeEnd',
    'clientId',
    'orderStatus',
    'minAmount',
    'maxAmount',
    'deliveryAddress',
  ];
  activeField = signal('id');
  searchValue = signal('');

  sortField = signal('orderId');
  sortDirection = signal<'asc' | 'desc'>('asc');

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number) {
    const pageable: any = {
      page,
      size: this.size,
      sort: `${this.sortField()},${this.sortDirection()}`,
    };

    if (this.searchValue() && this.activeField()) {
      const orderFilter: OrderFilter = {};

      if (
        ['id', 'clientId', 'minAmount', 'maxAmount'].includes(this.activeField())
      ) {
        (orderFilter as any)[this.activeField()] = Number(this.searchValue());
      } else {
        (orderFilter as any)[this.activeField()] = this.searchValue();
      }

      // Si tu servicio tiene un método getOrdersWithFilters, úsalo:
      if (typeof this.orderService.getOrdersWithFilters === 'function') {
        this.orderService
          .getOrdersWithFilters(pageable, orderFilter)
          .subscribe((result) => {
            this.orders.set(result.content ?? []);
            this.totalPages = result.totalPages ?? 1;
            this.totalElements = result.totalElements ?? 0;
            this.currentPage = page;
          });
      } else {
        this.orderService.getAllOrders({ ...pageable, ...orderFilter }).subscribe((result) => {
          this.orders.set(result.content ?? []);
          this.totalPages = result.totalPages ?? 1;
          this.totalElements = result.totalElements ?? 0;
          this.currentPage = page;
        });
      }
    } else {
      this.orderService.getAllOrders(pageable).subscribe((result) => {
        this.orders.set(result.content ?? []);
        this.totalPages = result.totalPages ?? 1;
        this.totalElements = result.totalElements ?? 0;
        this.currentPage = page;
      });
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.size = event.pageSize;
    this.loadPage(event.pageIndex);
  }

  onFilterChange(filter: { field: string; value: string }) {
    this.activeField.set(filter.field);
    this.searchValue.set(filter.value);
    this.loadPage(0);
  }

  onSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadPage(0);
  }
}
