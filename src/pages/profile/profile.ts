import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Authentication } from '../../providers/auth/auth';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Utils } from '../../utils/utils';
import { AngularFireAuth } from 'angularfire2/auth';
import { CheckoutPage } from '../checkout/checkout';
import { PreloaderProvider } from '../../providers/preloader/preloader';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  currentUser: any;
  currentShop: any;
  provider: string = "";
  name: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";
  phone: string;
  postcode: string;
  address: string;
  receiveNotifications: boolean;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public auth: Authentication, 
    public http: HttpServiceProvider, 
    public utils: Utils, 
    public angularFireAuth: AngularFireAuth,
    public loader: PreloaderProvider) {
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
        this.name = _user.name;
        this.email = _user.email;
        this.provider = _user.provider;
        this.phone = utils.isEmpty(_user.phone) ? "" : _user.phone;
        this.postcode = utils.isEmpty(_user.postcode) ? "" : _user.postcode;
        this.address = utils.isEmpty(_user.address) ? "" : _user.address;
        this.receiveNotifications = _user.receiveNotifications;
      });

      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
      });

      let message = this.navParams.get('message');
      let messageType = this.navParams.get('messageType');
      this.utils.showMessage(message, messageType);
  }

  ionViewDidLoad() {
    this.loader.hidePreloader();
  }

  confirm() {
    this.setUserInfo();
    if(this.validatePassword()){
      let currentUser = this.currentUser;
      let utils = this.utils;
      let auth = this.auth;
      let http = this.http;
      this.loader.displayPreloader();
      
      //Updates user in the api
      http.updateUser(currentUser)
        .subscribe(data => {
          //Error update user in the app
          if(data.error){
            this.loader.hidePreloader();
            utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
          }else{
            //Update password in firebase
            if(!utils.isEmpty(currentUser.password)){
              this.angularFireAuth.auth.currentUser.updatePassword(currentUser.password)
                .then(credential => {
                  //Success update password in firebase
                  auth.doLogin(currentUser);
                  this.loader.hidePreloader();
                  utils.showMessage(data.message, 'info');
                }, err => {
                  //Error update password in firebase
                  this.loader.hidePreloader();
                  utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                });
            }else{
              //Update user info
              auth.doLogin(currentUser);
              this.loader.hidePreloader();
              utils.showMessage(data.message, 'info');
            }
          }
        }, err => {
          this.loader.hidePreloader();
          utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
        });
      }
  }

  setUserInfo() {
    if(this.currentUser.provider == 'email'){
      if(!this.utils.isEmpty(this.password)){
        this.currentUser.password = this.password;
      }
    }
    this.currentUser.name = this.name;
    this.currentUser.phone = this.phone;
    this.currentUser.postcode = this.postcode;
    this.currentUser.address = this.address;
    this.currentUser.receiveNotifications = this.receiveNotifications;
  }

  validatePassword() {
    let valid = true;

    if(!this.utils.isEmpty(this.password) && this.password.length < 8) {
      valid = false;
      this.utils.showMessage("Password must be at least 8 characters.", 'error');
    }else if(this.password != this.confirmPassword) {
      valid = false;
      this.utils.showMessage("Password and Confirm Password do not match.", 'error');
    }

    return valid;
  }

  goToCheckoutPage() {
    this.loader.displayPreloader();
    this.navCtrl.setRoot(CheckoutPage);
  }
}
