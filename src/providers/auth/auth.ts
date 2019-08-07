import { Injectable} from '@angular/core'
import { Platform } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GooglePlus } from '@ionic-native/google-plus';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class Authentication {
  activeUser = new BehaviorSubject({ 
    isLogged: false,
    id: "",
    uid: "",
    name: "",
    email: "",
    phone: "",
    photo: "",
    address: "",
    postcode: "",
    receiveNotifications: false,
    provider: "",
    allowAccess: false,
    showMessage: false
  });

  activeShop = new BehaviorSubject({ 
    shopId: "",
    shopName: "",
    shopUrl: "",
    shopVendorName: "",
    shopIntegrationKey: "",
    shopIntegrationPassword: "",
    delivery: false
  });
  
  constructor(public angularFireAuth: AngularFireAuth, public googleplus: GooglePlus, public platform: Platform) { }
  
  doLogin(user) {
    this.activeUser.next({ 
      isLogged: true,
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      address: user.address,
      postcode: user.postcode,
      receiveNotifications: user.receiveNotifications,
      provider: user.provider,
      allowAccess: user.allowAccess,
      showMessage: user.showMessage
    });
  }

  doLogout() {
    this.activeUser.next({ 
      isLogged: false,
      id: "",
      uid: "",
      name: "",
      email: "",
      phone: "",
      photo: "",
      address: "",
      postcode: "",
      receiveNotifications: false,
      provider: "",
      allowAccess: false,
      showMessage: false
     });

    this.angularFireAuth.auth.signOut();
    if(this.platform.is('cordova')){
      this.googleplus.logout();
    }
  }

  setShop(shop) {
    this.activeShop.next({ 
      shopId: shop.shopId,
      shopName: shop.shopName,
      shopUrl: shop.shopUrl,
      shopVendorName: shop.shopVendorName,
      shopIntegrationKey: shop.shopIntegrationKey,
      shopIntegrationPassword: shop.shopIntegrationPassword,
      delivery: shop.delivery
     });
  }
}