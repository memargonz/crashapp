import { Routes } from '@angular/router';
import { HomeContainerComponent } from './home-container/home-container.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeContainerComponent,
  },
  {
    path: 'reporting',
    component: HomeContainerComponent,
  },
];
