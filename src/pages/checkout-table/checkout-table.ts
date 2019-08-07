import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { Authentication } from '../../providers/auth/auth';
import { Utils } from '../../utils/utils';
import { PaymentPage } from '../payment/payment';

@IonicPage()
@Component({
  selector: 'page-checkout-table',
  templateUrl: 'checkout-table.html',
})
export class CheckoutTablePage {
  currentUser: any;
  currentShop: any;
  tableNumber: number;
  name: string;
  phone: string;
  amount: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpServiceProvider,
    public auth: Authentication, public loadingCtrl: LoadingController, public alertCtrl: AlertController,
    public utils: Utils) {
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
    let loading = this.navParams.get('loading');
    if(loading != null){
      loading.dismiss();
    }

    this.amount = this.navParams.get("amount");
  }

  confirm() {
    if(this.isCustomerDetailsDifferent()){
      this.showYesNoDialog();
    }else{
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
      this.confirmTable(loading);
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
          let loading = this.loadingCtrl.create({
            content: 'Please wait...'
          });
          loading.present();
          this.confirmTable(loading);
        }
      }, {
        text: 'Yes, please',
        cssClass: 'primary-color',
        handler: () => {
          let loading = this.loadingCtrl.create({
            content: 'Please wait...'
          });
          loading.present();
          this.saveDetails(loading);
        }
      }],
      cssClass: 'primary-color'
    });
    alert.present();
  }

  saveDetails(loading){
    this.currentUser.name = this.name;
    this.currentUser.phone = this.phone;
    //Updates user in the api
    this.http.updateUser(this.currentUser)
      .subscribe(data => {
        //Error update user in the app
        if(data.error){
          loading.dismiss();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.confirmTable(loading);
        }
      }
      , err => {
        //Error update password in firebase
        loading.dismiss();
        this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
      });
  }

  confirmTable(loading) {
    this.http.confirmCheckout(this.currentUser.id, this.currentShop.shopId, "deliver_table", null, this.name, 
      this.phone, "", "", this.tableNumber)
      .subscribe(data => {
        if(data.error){
          loading.dismiss();
          this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
        }else{
          this.navCtrl.push(PaymentPage, {
            'userId': this.currentUser.id,
            'amount': this.amount,
            'loading': loading
          });
        }
      }, err => {
        loading.dismiss();
        this.utils.showMessage('It was no possible complete your request. Please try again later...', 'error');
      });
  }

}
