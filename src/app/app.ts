import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/layout/footer/footer';
import { NavbarComponent } from './components/layout/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule,FooterComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('kenz');
}
