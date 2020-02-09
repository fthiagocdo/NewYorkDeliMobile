import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { OrderDetailsPage } from '../order-details/order-details';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { ShopPage } from '../shop/shop';
import { CheckoutPage } from '../checkout/checkout';
import { PreloaderProvider } from '../../providers/preloader/preloader';

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

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: HttpServiceProvider,
    public auth: Authentication, 
    public utils: Utils,
    public loader: PreloaderProvider) { 
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
      });

      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
      });
    }

  ionViewDidLoad() {
    this.loader.displayPreloader();
    this.loadData();
  }

  loadData() {
    this.http.getOrderHistory(this.currentUser.id, this.currentShop.shopId)
      .subscribe(data => {
        this.isListRead = true;
        if(data.error){
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
          this.loader.hidePreloader();
        }else{
          this.orders = data.list; 
          this.loader.hidePreloader();
        }
      });
  }

  goToOrderDetails(id) {
    this.loader.displayPreloader();
    
    this.navCtrl.push(OrderDetailsPage, {
      'orderId': id,
    });
  }

  goToCheckoutPage() {
    this.loader.displayPreloader();

    if(this.utils.isEmpty(this.currentShop.shopId)){
      this.navCtrl.setRoot(ShopPage, {
        'message': 'Before to proceed, please choose a shop.',
        'messageType': 'info',
        'nextPage': 'Checkout',
      });
    }else{
      this.navCtrl.setRoot(CheckoutPage);
    }
  }
}
