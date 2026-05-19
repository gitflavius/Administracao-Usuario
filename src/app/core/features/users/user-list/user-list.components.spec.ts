import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { UserListComponent } from './user-list.components';
import {
  selectUsers, selectTotal, selectPageSize,
  selectUsersLoading, selectUsersError,
} from '../../../../store/users/user.selector';
import { loadUsers, setQuery, setPage } from '../../../../store/users/user.actions';
import { User } from '../../../../core/models/user.model';

const MOCK_USERS: User[] = [
  { id: '1', nome: 'Ana Silva', email: 'ana@test.com', cpf: '529.982.247-25', telefone: '(11) 99999-0001', tipoTelefone: 'celular' },
];

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let store: MockStore;
  const dialogSpy = { open: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent, NoopAnimationsModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectUsers, value: MOCK_USERS },
            { selector: selectTotal, value: 1 },
            { selector: selectPageSize, value: 10 },
            { selector: selectUsersLoading, value: false },
            { selector: selectUsersError, value: null },
          ],
        }),
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('despacha loadUsers ao inicializar', () => {
    const spy = jest.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(loadUsers());
  });

  it('despacha setQuery após debounce de 300ms', fakeAsync(() => {
    const spy = jest.spyOn(store, 'dispatch');
    component.searchCtrl.setValue('Ana');
    tick(300);
    expect(spy).toHaveBeenCalledWith(setQuery({ query: 'Ana' }));
    discardPeriodicTasks();
  }));

  it('abre dialog de criação', () => {
    component.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('abre dialog de edição com usuário correto', () => {
    component.openEdit(MOCK_USERS[0]);
    expect(dialogSpy.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { user: MOCK_USERS[0] } })
    );
  });

  it('despacha setPage ao mudar página', () => {
    const spy = jest.spyOn(store, 'dispatch');
    component.onPage({ pageIndex: 1, pageSize: 10, length: 100 } as any);
    expect(spy).toHaveBeenCalledWith(setPage({ page: 1, pageSize: 10 }));
  });
});
