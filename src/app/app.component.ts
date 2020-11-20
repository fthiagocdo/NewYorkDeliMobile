import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
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
import { PreloaderProvider } from '../providers/preloader/preloader';

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

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen, 
    public auth: Authentication, 
    public loader: PreloaderProvider, 
    public utils: Utils) { 
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
      { title: 'Change Deli', icon: 'home', component: ShopPage },
      { title: 'Contact us', icon: 'mail', component: ContactUsPage  },
      { title: 'Login', icon: 'log-in', component: LoginPage },
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
    this.loader.displayPreloader();
    
    if(page.title == 'Logout'){
      this.auth.doLogout();
      this.utils.clearKeepMeLogged();
      this.nav.setRoot(LoginPage);
    }else if((page.title == 'Menu' || page.title == 'Checkout' || page.title == 'Order History') 
      && this.utils.isEmpty(this.currentShop.shopId)){
        this.nav.setRoot(ShopPage, {
          'disableClosedShops': false
        });
    }else if(page.title == 'Change Shop'){
      this.nav.setRoot(ShopPage, {
        'showMenu': true,
        'disableClosedShops': false
      });
    }else{
      this.nav.setRoot(page.component);
    }
  }
}
