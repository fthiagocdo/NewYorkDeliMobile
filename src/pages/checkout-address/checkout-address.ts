import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { PaymentIframePage } from '../payment-iframe/payment-iframe';
import { PreloaderProvider } from '../../providers/preloader/preloader';

@IonicPage()
@Component({
  selector: 'page-checkout-address',
  templateUrl: 'checkout-address.html',
})
export class CheckoutAddressPage {
  currentUser: any;
  currentShop: any;
  name: string;
  phone: string;
  postcode: string;
  address: string;
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
        if(!utils.isEmpty(_user.name)){
          this.name = _user.name;
        }
        if(!utils.isEmpty(_user.phone)){
          this.phone = _user.phone;
        }
        if(!utils.isEmpty(_user.postcode)){
          this.postcode = _user.postcode;
        }
        if(!utils.isEmpty(_user.address)){
          this.address = _user.address;
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
      this.confirmAddress();
    }
  }

  isCustomerDetailsDifferent() {
    let changed = false;
    if(this.currentUser.name != this.name){
      changed = true;
    }else if(this.currentUser.phone != this.phone){
      changed = true;
    }else if(this.currentUser.postcode != this.postcode){
      changed = true;
    }else if(this.currentUser.address != this.address){
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
          this.confirmAddress();
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
    this.currentUser.postcode = this.postcode;
    this.currentUser.address = this.address;
    //Updates user in the api
    this.http.updateUser(this.currentUser)
      .subscribe(data => {
        //Error update user in the app
        if(data.error){
          this.loader.hidePreloader();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.confirmAddress();
        }
      }
      , err => {
        //Error update password in firebase
        this.loader.hidePreloader();
        this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
      });
  }

  confirmAddress() {
    this.http.confirmCheckout(this.currentUser.id, this.currentShop.shopId, "deliver_address", this.time, this.name,
    this.phone, this.postcode, this.address, "")
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
