import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PublicAppRoutingModule } from './public-app-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';

@NgModule({
  declarations: [PublicLayoutComponent, LoginComponent, SignupComponent, HomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
    SharedModule,
    PublicAppRoutingModule,
  ],
})
export class PublicAppModule {}
