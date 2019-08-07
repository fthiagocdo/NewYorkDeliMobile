import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Utils } from '../../utils/utils';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Authentication } from '../../providers/auth/auth';
import { CheckoutPage } from '../checkout/checkout';

@IonicPage()
@Component({
  selector: 'page-contact-us',
  templateUrl: 'contact-us.html',
})
export class ContactUsPage {
  currentUser: any;
  currentShop: any;
  randomNumber: number;
  name: string;
  email: string;
  message: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils,
    public auth: Authentication, public http: HttpServiceProvider, public loadingCtrl: LoadingController) {
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
      });

      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
      });

      this.name = this.currentUser.name;
      this.email = this.currentUser.email;
  }

  ionViewDidLoad() {
    this.randomNumber = this.utils.getRandomInt(6)+1;
    
    let loading = this.navParams.get('loading');
    if(loading != null){
      loading.dismiss();
    }
  }

  sendMessage() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.http.sendMessage(this.name, this.email, this.message)
      .subscribe(data => {
        loading.dismiss();
        if(data.error){
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.name = this.currentUser.name;
          this.email = this.currentUser.email;
          this.message = '';
          this.utils.showMessage('Thank you for sending us a message. We will reply it soon.', 'info');
        }
      }, err => {
        loading.dismiss();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      });
  }

  goToCheckoutPage() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.navCtrl.setRoot(CheckoutPage, {
      'loading': loading,
    });
  }
}
