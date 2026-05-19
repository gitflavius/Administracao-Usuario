import {
  Component, OnInit, inject, ChangeDetectionStrategy,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  loadUsers, setQuery, setPage,
} from '../../../../store/users/user.actions';
import {
  selectUsers, selectTotal, selectPageSize,
  selectUsersLoading, selectUsersError,
} from '../../../../store/users/user.selector';
import { UserFormComponent } from '../user-form/user-form.component';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatDividerModule,
    MatPaginatorModule,
  ],
  template: `
    <!-- Toolbar exatamente como o protótipo -->
    <mat-toolbar class="top-bar">
      <button mat-icon-button aria-label="Menu">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="toolbar-title">USUÁRIOS</span>
      <mat-form-field class="search-field" appearance="outline" subscriptSizing="dynamic">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [formControl]="searchCtrl"
          placeholder="Pesquisar..."
          aria-label="Pesquisar usuário"
        />
      </mat-form-field>
    </mat-toolbar>

    <!-- Loading bar logo abaixo do toolbar -->
    @if (loading$ | async) {
      <mat-progress-bar mode="indeterminate" />
    }

    <!-- Conteúdo -->
    <div class="content">

      @if (error$ | async; as err) {
        <div class="error-banner">
          <mat-icon color="warn">error_outline</mat-icon>
          <span>{{ err }}</span>
          <button mat-button color="warn" (click)="reload()">Tentar novamente</button>
        </div>
      }

      <p class="section-label">Usuários cadastrados</p>

      <!-- Lista de usuários -->
      <div class="list-card">
        <mat-list>
          @for (user of users$ | async; track user.id) {
            <mat-list-item>
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle class="user-name">{{ user.nome }}</span>
              <span matListItemLine class="user-email">{{ user.email }}</span>
              <button
                mat-icon-button
                matListItemMeta
                aria-label="Editar usuário"
                (click)="openEdit(user)"
              >
                <mat-icon class="edit-icon">edit</mat-icon>
              </button>
            </mat-list-item>
            <mat-divider />
          } @empty {
            @if (!(loading$ | async)) {
              <p class="empty">Nenhum usuário encontrado.</p>
            }
          }
        </mat-list>
      </div>

      <!-- Paginação -->
      <mat-paginator
        [length]="total$ | async"
        [pageSize]="pageSize$ | async"
        [pageSizeOptions]="[5, 10, 25, 50]"
        showFirstLastButtons
        (page)="onPage($event)"
        aria-label="Selecionar página"
      />
    </div>

    <!-- FAB vermelho — igual ao protótipo -->
    <button
      mat-fab
      color="warn"
      class="fab"
      aria-label="Adicionar usuário"
      (click)="openCreate()"
    >
      <mat-icon>add</mat-icon>
    </button>
  `,
  styles: [`
    /* Toolbar escuro idêntico ao protótipo */
    .top-bar {
      background: #616161;
      color: #ffffff;
      gap: 12px;
      padding: 0 8px;
    }

    .toolbar-title {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    /* Campo de busca cresce para ocupar o restante do toolbar */
    .search-field {
      flex: 1;
      max-width: 480px;
      font-size: 0.875rem;
    }

    /* Remove a borda interna do mat-form-field no toolbar */
    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.15);
    }
    .search-field ::ng-deep input { color: #fff; }
    .search-field ::ng-deep .mat-mdc-form-field-icon-prefix mat-icon { color: rgba(255,255,255,0.7); }
    .search-field ::ng-deep .mdc-notched-outline__leading,
    .search-field ::ng-deep .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.3) !important; }

    /* Área de conteúdo */
    .content {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .section-label {
      font-size: 0.8rem;
      color: #757575;
      margin: 0 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Card branco que envolve a lista */
    .list-card {
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,.15);
      overflow: hidden;
    }

    /* Estilo de cada item da lista */
    mat-list-item {
      border-bottom: 1px solid #f0f0f0;
    }

    .user-name  { font-weight: 500; }
    .user-email { color: #757575; font-size: 0.85rem; }
    .edit-icon  { color: #9e9e9e; }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff3e0;
      border-left: 4px solid #e64a19;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .empty {
      text-align: center;
      color: #9e9e9e;
      padding: 48px;
    }

    /* Botão + canto inferior direito */
    .fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background-color: #e53935 !important;
      color: #fff !important;

    }

    mat-paginator {
      background: transparent;
    }
  `],
})
export class UserListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  users$ = this.store.select(selectUsers);
  total$ = this.store.select(selectTotal);
  pageSize$ = this.store.select(selectPageSize);
  loading$ = this.store.select(selectUsersLoading);
  error$ = this.store.select(selectUsersError);

  searchCtrl = new FormControl('', { nonNullable: true });

  constructor() {
    // RxJS
    //  distinctUntilChanged + takeUntilDestroyed
    this.searchCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(query => this.store.dispatch(setQuery({ query })));
  }

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }

  reload(): void {
    this.store.dispatch(loadUsers());
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(setPage({ page: event.pageIndex, pageSize: event.pageSize }));
  }

  openCreate(): void {
    this.dialog.open(UserFormComponent, {
      width: '5629px',
      maxWidth: '95vw', //UI UX
      disableClose: true,
      data: { user: null },
    });
  }

  openEdit(user: User): void {
    this.dialog.open(UserFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true,
      data: { user },
    });
  }
}
