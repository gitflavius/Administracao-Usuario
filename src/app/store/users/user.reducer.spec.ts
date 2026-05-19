/// <reference types="jest" />
import { describe, it, expect } from '@jest/globals';
import { userReducer, initialState } from './user.reducer';
import * as A from './user.actions';
import { User } from '../../core/models/user.model';

const USERS: User[] = [
  { id: '1', nome: 'Ana', email: 'a@t.com', cpf: '529.982.247-25', telefone: '(11) 9-0001', tipoTelefone: 'celular' },
  { id: '2', nome: 'Bruno', email: 'b@t.com', cpf: '111.444.777-35', telefone: '(11) 9-0002', tipoTelefone: 'celular' },
];

describe('userReducer', () => {
  it('retorna estado inicial', () => {
    const state = userReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('loadUsers ativa loading', () => {
    const state = userReducer(initialState, A.loadUsers());
    expect(state.loading).toBe(true);
  });

  it('setQuery atualiza query e reseta página para 0', () => {
    const s1 = userReducer({ ...initialState, page: 3 }, A.setQuery({ query: 'Ana' }));
    expect(s1.query).toBe('Ana');
    expect(s1.page).toBe(0);
  });

  it('setPage atualiza page e pageSize', () => {
    const state = userReducer(initialState, A.setPage({ page: 2, pageSize: 25 }));
    expect(state.page).toBe(2);
    expect(state.pageSize).toBe(25);
  });

  it('fetchUsersSuccess salva usuários e total', () => {
    const state = userReducer(
      { ...initialState, loading: true },
      A.fetchUsersSuccess({ users: USERS, total: 100 })
    );
    expect(state.loading).toBe(false);
    expect(state.users).toEqual(USERS);
    expect(state.total).toBe(100);
  });

  it('fetchUsersFailure registra erro', () => {
    const state = userReducer(
      { ...initialState, loading: true },
      A.fetchUsersFailure({ error: 'Falha' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Falha');
  });

  it('createUserSuccess adiciona usuário e incrementa total', () => {
    const base = userReducer(initialState, A.fetchUsersSuccess({ users: USERS, total: 2 }));
    const newUser: User = { id: '3', nome: 'Carla', email: 'c@t.com', telefone: '(21) 9-0003', cpf: 'cpf', tipoTelefone: 'comercial' };
    const state = userReducer(base, A.createUserSuccess({ user: newUser }));
    expect(state.users.length).toBe(3);
    expect(state.total).toBe(3);
  });

  it('updateUserSuccess atualiza o usuário correto', () => {
    const base = userReducer(initialState, A.fetchUsersSuccess({ users: USERS, total: 2 }));
    const updated = { ...USERS[0], nome: 'Ana Editada' };
    const state = userReducer(base, A.updateUserSuccess({ user: updated }));
    expect(state.users.find(u => u.id === '1')?.nome).toBe('Ana Editada');
  });
});
