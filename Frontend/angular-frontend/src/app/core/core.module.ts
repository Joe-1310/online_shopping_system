import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    AuthService,
    // Note: HTTP interceptors are now provided via provideHttpClient() in app.config.ts
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it only once in AppModule or standalone app config.'
      );
    }
  }
}
