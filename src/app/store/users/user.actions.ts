import { createAction, props } from '@ngrx/store';
import { User, UserFormData } from '../../core/models/user.model';

// Fetch Users (busca e Paginação)
export const loadUsers = createAction('[Users] Load Users');

export const setQuery = createAction(
  '[Users] Set Query',
  props<{ query: string }>()
);

export const setPage = createAction(
  '[Users] Set Page',
  props<{ page: number; pageSize: number }>()
);

export const fetchUsersSuccess = createAction(
  '[Users] Fetch Success',
  props<{ users: User[]; total: number }>()
);

export const fetchUsersFailure = createAction(
  '[Users] Fetch Failure',
  props<{ error: string }>()
);


// Criar Usuario

export const createUser = createAction(
  '[Users] Create',
  props<{ userData: UserFormData }>()
);

export const createUserSuccess = createAction(
  '[Users] Create Success',
  props<{ user: User }>()
);

export const createUserFailure = createAction(
  '[Users] Create Failure',
  props<{ error: string }>()
);


// ── Atualizar Usuario
export const updateUser = createAction(
  '[Users] Update',
  props<{ id: string; userData: UserFormData }>()
);

export const updateUserSuccess = createAction(
  '[Users] Update Success',
  props<{ user: User }>()
);

export const updateUserFailure = createAction(
  '[Users] Update Failure',
  props<{ error: string }>()
);
