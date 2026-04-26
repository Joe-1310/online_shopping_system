import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  exports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
})
export class CustomerSharedModule {}
