import { Routes } from '@angular/router';
import { HomeContainerComponent } from './home-container/home-container.component';
import { AccidentReportComponent } from './accident-report-container/accident-report.component';

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
    component: AccidentReportComponent,
  },
];
