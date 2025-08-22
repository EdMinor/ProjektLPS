import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.css']
})
export class CookieBannerComponent implements OnInit {
  showBanner = false;

  ngOnInit(): void {
    // Prüfe ob Cookies bereits akzeptiert wurden
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    localStorage.setItem('cookiesAccepted', 'true');
    this.showBanner = false;
  }

  declineCookies(): void {
    localStorage.setItem('cookiesAccepted', 'false');
    this.showBanner = false;
  }
}
