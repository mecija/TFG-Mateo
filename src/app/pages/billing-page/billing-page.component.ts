import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { BillingTableListComponent } from '../../components/billing-table-list/billing-table-list.component';
import { BillControllerService } from '../../api/api/billController.service';
import { BillEdit } from '../../api/model/billEdit';
import { FilterComponent } from '../../components/filter/filter.component';
import { RouterLink, Router } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BillFilter } from '../../api/model/billFilter';

@Component({
  selector: 'app-billing-page',
  imports: [BillingTableListComponent, FilterComponent, RouterLink, MatPaginatorModule],
  templateUrl: './billing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingPageComponent implements OnInit {
  bills = signal<BillEdit[]>([]);
  billService = inject(BillControllerService);

  totalPages = 1;
  currentPage = 0;
  size = 10;
  totalElements = 0;
  sortField = signal('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Filtro
  filterFields = [
    'destinatarioDenomSocial',
    'destinatarioNif',
    'destinatarioDireccionFiscal',
    'emisorDenomSocial',
    'emisorNif',
    'numeroCorrelativo'
  ];
  activeField = signal('id');
  searchValue = signal('');

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const billFilter = nav?.extras?.state?.['billFilter'];
    if (billFilter) {
      if (billFilter.destinatarioNif) {
        this.activeField.set('destinatarioNif');
        this.searchValue.set(billFilter.destinatarioNif);
      } else if (billFilter.emisorNif) {
        this.activeField.set('emisorNif');
        this.searchValue.set(billFilter.emisorNif);
      }

    }
  }

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
      const billFilter: BillFilter = {};
      // Convierte a número si el campo es id
      if (this.activeField() === 'id') {
        (billFilter as any)[this.activeField()] = Number(this.searchValue());
      } else {
        (billFilter as any)[this.activeField()] = this.searchValue();
      }

      this.billService.getBillsWithFilters(pageable, billFilter).subscribe((result) => {
        this.bills.set(result.content ?? []);
        this.totalPages = result.totalPages ?? 1;
        this.totalElements = result.totalElements ?? 0;
        this.currentPage = page;
      });
    } else {
      this.billService.getAllOrders1(pageable).subscribe((result) => {
        this.bills.set(result.content ?? []);
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