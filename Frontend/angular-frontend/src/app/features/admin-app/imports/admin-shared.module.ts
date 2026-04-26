import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DeleteConfirmModalComponent } from '../components/delete-confirm-modal/delete-confirm-modal.component';
import { ProductFormModalComponent } from '../components/product-form-modal/product-form-modal.component';

@NgModule({
  declarations: [DeleteConfirmModalComponent, ProductFormModalComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DeleteConfirmModalComponent,
    ProductFormModalComponent,
  ],
})
export class AdminSharedModule {}
