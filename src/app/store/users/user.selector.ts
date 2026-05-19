import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('users');

export const selectUsers = createSelector(selectUserState, s => s.users);
export const selectTotal = createSelector(selectUserState, s => s.total);
export const selectPage = createSelector(selectUserState, s => s.page);
export const selectPageSize = createSelector(selectUserState, s => s.pageSize);
export const selectQuery = createSelector(selectUserState, s => s.query);
export const selectUsersLoading = createSelector(selectUserState, s => s.loading);
export const selectUsersSaving = createSelector(selectUserState, s => s.saving);
export const selectUsersError = createSelector(selectUserState, s => s.error);

// Selector composto: parâmetros de fetch
export const selectFetchParams = createSelector(
  selectQuery, selectPage, selectPageSize,
  (query, page, pageSize) => ({ query, page, pageSize })
);
