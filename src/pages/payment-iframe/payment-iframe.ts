import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { get } from 'scriptjs';
import { PreloaderProvider } from '../../providers/preloader/preloader';
import { Utils } from '../../utils/utils';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { MenuPage } from '../menu/menu';
import { CheckoutPage } from '../checkout/checkout';
import { Authentication } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-payment-iframe',
  templateUrl: 'payment-iframe.html',
})
export class PaymentIframePage {
  currentUser: any;
  currentShop: any;
  checkoutId: string;
  url: SafeResourceUrl;

  constructor(
    public navctrl: NavController, 
    public navParams: NavParams,
    public loader: PreloaderProvider,
    public sanitizer: DomSanitizer,
    public utils: Utils,
    public auth: Authentication,
    public http: HttpServiceProvider) {
      get("assets/js/paymentiframe.js", () => { });
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
      });

      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
      });
  }

  ionViewDidLoad() {
    this.loader.displayPreloader();

    this.checkoutId = this.navParams.get('checkoutId');
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://newyorkdelidelivery.ftcdevsolutions.com/payment/iframe/android/'+this.currentUser.id+'/'+this.currentShop.shopId);
    
    setTimeout(() => {
      this.loader.hidePreloader();
    }, 5000);
  }

  returnToApp() {
    this.loader.displayPreloader();

    this.http.getPaymentConfirmation(this.checkoutId)
      .subscribe(data => { 
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          if(data.payment.retrieval_reference == 'success') {
            this.utils.showMessage(data.payment.message, 'info');
            this.navctrl.setRoot(MenuPage);  
          } else {
            this.utils.showMessage('Payment failed', 'error');
            this.navctrl.setRoot(CheckoutPage);
          }
        }
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
      }
    );
  }

}
