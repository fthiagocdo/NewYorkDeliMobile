import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '../../node_modules/@angular/http';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { GooglePlus } from '@ionic-native/google-plus'
import { Facebook } from '@ionic-native/facebook';
import { IonicStorageModule } from '@ionic/storage';
import { AES256 } from '@ionic-native/aes-256';

import { MyApp } from './app.component';
import { MenuPage } from '../pages/menu/menu';
import { MenuItemPage } from '../pages/menu-item/menu-item';
import { MenuExtraPage } from '../pages/menu-extra/menu-extra';
import { LoginPage } from '../pages/login/login';
import { ContactUsPage } from '../pages/contact-us/contact-us';
import { ProfilePage } from '../pages/profile/profile';
import { OrderHistoryPage } from '../pages/order-history/order-history';
import { OrderDetailsPage } from '../pages/order-details/order-details';
import { CheckoutPage } from '../pages/checkout/checkout';
import { CheckoutAddressPage } from '../pages/checkout-address/checkout-address';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { ShopPage } from '../pages/shop/shop';
import { CheckoutTablePage } from '../pages/checkout-table/checkout-table';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { CheckoutCollectPage } from '../pages/checkout-collect/checkout-collect';
import { PaymentPage } from '../pages/payment/payment';
import { PaymentIframePage } from '../pages/payment-iframe/payment-iframe';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Authentication } from '../providers/auth/auth';
import { Utils } from '../utils/utils';
import { HttpServiceProvider } from '../providers/http-service/http-service';
import { SagepayProvider } from '../providers/sagepay/sagepay';
import { PreloaderProvider } from '../providers/preloader/preloader';

const firebaseConfig = {
  apiKey: "AIzaSyAO3VWN1z1mJyt4b5UbF_znqSFPNFwJgqk",
  authDomain: "new-york-deli-6bf9b.firebaseapp.com",
  databaseURL: "https://new-york-deli-6bf9b.firebaseio.com",
  projectId: "new-york-deli-6bf9b",
  storageBucket: "new-york-deli-6bf9b.appspot.com",
  messagingSenderId: "625405167152",
  appId: "1:625405167152:web:283f162a764dd92ed9cff5"
}

@NgModule({
  declarations: [
    MyApp,
    MenuPage,
    MenuItemPage,
    MenuExtraPage,
    LoginPage,
    ContactUsPage,
    ProfilePage,
    OrderHistoryPage,
    OrderDetailsPage,
    CheckoutPage,
    CheckoutAddressPage,
    ResetPasswordPage,
    SignUpPage,
    ShopPage,
    CheckoutTablePage,
    CheckoutCollectPage,
    PaymentPage,
    PaymentIframePage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MenuPage,
    MenuItemPage,
    MenuExtraPage,
    LoginPage,
    ContactUsPage,
    ProfilePage,
    OrderHistoryPage,
    OrderDetailsPage,
    CheckoutPage,
    CheckoutAddressPage,
    ResetPasswordPage,
    SignUpPage,
    ShopPage,
    CheckoutTablePage,
    CheckoutCollectPage,
    PaymentPage,
    PaymentIframePage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GooglePlus,
    Facebook,
    AES256,
    Authentication,
    Utils,
    SagepayProvider,
    HttpServiceProvider,
    PreloaderProvider
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
