import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { OrderDetailsPage } from '../order-details/order-details';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { ShopPage } from '../shop/shop';
import { CheckoutPage } from '../checkout/checkout';

@IonicPage()
@Component({
  selector: 'page-order-history',
  templateUrl: 'order-history.html',
})
export class OrderHistoryPage {
  currentUser: any;
  currentShop: any;
  orders: Array<{}>;
  isListRead: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpServiceProvider,
    public loadingCtrl: LoadingController, public auth: Authentication, public utils: Utils) { 
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
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
    }

    this.loadData(loading);
  }

  loadData(loading) {
    this.http.getOrderHistory(this.currentUser.id, this.currentShop.shopId)
      .subscribe(data => {
        this.isListRead = true;
        if(data.error){
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
          loading.dismiss();
        }else{
          this.orders = data.list; 
          loading.dismiss();
        }
      });
  }

  goToOrderDetails(id) {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    
    this.navCtrl.push(OrderDetailsPage, {
      'orderId': id,
      'loading': loading
    });
  }

  goToCheckoutPage() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    if(this.utils.isEmpty(this.currentShop.shopId)){
      this.navCtrl.setRoot(ShopPage, {
        'loading': loading,
        'message': 'Before to proceed, please choose a shop.',
        'messageType': 'info',
        'nextPage': 'Checkout'
      });
    }else{
      this.navCtrl.setRoot(CheckoutPage, {
        'loading': loading,
      });
    }
  }
}
