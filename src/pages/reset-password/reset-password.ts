import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Utils } from '../../utils/utils';
import { AngularFireAuth } from 'angularfire2/auth';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  email: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, 
    public loadingCtrl: LoadingController, public angularFireAuth: AngularFireAuth, public http: HttpServiceProvider) {
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

      let utils = this.utils;
      let navCtrl = this.navCtrl;

      //Reset password in firebase
      this.angularFireAuth.auth.sendPasswordResetEmail(this.email)
        .then(data => {
          utils.showMessage('Please verify your mailbox to find an e-mail to help you to resetting your password.', 'info');
          navCtrl.setRoot(LoginPage, 
            {
              'loading': loading,
            });
        }, err => {
            loading.dismiss();
            utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }); 
    }
  }

  validateData() {
    let valid = true;
    if(this.email == '') {
      valid = false;
      this.utils.showMessage("Field 'e-mail' must be filled.", 'error');
    }

    return valid;
  }

}
