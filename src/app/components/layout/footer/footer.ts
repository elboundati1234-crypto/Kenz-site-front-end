import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Mail, Phone, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './footer.html',
})
export class FooterComponent {
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
}
