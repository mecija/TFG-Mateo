import { Component, effect, inject, input, Input, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ClientEdit } from '../../api';

@Component({
  selector: 'app-client-table-list',
  templateUrl: './client-table-list.component.html',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatIcon],
})
export class ClientTableListComponent {
  clients = input<ClientEdit[]>();

  displayedColumns: string[] = [
    'ver',
    'dni',
    'nombre',
    'empresa',
    'pais',
    'direccion',
  ];
  router = inject(Router);

  dataSource = new MatTableDataSource<any>(this.clients());

  constructor() {
    effect(() => {
      this.dataSource.data = this.clients() ?? [];
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verDetalle(client: any) {
    console.log(client);
    
    this.router.navigate(['/clients', client.id]);
  }
}
