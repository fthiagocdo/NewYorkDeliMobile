import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { MenuPage } from '../menu/menu';
import { MenuExtraPage } from '../menu-extra/menu-extra';
import { CheckoutPage } from '../checkout/checkout';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { LoginPage } from '../login/login';
import { ShopPage } from '../shop/shop';

@IonicPage()
@Component({
  selector: 'page-menu-item',
  templateUrl: 'menu-item.html',
})
export class MenuItemPage {
  currentUser: any;
  currentShop: any;
  menuItems: Array<{}>;
  menuTypeName: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpServiceProvider, 
    public loadingCtrl: LoadingController, public auth: Authentication, public utils: Utils, 
    public alertCtrl: AlertController) { 
      this.auth.activeUser.subscribe((_user)=>{
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

    this.menuTypeName = this.navParams.get('menuTypeName').toLowerCase();
    let menutype_id = this.navParams.get('menuTypeId');
    this.http.getMenuItems(menutype_id)
      .subscribe(data => { 
        if(data.error){
          loading.dismiss();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.menuItems = data.list;
          loading.dismiss();
        }
      });
  }

  downloadImageMenuItem() {
    return this.http.downloadImageMenuItem(this.menuTypeName);
  }

  goToMenuExtra(id) {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.navCtrl.push(MenuExtraPage, {
      'menuItemId': id,
      'loading': loading
    });
  }

  addMenuItem(menuItemId) {
    if(!this.currentUser.isLogged){
      this.showYesNoDialog();
    }else{
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
      
      this.http.getMenuExtras(menuItemId)
        .subscribe(data => { 
          if(data.error){
            loading.dismiss();
            this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
          }else{
            let menuExtras = data.list;
            //No menuExtras. Add the item to the cart.
            if(menuExtras.length == 0){
              this.http.addMenuItem(this.currentUser.id, this.currentShop.shopId, menuItemId, menuExtras)
              .subscribe(data => { 
                if(data.error){
                  loading.dismiss();
                  this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                }else{
                  this.navCtrl.setRoot(MenuPage, {
                    'itemAdded': true,
                    'message': data.message,
                    'loading': loading
                  });
                }
              });
            }else{
              //Show menuExtras list for the item
              this.navCtrl.push(MenuExtraPage, {
                'menuItemId': menuItemId,
                'menuExtras': menuExtras,
                'loading': loading
              });
            }
          }
        });
    }
  }

  showYesNoDialog() {
    let alert = this.alertCtrl.create({
      title: 'Please login to your account.',
      buttons: [{
        text: 'Cancel',
        cssClass: 'primary-color'
      }, {
        text: 'Take me to login',
        cssClass: 'primary-color',
        handler: () => {
          this.navCtrl.setRoot(LoginPage);
        }
      }],
      cssClass: 'primary-color'
    });
    alert.present();
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
