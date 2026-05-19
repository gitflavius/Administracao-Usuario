import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError, debounceTime, distinctUntilChanged,
  map, switchMap, withLatestFrom,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { selectFetchParams } from './user.selector';
import * as A from './user.actions';

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly userService = inject(UserService);

  /**
   * Busca com DEBOUNCE — ativada quando o usuário digita (setQuery).
   * debounceTime: aguarda 300ms antes de buscar.
   * distinctUntilChanged: ignora buscas repetidas.
   * switchMap: cancela a busca anterior se o usuário digitar de novo.
   * catchError: captura erros do service sem quebrar o stream.
   */
  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.setQuery),
      debounceTime(300),
      distinctUntilChanged((a, b) => a.query === b.query),
      withLatestFrom(this.store.select(selectFetchParams)),
      switchMap(([_, params]) =>
        this.userService.fetch(params).pipe(
          map(res => A.fetchUsersSuccess(res)),
          catchError(() => of(A.fetchUsersFailure({
            error: 'Erro ao buscar usuários. Tente novamente.',
          })))
        )
      )
    )
  );

  /**
   * Carregamento normal — ativado no init e ao trocar de página.
   * switchMap: cancela requisição anterior se página mudar rápido.
   * catchError: exibe mensagem de erro na tela.
   */
  fetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadUsers, A.setPage),
      withLatestFrom(this.store.select(selectFetchParams)),
      switchMap(([_, params]) =>
        this.userService.fetch(params).pipe(
          map(res => A.fetchUsersSuccess(res)),
          catchError(() => of(A.fetchUsersFailure({
            error: 'Erro ao carregar usuários. Verifique sua conexão.',
          })))
        )
      )
    )
  );

  /** Cria usuário e recarrega a lista para refletir o novo item. */
  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.createUser),
      switchMap(({ userData }) =>
        this.userService.create(userData).pipe(
          map(user => A.createUserSuccess({ user })),
          catchError(() => of(A.createUserFailure({
            error: 'Erro ao criar usuário.',
          })))
        )
      )
    )
  );

  /** Atualiza usuário e mantém os dados do localStorage. */
  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.updateUser),
      switchMap(({ id, userData }) =>
        this.userService.update(id, userData).pipe(
          map(user => A.updateUserSuccess({ user })),
          catchError(() => of(A.updateUserFailure({
            error: 'Erro ao atualizar usuário.',
          })))
        )
      )
    )
  );
}
