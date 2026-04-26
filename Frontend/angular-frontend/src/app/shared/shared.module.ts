import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

@NgModule({
  declarations: [ProductListComponent, ProductDetailComponent],
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  exports: [ProductListComponent, ProductDetailComponent, CommonModule, RouterModule, FormsModule],
})
export class SharedModule {}
