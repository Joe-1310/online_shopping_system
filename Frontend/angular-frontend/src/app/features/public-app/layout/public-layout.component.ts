import { Component } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-public-layout',
  standalone: false,
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css'],
})
export class PublicLayoutComponent {
  currentLanguage = 'en';

  constructor(public languageService: LanguageService) {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  switchLanguage(lang: string) {
    this.languageService.setLanguage(lang);
  }
}
