import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Scholarship } from '../../models/scholarship';

@Component({
  selector: 'app-scholarship-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './scholarship-card.html',
  styleUrls: ['./scholarship-card.css']
})
export class ScholarshipCardComponent {
  @Input() scholarship!: Scholarship; // Reçoit la bourse du parent
}