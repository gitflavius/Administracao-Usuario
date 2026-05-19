import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import * as A from './user.actions';

export interface UserState {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialState: UserState = {
  users: [],
  total: 0,
  page: 0,
  pageSize: 10,
  query: '',
  loading: false,
  saving: false,
  error: null,
};

export const userReducer = createReducer(
  initialState,

  // ── Fetch ──────────────────────────────────────────────────────────────
  on(A.loadUsers, A.setQuery, A.setPage, state => ({
    ...state, loading: true, error: null,
  })),

  on(A.setQuery, (state, { query }) => ({ ...state, query, page: 0 })),
  on(A.setPage, (state, { page, pageSize }) => ({ ...state, page, pageSize })),

  on(A.fetchUsersSuccess, (state, { users, total }) => ({
    ...state, loading: false, users, total,
  })),

  on(A.fetchUsersFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  // ── Criar ────────────────────────────────────────────────────────────
  on(A.createUser, state => ({ ...state, saving: true, error: null })),
  on(A.createUserSuccess, (state, { user }) => ({
    ...state, saving: false,
    users: [user, ...state.users],
    total: state.total + 1,
  })),
  on(A.createUserFailure, (state, { error }) => ({ ...state, saving: false, error })),

  // ── Atualizar ────────────────────────────────────────────────────────────
  on(A.updateUser, state => ({ ...state, saving: true, error: null })),
  on(A.updateUserSuccess, (state, { user }) => ({
    ...state, saving: false,
    users: state.users.map(u => u.id === user.id ? user : u),
  })),
  on(A.updateUserFailure, (state, { error }) => ({ ...state, saving: false, error })),
);
