import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Utils } from '../../utils/utils';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Authentication } from '../../providers/auth/auth';
import { CheckoutPage } from '../checkout/checkout';
import { PreloaderProvider } from '../../providers/preloader/preloader';

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

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public utils: Utils,
    public auth: Authentication, 
    public http: HttpServiceProvider,
    public loader: PreloaderProvider) {
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
    this.loader.hidePreloader();
    this.randomNumber = this.utils.getRandomInt(6)+1;
  }

  sendMessage() {
    this.loader.displayPreloader();

    this.http.sendMessage(this.name, this.email, this.message)
      .subscribe(data => {
        this.loader.hidePreloader();
        if(data.error){
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.name = this.currentUser.name;
          this.email = this.currentUser.email;
          this.message = '';
          this.utils.showMessage('Thank you for sending us a message. We will reply it soon.', 'info');
        }
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      });
  }

  goToCheckoutPage() {
    this.loader.displayPreloader();
    this.navCtrl.setRoot(CheckoutPage);
  }
}
