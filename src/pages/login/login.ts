import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AES256 } from '@ionic-native/aes-256';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { HttpServiceProvider } from '../../providers/http-service/http-service';

import { ShopPage } from '../shop/shop';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { SignUpPage } from '../sign-up/sign-up';
import { PreloaderProvider } from '../../providers/preloader/preloader';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  currentUser: any;
  email: string;
  password: string;
  generateSecureKeyAlias: string = 'CByPOCfqJD';
  generateSecureIVAlias: string = 'akGoaW6ifP';
  secureKeyAlias: string = 'rRnrMSkc3x';
  secureIVAlias: string = 'wRHuW2DmiY';
  keepmeLoggedAlias: string = 'rkZvGqUbSs';
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public angularFireAuth: AngularFireAuth, 
    public googleplus: GooglePlus, 
    public facebook: Facebook, 
    public platform: Platform, 
    public auth : Authentication, 
    public utils: Utils, 
    public http: HttpServiceProvider, 
    public alertCtrl: AlertController, 
    public storage: Storage, 
    public aes256: AES256,
    public loader: PreloaderProvider) { 
      this.auth.activeUser.subscribe((_user)=>{
        this.currentUser = _user;
      });
  }

  ionViewDidLoad() {
    this.loader.displayPreloader();
    
    if(this.platform.is('cordova')){
      this.getDetailsKeepmeLogged();
    }else{
      this.loader.hidePreloader();
    }
    
  }

  showYesNoDialog() {
    let alert = this.alertCtrl.create({
      title: 'Keep me logged?',
      buttons: [{
        text: 'No',
        cssClass: 'primary-color',
        handler: () => {
          if(this.platform.is('cordova')){
            this.utils.clearDetailsKeepmeLogged();
          }
        }
      }, {
        text: 'Yes',
        cssClass: 'primary-color',
        handler: () => {
          if(this.platform.is('cordova')){
            this.setDetailsKeepmeLogged(this.currentUser);
          }
        }
      }],
      cssClass: 'primary-color'
    });
    alert.present();
  }

  setDetailsKeepmeLogged(user) {
    let detailsKeepmeLogged = user.uid+','+user.email+','+user.provider;
    if(user.provider != 'email'){
      detailsKeepmeLogged += ','+user.name+','+user.photo;
    }
    
    let secureKey = null;
    let secureIV = null;

    this.aes256.generateSecureKey(this.generateSecureKeyAlias)
      .then(res => {
        secureKey = res;
        this.storage.set(this.secureKeyAlias, res);
        
        this.aes256.generateSecureIV(this.generateSecureIVAlias)
          .then(res => {
            secureIV = res;
            this.storage.set(this.secureIVAlias, res);
            
            this.aes256.encrypt(secureKey, secureIV, detailsKeepmeLogged)
              .then(res => {
                this.storage.set(this.keepmeLoggedAlias, res);
              });
          })
      });
  }

  getDetailsKeepmeLogged() {
    let secureKey = null;
    let secureIV = null;
    let details = null;
    
    this.storage.get(this.keepmeLoggedAlias).then((val) => {
      if(!this.utils.isEmpty(val)){
        details = val;
        this.storage.get(this.secureKeyAlias)
          .then((val) => { 
            secureKey = val; 
            
            this.storage.get(this.secureIVAlias)
              .then((val) => { 
                secureIV = val; 
            
                this.aes256.decrypt(secureKey, secureIV, details)
                  .then(res => {
                    this.keepmeLogged(res.split(','));
                  });
            });
          });
      }else{
        this.loader.hidePreloader();
      }
    });
  }

  keepmeLogged(details) {
    let auth = this.auth;
    let utils = this.utils;
    let login = this;

    this.currentUser.uid = details[0];
    this.currentUser.email = details[1];
    this.currentUser.provider = details[2];
    if(this.currentUser.provider != 'email'){
      this.currentUser.name = details[3];
      this.currentUser.photo = details[4];
    }

    //Retrieves the user in the api
    this.http.findOrCreateUser(this.currentUser)
    .subscribe(data => {
      //Can't find the user
      if(data.details_customer.error){
        auth.doLogout();
        this.loader.hidePreloader();
        utils.showMessage(data.details_customer.message, 'error');
      //Found the user
      }else{
        login.setUserInfo(data.details_customer.customer);
        login.showMessage(data.info_messages);
        login.goToShopPage(); 
      }
    }, err => {
      this.loader.hidePreloader();
      utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
    });
  }

  loginMail() {
    if(this.validateData()){
      this.currentUser.email = this.email;

      let login = this;
      let currentUser = this.currentUser;
      let utils = this.utils;
      let http = this.http;
      let auth = this.auth;
      this.loader.displayPreloader();

      //Signs in firebase
      this.angularFireAuth.auth.signInWithEmailAndPassword(this.email, this.password)
        .then(function (credential) {
          if(credential.user.emailVerified){
            currentUser.uid = credential.user.uid;
            currentUser.email = credential.user.email;
            currentUser.provider = 'email';
            
            //Retrieves the user in the api
            http.findOrCreateUser(currentUser)
              .subscribe(data => {
                //Can't find the user
                if(data.details_customer.error){
                  auth.doLogout();
                  this.loader.hidePreloader();
                  utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                //Found the user
                }else{
                  if(data.details_customer.customer.allow_access == '1'){
                    login.showYesNoDialog();
                  }
                  login.setUserInfo(data.details_customer.customer);
                  login.showMessage(data.info_messages);
                  login.goToShopPage(); 
                }
              }, err => {
                auth.doLogout();
                this.loader.hidePreloader();
                utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
              });
          }else{
            auth.doLogout();
            this.loader.hidePreloader();
            utils.showMessage('Please validate your email address. Kindly check your inbox.', 'error');
          }
      }, function (err) {
        this.loader.hidePreloader();
        utils.showMessage(err.message, 'error');
      });
    }
  }

  loginGoogle() {
    if(this.platform.is('cordova')){
      this.nativeGoogleLogin();
    }else{
      this.webGoogleLogin();
    }
  }

  webGoogleLogin() {
    let currentUser = this.currentUser;
    let utils = this.utils;
    let login = this;
    let auth = this.auth;
    let http = this.http;
    this.loader.displayPreloader();

    const provider = new firebase.auth.GoogleAuthProvider();
    this.angularFireAuth.auth.signInWithPopup(provider)
      .then(function (credential) {
        currentUser.uid = credential.user.uid;
        currentUser.email = credential.user.email;
        currentUser.name = credential.user.displayName;
        currentUser.photo = credential.user.photoURL;
        currentUser.provider = 'google';

        //Retrieves the user in the api
        http.findOrCreateUser(currentUser)
          .subscribe(data => {
            //Can't find the user
            if(data.details_customer.error){
              auth.doLogout();
              this.loader.hidePreloader();
              utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
            //Found the user
            }else{
              if(data.details_customer.customer.allow_access == '1'){
                login.showYesNoDialog();
              }
              login.setUserInfo(data.details_customer.customer);
              login.showMessage(data.info_messages);
              login.goToShopPage();
            }
        }, err => {
          this.loader.hidePreloader();
          utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        });
    }, function (err) {
      this.loader.hidePreloader();
      utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
    })
    .catch( err => { 
      this.loader.hidePreloader();
      utils.showMessage(err.message, 'error');
    });
  }

  nativeGoogleLogin() {
    let currentUser = this.currentUser;
    let utils = this.utils;
    let login = this;
    let auth = this.auth;
    let http = this.http;
    this.loader.displayPreloader();
     
    this.googleplus.login({
      'webClientId': '97143556372-23j7cjinroqofsqboa8fs9i5qlqkqb14.apps.googleusercontent.com'
    })
      .then( res => {
        const googleCredential = firebase.auth.GoogleAuthProvider.credential(res.idToken);
        firebase.auth().signInWithCredential(googleCredential)
          .then( user => {
            currentUser.uid = user.uid;
            currentUser.email = user.email;
            currentUser.name = user.displayName;
            currentUser.photo = user.photoURL;
            currentUser.provider = 'google';
            
            //Retrieves the user in the api
            http.findOrCreateUser(currentUser)
              .subscribe(data => {
                //Can't find the user
                if(data.details_customer.error){
                  auth.doLogout();
                  this.loader.hidePreloader();
                  utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                //Found the user
                }else{
                  if(data.details_customer.customer.allow_access == '1'){
                    login.showYesNoDialog();
                  }
                  login.setUserInfo(data.details_customer.customer);
                  login.showMessage(data.info_messages);
                  login.goToShopPage();
                }
            }, err => {
              this.loader.hidePreloader();
              utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
            });
      })
      .catch( error => { 
        this.loader.hidePreloader();
        utils.showMessage(error, 'error');
      });
    })
    .catch( err => { 
      this.loader.hidePreloader();
      utils.showMessage(err.message, 'error');
    });
  }

  loginFacebook() {
    let currentUser = this.currentUser;
    let utils = this.utils;
    let login = this;
    let auth = this.auth;
    let http = this.http;
    this.loader.displayPreloader();

    this.facebook.login(['email'])
      .then( res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(res.authResponse.accessToken);
        firebase.auth().signInWithCredential(facebookCredential)
          .then( user => { 
            currentUser.uid = user.uid;
            currentUser.email = user.email;
            currentUser.name = user.displayName;
            currentUser.photo = user.photoURL+'?height=256&width=256';
            currentUser.provider = 'facebook'; 

            //Retrieves the user in the api
            http.findOrCreateUser(currentUser)
              .subscribe(data => {
                //Can't find the user
                if(data.details_customer.error){
                  auth.doLogout();
                  this.loader.hidePreloader();
                  utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                //Found the user
                }else{
                  if(data.details_customer.customer.allow_access == '1'){
                    login.showYesNoDialog();
                  }
                  login.setUserInfo(data.details_customer.customer);
                  login.showMessage(data.info_messages);
                  login.goToShopPage();
                }
            }, err => {
              this.loader.hidePreloader();
              utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
            });
          })
          .catch( error => { 
            this.loader.hidePreloader();
            utils.showMessage(error, 'error');
          });
      })
      .catch( err => { 
        this.loader.hidePreloader();
        utils.showMessage(err.message, 'error');
      });
  }

  signUp() {
    this.loader.displayPreloader();

    this.navCtrl.push(SignUpPage);
  }

  resetPassword() {
    this.loader.displayPreloader();

    this.navCtrl.push(ResetPasswordPage);
  }

  validateData() {
    let valid = true;
    if(this.email == '' || this.email == undefined) {
      valid = false;
      this.utils.showMessage("Field 'e-mail' must be filled.", 'error');
    }else if(this.password == '' || this.password == undefined) {
      valid = false;
      this.utils.showMessage("Field 'password' must be filled.", 'error');
    }

    return valid;
  }

  setUserInfo(customer) {
    this.currentUser.id = customer.id;
    this.currentUser.phone = customer.phone_number;
    this.currentUser.address = customer.address;
    this.currentUser.postcode = customer.postcode;
    this.currentUser.allowAccess = customer.allow_access == '1' ? true : false;
    this.currentUser.showMessage = customer.show_message  == '1' ? true : false;
    this.currentUser.receiveNotifications = customer.receive_notifications == '1' ? true : false;
    if(!this.utils.isEmpty(customer.name)){
      this.currentUser.name = customer.name;
    }
    if(this.currentUser.provider == 'email'){
      this.currentUser.photo = "/assets/imgs/user.png";
    }

    this.auth.doLogin(this.currentUser);
  }

  showMessage(info_messages){
    if(info_messages.hasMessages && this.currentUser.showMessage){
      info_messages.messages.forEach(item => {
        this.utils.showMessage(item.message, 'info');
      });
    }
  }

  goToShopPage() {
    if(this.currentUser.allowAccess){
      this.navCtrl.setRoot(ShopPage, {
        'showMenu': false,
        'disableClosedShops': true,
      });
    }else{
      this.utils.clearDetailsKeepmeLogged();
      this.auth.doLogout();
      this.loader.hidePreloader();
    }
  }
}
