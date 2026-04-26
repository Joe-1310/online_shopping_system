import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();
  
  private currentDirection = 'ltr';

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  initializeLanguage() {
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    this.currentDirection = direction;
    
    document.documentElement.lang = lang;
    
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(direction);
    
    localStorage.setItem('selectedLanguage', lang);
    
    this.currentLangSubject.next(lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'en';
  }

  getDirection(): string {
    return this.currentDirection;
  }

  isRTL(): boolean {
    return this.currentDirection === 'rtl';
  }
}