import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ClientTableListComponent } from '../../components/client-table-list/client-table-list.component';
import { ClientControllerService } from '../../api/api/clientController.service';
import { ClientEdit } from '../../api/model/clientEdit';
import { FilterComponent } from '../../components/filter/filter.component';
import { Router, RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ClientFilter } from '../../api/model/clientFilter';

@Component({
  selector: 'app-client-page',
  imports: [
    ClientTableListComponent,
    FilterComponent,
    RouterLink,
    MatPaginatorModule,
  ],
  templateUrl: './client-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientPageComponent implements OnInit {
  clients = signal<ClientEdit[]>([]);
  clientService = inject(ClientControllerService);

  totalPages = 1;
  currentPage = 0;
  size = 10;
  totalElements = 0;
  sortField = signal('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  filterFields = ['dni', 'nombre', 'empresa', 'pais', 'direccion'];
  activeField = signal('id');
  searchValue = signal('');

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const clientFilter = nav?.extras?.state?.['clientFilter'];
    if (clientFilter && clientFilter.dni) {
      this.activeField.set('dni');
      this.searchValue.set(clientFilter.dni);
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
      const clientFilter: ClientFilter = {};
      if (this.activeField() === 'id') {
        (clientFilter as any)[this.activeField()] = Number(this.searchValue());
      } else {
        (clientFilter as any)[this.activeField()] = this.searchValue();
      }

      this.clientService
        .getClientsWithFilters(pageable, clientFilter)
        .subscribe((result) => {
          this.clients.set(result.content ?? []);
          this.totalPages = result.totalPages ?? 1;
          this.totalElements = result.totalElements ?? 0;
          this.currentPage = page;
        });
    } else {
      this.clientService.getAllClients(pageable).subscribe((result) => {
        this.clients.set(result.content ?? []);
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
