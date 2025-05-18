import { ChangeDetectionStrategy, Component, effect, inject, linkedSignal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardActions, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AuthStatus } from '../../services/enums/authStatus.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-form',
  imports: [
    MatCardModule,
    MatCardActions,
    MatFormFieldModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  authService = inject(AuthService);
  loginForm: FormGroup;
  router = inject(Router);
  visibility = linkedSignal(() => this.authService.errorVisibility());
  message = linkedSignal(() => this.authService.errorMessage());
  private snackBar = inject(MatSnackBar);



  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

     effect(() => {
      if (this.visibility()) {
        this.showError();
      }
    });

  }

showError() {
  this.snackBar.open(this.message(), 'Cerrar', {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  });
  this.authService.errorVisibility.set(false);
  }


  onSubmit(): void {
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe((response) => {            
      if (response) {        
        this.router.navigateByUrl('/home');               
      }
    });
  }
}
