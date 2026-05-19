import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule,
  ValidatorFn, Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  createUser, createUserSuccess,
  updateUser, updateUserSuccess,
} from '../../../../store/users/user.actions';
import { User } from '../../../models/user.model';
import { selectUsersSaving } from '../../../../store/users/user.selector';

// ── Validator de CPF ───────────────────────────────────────────────────────
const cpfValidator: ValidatorFn = (c: AbstractControl) => {
  const raw = (c.value ?? '').replace(/\D/g, '');
  if (!raw) return null;
  if (raw.length !== 11 || /^(\d)\1{10}$/.test(raw)) return { cpfInvalido: true };
  const d = (s: string) => {
    const sum = s.split('').reduce((a, n, i) => a + +n * (s.length + 1 - i), 0);
    const r = sum % 11; return r < 2 ? 0 : 11 - r;
  };
  return +raw[9] === d(raw.slice(0, 9)) && +raw[10] === d(raw.slice(0, 10))
    ? null : { cpfInvalido: true };
};

const PHONE_REGEX = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    AsyncPipe, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressBarModule,
  ],
  template: `
    <!-- Barra de progresso durante o salvamento -->
    @if (saving$ | async) { <mat-progress-bar mode="indeterminate" /> }

    <h2 mat-dialog-title class="dialog-title">
      {{ isEditing ? 'Editar usuário' : 'Adicionar novo usuário' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form">

        <!-- E-mail -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mail</mat-label>
          <input matInput formControlName="email" type="email" autocomplete="email" />
          @if (f('email').hasError('required') && f('email').touched) {
            <mat-error>E-mail é obrigatório</mat-error>
          }
          @if (f('email').hasError('email') && f('email').touched) {
            <mat-error>Formato de e-mail inválido</mat-error>
          }
        </mat-form-field>

        <!-- Nome -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome completo </mat-label>
          <input matInput formControlName="nome" autocomplete="name" />
          @if (f('nome').hasError('required') && f('nome').touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <!-- CPF e Telefone na mesma linha -->
        <div class="row">
          <mat-form-field appearance="outline" style="flex: 1.2">
            <mat-label>CPF</mat-label>
            <input matInput formControlName="cpf" placeholder="000.000.000-00" />
            @if (f('cpf').hasError('required') && f('cpf').touched) {
              <mat-error>CPF é obrigatório</mat-error>
            }
            @if (f('cpf').hasError('cpfInvalido') && f('cpf').touched) {
              <mat-error>CPF inválido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill" style="flex: 1.2">
            <mat-label>Número do telefone</mat-label>
            <input matInput formControlName="telefone" placeholder="(00) 00000-0000" />
            @if (f('telefone').hasError('required') && f('telefone').touched) {
              <mat-error>Obrigatório</mat-error>
            }
            @if (f('telefone').hasError('pattern') && f('telefone').touched) {
              <mat-error>(00) 00000-0000</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill" style="flex: 0.8">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipoTelefone">
              <mat-option value="celular">CELULAR</mat-option>
              <mat-option value="residencial">RESIDENCIAL</mat-option>
              <mat-option value="comercial">COMERCIAL</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <p class="info-text">
          O usuário receberá uma senha provisória para acesso ao sistema por SMS.
        </p>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button
        mat-flat-button
        color="primary"
        class="save-btn"
        [disabled]="form.invalid || (saving$ | async)"
        (click)="submit()"
      >
        SALVAR
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { font-size: 1rem; font-weight: 500; margin: 0; padding: 24px 28px 16px; }
    .form { display: flex; flex-direction: column; gap: 8px; min-width: 100%; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; align-items: flex-start; }
    .info-text { color: #1565c0; font-size: 0.8rem; margin: 8px 0 0; }
    .save-btn {   min-width: 110px; font-weight: 600; letter-spacing: 0.5px; background-color: #1976d2 !important; color: #fff !important; border-radius: 4px; height: 36px; padding: 0 24px; }
    .save-btn:disabled { background-color: #bdbdbd !important; color: #fff !important; }
    mat-dialog-actions { padding:20px 28px !important; max-width: 70vh; overflow-y: auto; }

  `],
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialogRef = inject(MatDialogRef<UserFormComponent>);
  readonly data: { user: User | null } = inject(MAT_DIALOG_DATA);

  saving$ = this.store.select(selectUsersSaving);
  isEditing = !!this.data.user;

  form = this.fb.group({
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    nome: [this.data.user?.nome ?? '', Validators.required],
    cpf: [this.data.user?.cpf ?? '', [Validators.required, cpfValidator]],
    telefone: [this.data.user?.telefone ?? '', [Validators.required, Validators.pattern(PHONE_REGEX)]],
    tipoTelefone: [this.data.user?.tipoTelefone ?? 'celular', Validators.required],
  });

  constructor() {
    // Fecha o dialog automaticamente quando a action de sucesso é despachada
    this.actions$.pipe(
      ofType(createUserSuccess, updateUserSuccess),
      takeUntilDestroyed(),
    ).subscribe(() => this.dialogRef.close(true));
  }

  f(name: string) { return this.form.get(name)!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const userData = this.form.getRawValue() as any;
    if (this.isEditing && this.data.user) {
      this.store.dispatch(updateUser({ id: this.data.user.id, userData }));
    } else {
      this.store.dispatch(createUser({ userData }));
    }
  }
}
