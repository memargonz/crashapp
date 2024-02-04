import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'crash-home-container',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './home-container.component.html',
  styleUrl: './home-container.component.scss',
})
export class HomeContainerComponent {}
