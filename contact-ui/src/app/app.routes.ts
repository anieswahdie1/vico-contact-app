import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/contacts',
    pathMatch: 'full',
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./components/contact-list/contact-list.component').then(
        (m) => m.ContactListComponent
      ),
  },
];
