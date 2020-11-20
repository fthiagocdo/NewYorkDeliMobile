import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { MenuPage } from '../menu/menu';
import { CheckoutPage } from '../checkout/checkout';
import { Utils } from '../../utils/utils';
import { Authentication } from '../../providers/auth/auth';
import { PreloaderProvider } from '../../providers/preloader/preloader';

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
  
  constructor(
    public navCtrl: NavController, 
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
      });
  }

  ionViewDidLoad() {
    this.loader.displayPreloader();
    this.loadData();
    this.showMenu = this.navParams.get('showMenu') == null ? false : this.navParams.get('showMenu');
    this.disableClosedShops = this.navParams.get('disableClosedShops') == null ? false : this.navParams.get('disableClosedShops');
  }

  loadData() {
    this.http.listShops(false)
      .subscribe(data => { 
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.shops = data.list
          this.loader.hidePreloader();
        }
      });
  }

  confirmShop(shop) {
    if(shop.available) {
      this.loader.displayPreloader();
    
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
          navCtrl.setRoot(MenuPage);
        }, err => {
          this.loader.hidePreloader();
          this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
        });
      }else{
        auth.setShop(this.currentShop);
        navCtrl.setRoot(MenuPage);
        this.loader.hidePreloader();
      }
    }
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

