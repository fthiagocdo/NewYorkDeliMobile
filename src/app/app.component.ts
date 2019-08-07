import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { MenuPage } from '../pages/menu/menu';
import { ShopPage } from '../pages/shop/shop';
import { LoginPage } from '../pages/login/login';
import { ContactUsPage } from '../pages/contact-us/contact-us';
import { ProfilePage } from '../pages/profile/profile';
import { OrderHistoryPage } from '../pages/order-history/order-history';
import { CheckoutPage } from '../pages/checkout/checkout';
import { Authentication } from '../providers/auth/auth';
import { Utils } from '../utils/utils';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  pagesGuest: Array<{title: string, icon: string, component: any}>;
  pagesUser: Array<{title: string, icon: string, component: any}>;
  currentUser: any;
  currentShop: any;
  showSplash: boolean = true;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, 
    public auth : Authentication, public loadingCtrl: LoadingController, public utils: Utils) { 
    this.initializeApp();

    this.auth.activeUser.subscribe((_user)=>{
      this.currentUser = _user;
    });

    this.auth.activeShop.subscribe((_shop)=>{
      this.currentShop = _shop;
    });

    this.loadData();
  }

  loadData() {
    this.pagesGuest = [
      { title: 'Menu', icon: 'list', component: MenuPage },
      { title: 'Change Shop', icon: 'home', component: ShopPage },
      { title: 'Contact us', icon: 'mail', component: ContactUsPage  },
      { title: 'Login', icon: 'log-in', component: LoginPage }
    ];
    this.pagesUser = [
      { title: 'Profile', icon: 'person', component: ProfilePage },
      { title: 'Menu', icon: 'list', component: MenuPage },
      { title: 'Contact us', icon: 'mail', component: ContactUsPage },
      { title: 'Order History', icon: 'list-box', component: OrderHistoryPage },
      { title: 'Checkout', icon: 'cart', component: CheckoutPage },
      { title: 'Logout', icon: 'log-out', component: LoginPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#272500');
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    
    if(page.title == 'Logout'){
      this.auth.doLogout();
      this.utils.clearDetailsKeepmeLogged();
      this.nav.setRoot(LoginPage, {'loading': loading});
    }else if(page.title == 'Menu' && this.utils.isEmpty(this.currentShop.shopId)){
      this.nav.setRoot(ShopPage, {
        'loading': loading,
        'showMenu': false,
        'disableClosedShops': false
      });
    }else if(page.title == 'Change Shop'){
      this.nav.setRoot(ShopPage, {
        'loading': loading,
        'showMenu': true,
        'disableClosedShops': false
      });
    }else{
      this.nav.setRoot(page.component, {'loading': loading});
    }
  }
}
