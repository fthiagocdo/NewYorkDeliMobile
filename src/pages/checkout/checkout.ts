import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { CheckoutAddressPage } from '../checkout-address/checkout-address';
import { CheckoutTablePage } from '../checkout-table/checkout-table';
import { Utils } from '../../utils/utils';
import { Authentication } from '../../providers/auth/auth';
import { CheckoutCollectPage } from '../checkout-collect/checkout-collect';
import { PreloaderProvider } from '../../providers/preloader/preloader';

@IonicPage()
@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage {
  currentUser: any;
  currentShop: any;
  partialValue: string;
  deliveryFee: string;
  riderTip: string;
  totalValue: string;
  checkoutItems: Array<{}>;
  deliverOrCollect: string;
  delivery: boolean;
  checkoutMessage: string;
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: HttpServiceProvider,
    public auth: Authentication,  
    public alertCtrl: AlertController,
    public utils: Utils,
    public loader: PreloaderProvider) { 
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
      });

      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
        this.delivery = _shop.delivery;
      });
  }

  ionViewDidLoad() {
    this.loader.displayPreloader();

    this.loadData();

    let message = this.navParams.get('message');
    let messageType = this.navParams.get('messageType');
    this.utils.showMessage(message, messageType);
  }

  loadData() {
    this.http.getShoppingCart(this.currentUser.id, this.currentShop.shopId)
      .subscribe(data => { 
        this.partialValue = data.checkout.partial_value;
        this.deliverOrCollect = data.checkout.deliver_or_collect;
        this.deliveryFee = data.checkout.delivery_fee;
        this.riderTip = data.checkout.rider_tip;
        this.totalValue = data.checkout.total_value;
        this.checkoutItems = data.checkout.checkout_items;
        this.checkoutMessage = data.checkout.checkout_message;
        this.loader.hidePreloader();
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      });
  }

  saveSomethingElseMessage(confirmCheckout){
    if(this.checkoutMessage != null){
      this.http.setCheckoutMessage(this.currentUser.id, this.currentShop.shopId, this.checkoutMessage)
        .subscribe(data => { 
          this.setNextPage(confirmCheckout);
        }, err => {
          this.loader.hidePreloader();
          this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
        }
      );
    }else{
      this.setNextPage(confirmCheckout);
    }   
  }

  removeMenuItem(checkoutItemId) {
    this.loader.displayPreloader();

    this.http.removeMenuItem(this.currentUser.id, this.currentShop.shopId, checkoutItemId)
      .subscribe(data => { 
        this.saveSomethingElseMessage(false); 
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      }
    );
  }

  showYesNoDialog(checkoutItemId) {
    let alert = this.alertCtrl.create({
      title: 'Remove the item?',
      buttons: [{
        text: 'Yes',
        cssClass: 'primary-color',
        handler: () => {
          this.removeMenuItem(checkoutItemId);
        }
      }, {
        text: 'No',
        cssClass: 'primary-color'
      }],
      cssClass: 'primary-color'
    });
    alert.present();
}

  plusMenuItem(checkoutItemId) {
    this.loader.displayPreloader

    this.http.plusMenuItem(this.currentUser.id, this.currentShop.shopId, checkoutItemId)
      .subscribe(data => { 
        this.saveSomethingElseMessage(false); 
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      }
    );
  }

  minusMenuItem(checkoutItemId, checkoutItemQuantity) {
    //If there's just one item, remove it from the checkout
    if(checkoutItemQuantity == 1){
      this.showYesNoDialog(checkoutItemId);
    //Otherwise, minus one from the quantity
    }else{
      this.loader.displayPreloader();
  
      this.http.minusMenuItem(this.currentUser.id, this.currentShop.shopId, checkoutItemId)
        .subscribe(data => { 
          this.saveSomethingElseMessage(false);  
        }, err => {
          this.loader.hidePreloader();
          this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
        }
      );
    }
  }

  plusRiderTip() {
    this.loader.displayPreloader();
    
    this.http.plusRiderTip(this.currentUser.id, this.currentShop.shopId)
      .subscribe(data => { 
        this.saveSomethingElseMessage(false);  
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      }
    );
  }

  minusRiderTip() {
    this.loader.displayPreloader();

    this.http.minusRiderTip(this.currentUser.id, this.currentShop.shopId)
      .subscribe(data => { 
        this.saveSomethingElseMessage(false); 
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      }
    );
  }

  setDeliverOrCollect(deliverOrCollect) {
    this.loader.displayPreloader();

    this.http.setDeliverOrCollect(this.currentUser.id, this.currentShop.shopId, deliverOrCollect)
      .subscribe(data => { 
        this.saveSomethingElseMessage(false);  
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
      }
    );
  }

  confirmCheckout() {
    this.loader.displayPreloader();

    this.saveSomethingElseMessage(true);   
  }

  setNextPage(confirmCheckout){
    if(confirmCheckout){
      if(this.deliverOrCollect == 'deliver_address'){
        this.navCtrl.push(CheckoutAddressPage, {
          'amount': this.totalValue,
        });
      }else if(this.deliverOrCollect == 'deliver_table'){
          this.navCtrl.push(CheckoutTablePage, {
            'amount': this.totalValue,
          });
      }else{
        this.navCtrl.push(CheckoutCollectPage, {
          'amount': this.totalValue,
        });
      }
    }else{
      this.navCtrl.setRoot(CheckoutPage); 
    }
  }
}
