import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterField',
  standalone: true,
})
export class FilterFieldLabelPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      // ProductFilter
      case 'id':
        return 'ID';
      case 'name':
        return 'Nombre';
      case 'category':
        return 'Categoría';
      case 'minPrice':
        return 'Precio mínimo';
      case 'maxPrice':
        return 'Precio máximo';
      case 'minStock':
        return 'Stock mínimo';
      case 'maxStock':
        return 'Stock máximo';

      // ClientFilter
      case 'dni':
        return 'DNI';
      case 'nombre':
        return 'Nombre';
      case 'empresa':
        return 'Empresa';
      case 'pais':
        return 'País';
      case 'zona':
        return 'Zona';

      // BillFilter
      case 'destinatarioDenomSocial':
        return 'Destinatario (Denominación Social)';
      case 'destinatarioNif':
        return 'Destinatario NIF';
      case 'destinatarioDireccionFiscal':
        return 'Destinatario Dirección Fiscal';
      case 'emisorDenomSocial':
        return 'Emisor (Denominación Social)';
      case 'emisorNif':
        return 'Emisor NIF';
      case 'numeroCorrelativo':
        return 'Número Correlativo';

      case 'creationTimeStart':
        return 'Fecha creación (inicio)';
      case 'creationTimeEnd':
        return 'Fecha creación (fin)';
      case 'deliveryTimeStart':
        return 'Fecha entrega (inicio)';
      case 'deliveryTimeEnd':
        return 'Fecha entrega (fin)';
      case 'clientId':
        return 'ID Cliente';
      case 'orderStatus':
        return 'Estado del pedido';
      case 'minAmount':
        return 'Importe mínimo';
      case 'maxAmount':
        return 'Importe máximo';
      case 'deliveryAddress':
        return 'Dirección de entrega';

      case 'enabled':
        return 'Estado';
      case 'email':
        return 'Correo electrónico';
      case 'direccion':
        return 'Dirección';
      default:
        return value;
    }
  }
}
