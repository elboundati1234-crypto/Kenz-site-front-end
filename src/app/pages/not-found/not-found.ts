import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, FileQuestion, Home, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './not-found.html',
  styles: [`
    .error-code {
      font-size: 8rem;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, var(--primary-custom) 0%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      opacity: 0.8;
    }
  `]
})
export class NotFoundComponent {
  // Icônes
  readonly FileQuestionIcon = FileQuestion;
  readonly HomeIcon = Home;
  readonly ArrowLeftIcon = ArrowLeft;

  goBack() {
    window.history.back();
  }
}
