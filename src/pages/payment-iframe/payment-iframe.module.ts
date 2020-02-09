import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentIframePage } from './payment-iframe';

@NgModule({
  declarations: [
    PaymentIframePage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentIframePage),
  ],
})
export class PaymentIframePageModule {}
