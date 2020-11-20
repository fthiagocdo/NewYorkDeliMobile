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
  keepLogged: boolean = false;
  
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

      this.keepMeLogged();
  }

  ionViewDidLoad() { }

  async keepMeLogged() {
    this.loader.displayPreloader();

    await this.storage.get('UID').then((val) => {
      if(!this.utils.isEmpty(val)){
        this.currentUser.uid = val;
      }
    });

    await this.storage.get('EMAIL').then((val) => {
      if(!this.utils.isEmpty(val)){
        this.currentUser.email = val;
      }
    });

    await this.storage.get('PROVIDER').then((val) => {
      if(!this.utils.isEmpty(val)){
        this.currentUser.provider = val;
      }
    });

    await this.validateUser();

    this.loader.hidePreloader();
  }

  async validateUser() {
    //Retrieves the user in the api
    this.http.findOrCreateUser(this.currentUser)
      .subscribe(data => {
        //Found user
        if(!data.details_customer.error){
          if(data.details_customer.customer.allow_access == '1'){
            this.utils.setUserInfo(data.details_customer.customer);
            this.utils.showMessageLogin(data.info_messages);
            this.goToShopPage();
          }
        }
    });
  }

  resendEmailVerification() {
    let alert = this.alertCtrl.create({
      title: 'Email not verified. Resend email verification?',
      buttons: [{
        text: 'Yes',
        cssClass: 'primary-color',
        handler: () => {
          firebase.auth().currentUser.sendEmailVerification()
            .then(success => {
              this.utils.showMessage('Please validate your email address. Kindly check your inbox.', 'info');
              this.loader.hidePreloader();
            }, err => {
              console.log(err);
              this.utils.showMessage(err.message, 'error');
              this.loader.hidePreloader();
            });  
        }
      }, {
        text: 'No',
        cssClass: 'primary-color',
        handler: () => {
          this.auth.doLogout();
          this.loader.hidePreloader();
        }
      }],
      cssClass: 'ftc-info-color'
    });
    alert.present();
  }

  loginMail() {
    if(this.validateData()){
      this.loader.displayPreloader();
      let _class = this;

      this.angularFireAuth.auth.signInWithEmailAndPassword(this.email, this.password)
        .then(function (credential) {
          if(credential.user.emailVerified) {
            _class.currentUser.uid = credential.user.uid;
            _class.currentUser.email = credential.user.email;
            _class.currentUser.provider = 'email';

            //Retrieves the user in the api
            _class.http.findOrCreateUser(_class.currentUser)
              .subscribe(data => {
                //Can't find the user
                if(data.details_customer.error){
                  _class.auth.doLogout();
                  _class.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                  _class.loader.hidePreloader();
                //Found the user
                }else{
                  _class.utils.showMessageLogin(data.info_messages);
                  _class.setUserInfo(data.details_customer.customer);
                  _class.goToShopPage();
                }
            }, err => {
              _class.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
              _class.loader.hidePreloader();
            });
          } else {
            _class.resendEmailVerification();
          }
        }, function (err) {
          _class.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
          _class.loader.hidePreloader();
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
    this.loader.displayPreloader();

    const provider = new firebase.auth.GoogleAuthProvider();
    this.angularFireAuth.auth.signInWithPopup(provider)
      .then(function (credential) {
        this.currentUser.uid = credential.user.uid;
        this.currentUser.email = credential.user.email;
        this.currentUser.name = credential.user.displayName;
        this.currentUser.photo = credential.user.photoURL;
        this.currentUser.provider = 'google';

        //Retrieves the user in the api
        this.http.findOrCreateUser(this.currentUser)
          .subscribe(data => {
            //Can't find the user
            if(data.details_customer.error){
              this.uth.doLogout();
              this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
              this.loader.hidePreloader();
            //Found the user
            }else{
              if(data.details_customer.customer.allow_access == '1'){
                this.showYesNoDialog();
              }
              this.setUserInfo(data.details_customer.customer);
              this.showMessage(data.info_messages);
              this.goToShopPage();
            }
        }, err => {
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
          this.loader.hidePreloader();
        });
    }, function (err) {
      this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
      this.loader.hidePreloader();
    })
    .catch( err => { 
      this.utils.showMessage(err.message, 'error');
      this.loader.hidePreloader();
    });
  }

  nativeGoogleLogin() {
    this.loader.displayPreloader();
     
    this.googleplus.login({
      'webClientId': '97143556372-23j7cjinroqofsqboa8fs9i5qlqkqb14.apps.googleusercontent.com'
    })
      .then( res => {
        const googleCredential = firebase.auth.GoogleAuthProvider.credential(res.idToken);
        firebase.auth().signInWithCredential(googleCredential)
          .then( user => {
            this.currentUser.uid = user.uid;
            this.currentUser.email = user.email;
            this.currentUser.name = user.displayName;
            this.currentUser.photo = user.photoURL;
            this.currentUser.provider = 'google';
            
            //Retrieves the user in the api
            this.http.findOrCreateUser(this.currentUser)
              .subscribe(data => {
                //Can't find the user
                if(data.details_customer.error){
                  this.auth.doLogout();
                  this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                  this.loader.hidePreloader();
                //Found the user
                }else{
                  if(data.details_customer.customer.allow_access == '1'){
                    this.setUserInfo(data.details_customer.customer);
                    this.utils.showMessage(data.info_messages);
                    this.goToShopPage();
                  }
                }
            }, err => {
              this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
              this.loader.hidePreloader();
            });
      })
      .catch( error => { 
        this.utils.showMessage(error, 'error');
        this.loader.hidePreloader();
      });
    })
    .catch( err => { 
      this.utils.showMessage(err.message, 'error');
      this.loader.hidePreloader();
    });
  }

  loginFacebook() {
    this.loader.displayPreloader();

    this.facebook.login(['email'])
      .then( res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(res.authResponse.accessToken);
        firebase.auth().signInWithCredential(facebookCredential)
          .then( user => { 
            this.currentUser.uid = user.uid;
            this.currentUser.email = user.email;
            this.currentUser.name = user.displayName;
            this.currentUser.photo = user.photoURL+'?height=256&width=256';
            this.currentUser.provider = 'facebook'; 

            //Retrieves the user in the api
            this.http.findOrCreateUser(this.currentUser)
              .subscribe(data => {
                //Can't find the user
                if(data.details_customer.error){
                  this.auth.doLogout();
                  this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
                  this.loader.hidePreloader();
                //Found the user
                }else{
                  if(data.details_customer.customer.allow_access == '1'){
                    this.setUserInfo(data.details_customer.customer);
                    this.utils.showMessage(data.info_messages);
                    this.goToShopPage();
                  }
                }
            }, err => {
              this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
              this.loader.hidePreloader();
            });
          })
          .catch( error => { 
            this.utils.showMessage(error, 'error');
            this.loader.hidePreloader();
          });
      })
      .catch( err => { 
        this.utils.showMessage(err.message, 'error');
        this.loader.hidePreloader();
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

  setUserInfo(data) {
    this.utils.setUserInfo(data);

    if(this.keepLogged) {
      this.utils.setKeepMeLogged();
    } else {
      this.utils.clearKeepMeLogged();
    }
  }

  goToShopPage() {
    if(this.currentUser.allowAccess){
      this.auth.doLogin(this.currentUser);
      this.navCtrl.setRoot(ShopPage, {
        'showMenu': false,
        'disableClosedShops': true,
      });
    }else{
      this.utils.clearKeepMeLogged();
      this.auth.doLogout();
      this.loader.hidePreloader();
    }
  }
}
