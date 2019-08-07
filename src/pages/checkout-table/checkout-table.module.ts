import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckoutTablePage } from './checkout-table';

@NgModule({
  declarations: [
    CheckoutTablePage,
  ],
  imports: [
    IonicPageModule.forChild(CheckoutTablePage),
  ],
})
export class CheckoutTablePageModule {}
