import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/features/users/user-list/user-list.components')
        .then(m => m.UserListComponent),
  },
  { path: '**', redirectTo: '' },
];
