import { Component, effect, inject, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ProductEdit } from '../../api/model/productEdit';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-table-list',
  templateUrl: './product-table-list.component.html',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatIcon, CurrencyPipe],
})
export class ProductTableListComponent {
  products = input<ProductEdit[]>();

  displayedColumns: string[] = [
    'ver',
    'id',
    'name',
    'description',
    'category',
    'stock',
    'price',
  ];
  router = inject(Router);

  dataSource = new MatTableDataSource<any>(this.products());

  constructor() {
    effect(() => {
      this.dataSource.data = this.products() ?? [];
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verDetalle(product: any) {
    this.router.navigate(['/products', product.id]);
  }
}