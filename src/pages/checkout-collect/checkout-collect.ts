import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Authentication } from '../../providers/auth/auth';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Utils } from '../../utils/utils';
import { PaymentIframePage } from '../payment-iframe/payment-iframe';
import { PreloaderProvider } from '../../providers/preloader/preloader';

@IonicPage()
@Component({
  selector: 'page-checkout-collect',
  templateUrl: 'checkout-collect.html',
})
export class CheckoutCollectPage {
  currentUser: any;
  currentShop: any;
  name: string;
  phone: string;
  hourValues: string = "";
  minuteValues: string = "";
  time: string;
  amount: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: HttpServiceProvider,
    public auth: Authentication, 
    public alertCtrl: AlertController,
    public utils: Utils,
    public loader: PreloaderProvider) { 
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
        if(_user.phone != 'null'){
          this.phone = _user.phone;
        }
        if(_user.name != 'null'){
          this.name = _user.name;
        }
      });

      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
      });
    }

  ionViewDidLoad() {
    this.loader.displayPreloader();

    this.amount = this.navParams.get("amount");

    this.http.getLimitTimeOrder(this.currentShop.shopId)
      .subscribe(data => {
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          data.hourValues.forEach(hour => {
            this.hourValues += hour + ','
          });

          data.minuteValues.forEach(minute => {
            this.minuteValues += minute + ','
          });
        }
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      });
  }

  confirm() {
    if(this.isCustomerDetailsDifferent()){
      this.showYesNoDialog();
    }else{
      this.loader.displayPreloader();
      this.confirmCollect();
    }
  }

  isCustomerDetailsDifferent() {
    let changed = false;
    if(this.currentUser.name != this.name){
      changed = true;
    }else if(this.currentUser.phone != this.phone){
      changed = true;
    }

    return changed;
  }

  showYesNoDialog() {
    let alert = this.alertCtrl.create({
      title: 'Save your details for next time?',
      buttons: [{
        text: 'No, thank you',
        cssClass: 'primary-color',
        handler: () => {
          this.loader.displayPreloader();
          this.confirmCollect();
        }
      }, {
        text: 'Yes, please',
        cssClass: 'primary-color',
        handler: () => {
          this.loader.displayPreloader();
          this.saveDetails();
        }
      }],
      cssClass: 'primary-color'
    });
    alert.present();
  }

  saveDetails(){
    this.currentUser.name = this.name;
    this.currentUser.phone = this.phone;
    //Updates user in the api
    this.http.updateUser(this.currentUser)
      .subscribe(data => {
        //Error update user in the app
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.confirmCollect();
        }
      }
      , err => {
        //Error update password in firebase
        this.loader.hidePreloader();
        this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
      });
  }

  confirmCollect() {
    this.http.confirmCheckout(this.currentUser.id, this.currentShop.shopId, "collect", this.time, this.name,
      this.phone, null, null, null)
      .subscribe(data => {
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.navCtrl.push(PaymentIframePage, {
            'userId': this.currentUser.id,
            'amount': this.amount,
          });
        }
      }, err => {
        this.loader.hidePreloader();
        this.utils.showMessage('It was not possible complete the request. Please try again later...', 'error');
      });
  }

}
