import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CheckoutPage } from '../checkout/checkout';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { MenuPage } from '../menu/menu';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { ShopPage } from '../shop/shop';
import { PreloaderProvider } from '../../providers/preloader/preloader';

@IonicPage()
@Component({
  selector: 'page-menu-extra',
  templateUrl: 'menu-extra.html',
})
export class MenuExtraPage {
  currentUser: any;
  currentShop: any;
  menuExtras: Array<string>;
  selectedExtras: Array<{}>;
  menuItemId:string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: HttpServiceProvider, 
    public auth: Authentication, 
    public utils: Utils,
    public loader: PreloaderProvider) { 
      this.auth.activeUser.subscribe((_user)=>{
        this.currentUser = _user;
      });
      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
      });
  }

  ionViewDidLoad() {
    this.selectedExtras = new Array();
    this.menuItemId = this.navParams.get('menuItemId');
    this.menuExtras = this.navParams.get('menuExtras');
    this.loader.hidePreloader();
  }

  addMenuExtra(event, menuExtraId) {
    //add item
    if(event.checked == true){
      this.selectedExtras.push(menuExtraId);
    //remove item
    }else{
      let indexOf = this.selectedExtras.indexOf(menuExtraId);
      this.selectedExtras.splice(indexOf, 1);
    }
  }
  
  confirm() {
    this.loader.displayPreloader();

    this.http.addMenuItem(this.currentUser.id, this.currentShop.shopId, this.menuItemId, this.selectedExtras)
      .subscribe(data => { 
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.navCtrl.setRoot(MenuPage, {
            'itemAdded': true,
            'message': data.message,
          });
        }
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
