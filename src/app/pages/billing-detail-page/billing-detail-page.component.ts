import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { BillControllerService } from '../../api/api/billController.service';
import { AuthService } from '../../services/auth.service';
import { BillFilter } from '../../api';
import { ClientFilter } from '../../api/model/clientFilter';
import { CurrencyPipe } from '@angular/common';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-billing-detail-page',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    CurrencyPipe,
  ],
  templateUrl: './billing-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingDetailPageComponent {
  billingForm!: FormGroup;
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  pdfservice = inject(PdfService)

  billService = inject(BillControllerService);
  authService = inject(AuthService);

  isAdmin = computed(() => {
    const user = this.authService.user();
    return !!user?.roles?.some((role) => role.name === 'ADMIN');
  });

  constructor() {
    this.billingForm = this.fb.group({
      id: [''],
      destinatarioDenomSocial: ['', Validators.required],
      destinatarioNif: ['', [Validators.required, Validators.minLength(9)]],
      destinatarioDIR: ['', Validators.required],
      destinatarioDireccionFiscal: ['', Validators.required],
      emisorDenomSocial: ['', Validators.required],
      emisorNif: ['', [Validators.required, Validators.minLength(9)]],
      emisorDireccionFiscal: ['', Validators.required],
      concepto: ['', [Validators.required, Validators.minLength(10)]],
      serie: ['', Validators.required],
      numeroCorrelativo: ['', Validators.required],
      fechaEmision: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      albaranes: [''],
      tipoIVA: ['', Validators.required],
      tipoRetencion: [''],
      baseFactura: [
        '',
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
      // Importe final: deshabilitado, calculado automáticamente
      importeFinal: [],
      formaPago: [''],
      fechaPago: [''],
    });

    const billData = history.state.billData;
    if (billData) {
      this.billingForm.patchValue(billData);
    }

    const billId = this.route.snapshot.paramMap.get('billid');
    if (billId && billId !== 'new') {
      this.billService.getBillById(Number(billId)).subscribe((bill) => {
        if (bill) {
          this.billingForm.patchValue(bill);
        }
      });
    }

    // Calcula el importe final automáticamente
    this.billingForm
      .get('baseFactura')
      ?.valueChanges.subscribe(() => this.calcularImporteFinal());
    this.billingForm
      .get('tipoIVA')
      ?.valueChanges.subscribe(() => this.calcularImporteFinal());
    this.billingForm
      .get('tipoRetencion')
      ?.valueChanges.subscribe(() => this.calcularImporteFinal());
  }

  calcularImporteFinal() {
    const base = parseFloat(this.billingForm.get('baseFactura')?.value) || 0;
    const iva = parseFloat(this.billingForm.get('tipoIVA')?.value) || 0;
    const retencion =
      parseFloat(this.billingForm.get('tipoRetencion')?.value) || 0;
    const importeFinal = base + (base * iva) / 100 - (base * retencion) / 100;
    this.billingForm
      .get('importeFinal')
      ?.setValue(importeFinal.toFixed(2), { emitEvent: false });
  }

  onSubmit(): void {
    if (this.billingForm.valid) {
      const billData = this.billingForm.getRawValue();
      const billId = this.route.snapshot.paramMap.get('billid');

      if (billId === 'new') {
        delete billData.id;
        this.billService.createBill(billData).subscribe({
          next: (createdBill) => {
            this.router.navigate(['/billing']);
          },
          error: (err) => {
            console.error('Error al crear factura:', err);
          },
        });
      } else {
        billData.id = billId;
        this.billService.updateBill(billData.id, billData).subscribe({
          next: (updatedBill) => {
            this.router.navigate(['/billing']);
          },
          error: (err) => {
            console.error('Error al actualizar factura:', err);
          },
        });
      }
    } else {
      this.billingForm.markAllAsTouched();
    }
  }

  onDelete(): void {
    const billId = this.route.snapshot.paramMap.get('billid');
    if (billId && billId !== 'new') {
      this.billService.deleteBill(Number(billId)).subscribe({
        next: () => {
          this.router.navigate(['/billing']);
        },
        error: (err) => {
          console.error('Error al borrar factura:', err);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/billing']);
  }

  onBuscarFacturasPorDestinatario(): void {
    const destinatarioNif = this.billingForm.get('destinatarioNif')?.value;
    if (destinatarioNif) {
      const billFilter: BillFilter = { destinatarioNif };
      this.router.navigate(['/billing'], { state: { billFilter } });
    }
  }

  onBuscarFacturasPorEmisor(): void {
    const emisorNif = this.billingForm.get('emisorNif')?.value;
    if (emisorNif) {
      const billFilter: BillFilter = { emisorNif };
      this.router.navigate(['/billing'], { state: { billFilter } });
    }
  }

  onBuscarClientePorDestinatario(): void {
    const destinatarioNif = this.billingForm.get('destinatarioNif')?.value;
    if (destinatarioNif) {
      const clientFilter: ClientFilter = { dni: destinatarioNif };
      this.router.navigate(['/clients'], { state: { clientFilter } });
    }
  }

  onBuscarClientePorEmisor(): void {
    const emisorNif = this.billingForm.get('emisorNif')?.value;
    if (emisorNif) {
      const clientFilter: ClientFilter = { dni: emisorNif };
      this.router.navigate(['/clients'], { state: { clientFilter } });
    }
  }

  generatePdf() {
    const data = this.billingForm.getRawValue();

    const docDefinition: any = {
      content: [
        { text: 'Factura', style: 'header' },
        {
          text: `Fecha emisión: ${data.fechaEmision || ''}`,
          margin: [0, 10, 0, 0],
        },
        { text: `Destinatario: ${data.destinatarioDenomSocial || ''}` },
        { text: `NIF: ${data.destinatarioNif || ''}` },
        { text: `Dirección: ${data.destinatarioDIR || ''}` },
        { text: `Dirección fiscal: ${data.destinatarioDireccionFiscal || ''}` },
        {
          text: `Emisor: ${data.emisorDenomSocial || ''}`,
          margin: [0, 10, 0, 0],
        },
        { text: `NIF Emisor: ${data.emisorNif || ''}` },
        {
          text: `Dirección fiscal emisor: ${data.emisorDireccionFiscal || ''}`,
        },
        { text: `\nConcepto:\n${data.concepto || ''}`, margin: [0, 10, 0, 0] },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                body: [
                  ['Base', 'IVA (%)', 'Retención (%)', 'Importe final'],
                  [
                    data.baseFactura || '',
                    data.tipoIVA || '',
                    data.tipoRetencion || '',
                    data.importeFinal || '',
                  ],
                ],
              },
            },
          ],
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
      },
    };
    this.pdfservice.generatePdf(docDefinition)
  }
}
