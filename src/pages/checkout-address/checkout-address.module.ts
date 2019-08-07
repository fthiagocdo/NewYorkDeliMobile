import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckoutAddressPage } from './checkout-address';

@NgModule({
  declarations: [
    CheckoutAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(CheckoutAddressPage),
  ],
})
export class CheckoutAddressPageModule {}
