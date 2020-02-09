import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { MenuItemPage } from '../menu-item/menu-item';
import { CheckoutPage } from '../checkout/checkout';
import { ShopPage } from '../shop/shop';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Utils } from '../../utils/utils';
import { Authentication } from '../../providers/auth/auth';
import { PreloaderProvider } from '../../providers/preloader/preloader';

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  currentUser: any;
  currentShop: any;
  menuTypes: Array<{}>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: HttpServiceProvider, 
    public alertCtrl: AlertController, 
    public utils: Utils,
    public auth: Authentication,
    public loader: PreloaderProvider) { 
      this.auth.activeUser.subscribe((_user)=>{
        this.currentUser = _user;
      });
      this.auth.activeShop.subscribe((_shop)=>{
        this.currentShop = _shop;
      });
    }

  ionViewDidLoad() {
    this.loader.displayPreloader();
    
    this.getMenuTypes();

    //Proceed to checkout confirmation
    let message = this.navParams.get('message');
    let messageType = this.navParams.get('messageType');
    let itemAdded = this.navParams.get('itemAdded');
    if(itemAdded){
      this.showYesNoDialog();
    }else{
      this.utils.showMessage(message, messageType);
    }
  }

  getMenuTypes() {
    this.http.getMenuTypes(this.currentShop.shopId)
      .subscribe(data => {
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.menuTypes = data.list;
          this.loader.hidePreloader();
        }
      });
  }

  showYesNoDialog() {
    let alert = this.alertCtrl.create({
      title: 'Proceed to checkout?',
      buttons: [{
        text: 'No, continue shopping',
        cssClass: 'primary-color'
      }, {
        text: 'Yes, please',
        cssClass: 'primary-color',
        handler: () => {
          this.goToCheckoutPage();
        }
      }],
      cssClass: 'primary-color'
    });
    alert.present();
  }

  goToMenuItem(id, name) {
    this.loader.displayPreloader();

    this.navCtrl.push(MenuItemPage, {
      'menuTypeId': id,
      'menuTypeName': name,
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
