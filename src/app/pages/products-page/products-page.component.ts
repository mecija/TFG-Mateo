import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ProductControllerService } from '../../api/api/productController.service';
import { ProductEdit } from '../../api/model/productEdit';
import { ProductTableListComponent } from '../../components/product-table-list/product-table-list.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-products-page',
  imports: [
    ProductTableListComponent,
    FilterComponent,
    RouterLink,
    MatPaginatorModule,
  ],
  templateUrl: './products-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent implements OnInit {
  products = signal<ProductEdit[]>([]);
  productService = inject(ProductControllerService);

  totalPages = 1;
  currentPage = 0;
  size = 10;
  totalElements = 0;

  filterFields = ['id', 'name', 'category', 'minPrice', 'maxPrice', 'minStock', 'maxStock'];
  activeField = signal('id');
  searchValue = signal('');

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number) {
    const pageable: any = {
      page,
      size: this.size,
      sort: `id,asc`,
    };

    if (this.searchValue() && this.activeField()) {
      const productFilter = {
        [this.activeField()]: this.searchValue(),
      };

      this.productService
        .getProductsWithFilters(pageable, productFilter)
        .subscribe((result) => {
          this.products.set(result.content ?? []);
          this.totalPages = result.totalPages ?? 1;
          this.totalElements = result.totalElements ?? 0;
          this.currentPage = page;
        });
    } else {
      this.productService.getAllProducts(pageable).subscribe((result) => {
        this.products.set(result.content ?? []);
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
}
