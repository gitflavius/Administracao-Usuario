import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject } from 'rxjs';

import { UserFormComponent } from './user-form.component';
import { selectUsersSaving } from '../../../../store/users/user.selector';
import { createUser, updateUser } from '../../../../../app/store/users/user.actions';
import { User } from '../../../../../app/core/models/user.model';

const VALID = {
  email: 'teste@email.com',
  nome: 'Fulano Teste',
  cpf: '529.982.247-25',
  telefone: '(11) 99999-1234',
  tipoTelefone: 'celular' as const,
};

const MOCK_USER: User = { id: '99', ...VALID, tipoTelefone: 'celular' };

function buildModule(user: User | null = null) {
  const actions$ = new ReplaySubject<any>(1);
  const dialogRef = { close: jest.fn() };

  TestBed.configureTestingModule({
    imports: [UserFormComponent, NoopAnimationsModule],
    providers: [
      provideMockStore({ selectors: [{ selector: selectUsersSaving, value: false }] }),
      provideMockActions(() => actions$),
      { provide: MAT_DIALOG_DATA, useValue: { user } },
      { provide: MatDialogRef, useValue: dialogRef },
    ],
  });

  const fixture = TestBed.createComponent(UserFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component, actions$, dialogRef, store: TestBed.inject(MockStore) };
}

describe('UserFormComponent — criação', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('deve criar o componente', () => expect(buildModule().component).toBeTruthy());

  it('formulário começa inválido', () => {
    expect(buildModule().component.form.invalid).toBe(true);
  });

  it('e-mail inválido', () => {
    const { component } = buildModule();
    component.f('email').setValue('nao-email');
    expect(component.f('email').hasError('email')).toBe(true);
  });

  it('CPF com dígitos repetidos é inválido', () => {
    const { component } = buildModule();
    component.f('cpf').setValue('111.111.111-11');
    expect(component.f('cpf').hasError('cpfInvalido')).toBe(true);
  });

  it('CPF matematicamente válido', () => {
    const { component } = buildModule();
    component.f('cpf').setValue('529.982.247-25');
    expect(component.f('cpf').hasError('cpfInvalido')).toBeFalsy();
  });

  it('telefone sem formatação é inválido', () => {
    const { component } = buildModule();
    component.f('telefone').setValue('11999990001');
    expect(component.f('telefone').hasError('pattern')).toBe(true);
  });

  it('não despacha se formulário inválido', () => {
    const { component, store } = buildModule();
    const spy = jest.spyOn(store, 'dispatch');
    component.submit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('despacha createUser com formulário válido', () => {
    const { component, store } = buildModule();
    const spy = jest.spyOn(store, 'dispatch');
    component.form.setValue(VALID);
    component.submit();
    expect(spy).toHaveBeenCalledWith(createUser({ userData: VALID as any }));
  });
});

describe('UserFormComponent — edição', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('isEditing = true quando user fornecido', () => {
    expect(buildModule(MOCK_USER).component.isEditing).toBe(true);
  });

  it('formulário pré-preenchido', () => {
    const { component } = buildModule(MOCK_USER);
    expect(component.f('nome').value).toBe(MOCK_USER.nome);
    expect(component.f('email').value).toBe(MOCK_USER.email);
  });

  it('despacha updateUser ao salvar', () => {
    const { component, store } = buildModule(MOCK_USER);
    const spy = jest.spyOn(store, 'dispatch');
    component.submit();
    expect(spy).toHaveBeenCalledWith(
      updateUser({ id: MOCK_USER.id, userData: expect.any(Object) })
    );
  });
});
