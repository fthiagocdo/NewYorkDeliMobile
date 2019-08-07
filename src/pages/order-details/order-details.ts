import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { CheckoutPage } from '../checkout/checkout';
import { Utils } from '../../utils/utils';
import { Authentication } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-order-details',
  templateUrl: 'order-details.html',
})
export class OrderDetailsPage {
  currentUser: any;
  currentShop: any;
  checkoutId: number;
  orderNumber: number;
  partialValue: string;
  deliveryFee: string;
  riderTip: string;
  totalValue: string;
  checkoutMessage: string;
  checkoutItems: Array<{}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpServiceProvider,
  public loadingCtrl: LoadingController, public utils: Utils, public auth: Authentication) { 
    this.auth.activeUser.subscribe(_user => {
      this.currentUser = _user;
    });

    this.auth.activeShop.subscribe(_shop => {
      this.currentShop = _shop;
    });
  }

  ionViewDidLoad() {
    let loading = this.navParams.get('loading');
    if(loading == null){
      loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
    }

    let orderId = this.navParams.get('orderId');
    this.http.findOrder(orderId)
      .subscribe(data => { 
        if(data.error){
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
          loading.dismiss();
        }else{
          this.checkoutId = data.order.payment.checkout_id;
          this.partialValue = data.order.partial_value; 
          this.orderNumber = data.order.payment.order_number;
          this.deliveryFee = data.order.delivery_fee;
          this.riderTip = data.order.rider_tip;
          this.totalValue = data.order.total_value;
          this.checkoutMessage = data.order.checkout_message;
          this.checkoutItems = data.order.menu_items;
          loading.dismiss();
        }
      });
  }

  orderAgain(id) {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.http.orderAgain(id, this.currentUser.id, this.currentShop.shopId)
      .subscribe(data => {
        if(data.error){
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.navCtrl.setRoot(CheckoutPage, {
            'loading': loading
          }); 
        }
      });
  }

  goToCheckoutPage() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.navCtrl.setRoot(CheckoutPage, {
      'loading': loading,
    });
  }
}
