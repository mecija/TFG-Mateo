import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { UserControllerService } from '../../api/api/userController.service';
import { UserView } from '../../api/model/userView';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router, RouterLink } from '@angular/router';
import { UsersTableListComponent } from '../../components/users-table-list/users-table-list.component';
import { FilterComponent } from '../../components/filter/filter.component';

@Component({
  selector: 'app-admin-page',
  imports: [
    MatPaginatorModule,
    RouterLink,
    FilterComponent,
    UsersTableListComponent
  ],
  templateUrl: './admin-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  users = signal<UserView[]>([]);
  userService = inject(UserControllerService);

  totalPages = 1;
  currentPage = 0;
  size = 10;
  totalElements = 0;
  sortField = signal('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  filterFields = ['id', 'name', 'email', 'enabled'];
  activeField = signal('id');
  searchValue = signal('');

  constructor(private router: Router) {}

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
      const userFilter: any = {};
      if (this.activeField() === 'id') {
        userFilter[this.activeField()] = Number(this.searchValue());
      } else {
        userFilter[this.activeField()] = this.searchValue();
      }

      this.userService
        .getUsersWithFilters(pageable, userFilter)
        .subscribe((result) => {
          this.users.set(result.content ?? []);
          this.totalPages = result.totalPages ?? 1;
          this.totalElements = result.totalElements ?? 0;
          this.currentPage = page;
        });
    } else {
      this.userService.getAllUsers(pageable).subscribe((result) => {
        this.users.set(result.content ?? []);
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
