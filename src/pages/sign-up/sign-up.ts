import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { LoginPage } from '../login/login';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpPage {
  currentUser: any;
  isPhotoSelected: boolean = false;
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public angularFireAuth: AngularFireAuth, 
    public auth : Authentication, public loadingCtrl: LoadingController, public alertCtrl: AlertController, 
    public utils: Utils, public http: HttpServiceProvider) {
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
      });
  }

  ionViewDidLoad() {
    let loading = this.navParams.get('loading');
    if(loading != null){
      loading.dismiss();
    }
  }

  confirm() {
    if(this.validateData()){
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
      
      this.currentUser.email = this.email;
      this.currentUser.password = this.password;
      this.currentUser.provider = 'email';

      let navCtrl = this.navCtrl;
      let http = this.http;
      let utils = this.utils;
      let currentUser = this.currentUser;

      //signs up the user in firebase
      this.angularFireAuth.auth.createUserWithEmailAndPassword(currentUser.email, currentUser.password)
        .then(function (credential) {
          currentUser.uid = credential.user.uid;
          currentUser.email = credential.user.email;

          //Signs up in the api
          http.findOrCreateUser(currentUser)
            .subscribe(data => {
              //Can't sign up in the api
              if(data.details_customer.error){
                loading.dismiss();
                utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
              //Signs up in the api successfully
              }else{
                let firebaseUser = firebase.auth().currentUser;
                firebaseUser.sendEmailVerification().then(
                  (success) => {
                    currentUser.id = data.details_customer.customer.id;
                    currentUser.receiveNotifications = data.details_customer.customer.receive_notifications == '1' ? true : false;
                    currentUser.photo = "/assets/imgs/user.png";
                    utils.showMessage('Please validate your email address. Kindly check your inbox.', 'info');
                    navCtrl.setRoot(LoginPage, {'loading': loading});
                  } 
                ).catch(
                  (err) => {
                    utils.showMessage(err, 'error');
                  }
                ) 
              }
            }, err => {
              loading.dismiss();
              utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
            });
      }, function (err) {
        loading.dismiss();
        utils.showMessage(err.message, 'error');
      }); 
    }
  }

  validateData() {
    let valid = true;
    if(this.email == ''){
      valid = false;
      this.utils.showMessage("Field 'email' must be filled.", 'error');
    }else if(this.password == ''){
      valid = false;
      this.utils.showMessage("Field 'password' must be filled.", 'error');
    }else if(this.confirmPassword == ''){
      valid = false;
      this.utils.showMessage("Field 'confirmPassword' must be filled.", 'error');
    }else if(this.password.length < 8){
      valid = false;
      this.utils.showMessage("Password must be at least 8 characters long.", 'error');
    }else if(this.password != this.confirmPassword) {
      valid = false;
      this.utils.showMessage("Password and Confirm Password do not match.", 'error');
    }

    return valid;
  }

}
