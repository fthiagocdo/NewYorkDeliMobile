import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { MenuPage } from '../menu/menu';
import { CheckoutPage } from '../checkout/checkout';
import { Utils } from '../../utils/utils';
import { Authentication } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html',
})
export class ShopPage {
  currentUser: any;
  currentShop: any;
  shops: Array<{}>;
  showMenu: boolean = false;
  disableClosedShops: boolean = false;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpServiceProvider,
  	public auth: Authentication, public loadingCtrl: LoadingController, public alertCtrl: AlertController,
  	public utils: Utils) {
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
    
    this.loadData(loading);

    this.showMenu = this.navParams.get('showMenu') == null ? false : this.navParams.get('showMenu');
    this.disableClosedShops = this.navParams.get('disableClosedShops') == null ? false : this.navParams.get('disableClosedShops');
  }

  loadData(loading) {
    this.http.listShops(false)
      .subscribe(data => { 
        if(data.error){
          loading.dismiss();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.shops = data.list
          loading.dismiss();
        }
      });
  }

  confirmShop(shop) {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    
    let navCtrl = this.navCtrl;
    let auth = this.auth;

    this.currentShop.shopId = shop.id;
    this.currentShop.shopName = shop.name;
    this.currentShop.shopUrl = shop.url;
    this.currentShop.shopVendorName = shop.vendor_name;
    this.currentShop.shopIntegrationKey = shop.integration_key;
    this.currentShop.shopIntegrationPassword = shop.integration_password;
    this.currentShop.delivery = shop.delivery == '1' ? true : false;

    if(this.currentUser.isLogged){
      this.http.getShoppingCart(this.currentUser.id, this.currentShop.shopId)
      .subscribe(data => { 
        auth.setShop(this.currentShop);
        navCtrl.setRoot(MenuPage, {'loading': loading});
      }, err => {
        loading.dismiss();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      });
    }else{
      auth.setShop(this.currentShop);
      navCtrl.setRoot(MenuPage, {'loading': loading});
      loading.dismiss();
    }
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
