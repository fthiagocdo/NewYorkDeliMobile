import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AES256 } from '@ionic-native/aes-256';
import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { Authentication } from '../../providers/auth/auth';
import { SagepayProvider } from '../../providers/sagepay/sagepay';
import { Utils } from '../../utils/utils';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { MenuPage } from '../menu/menu';

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
  private currentUser: any;
  private currentShop: any;
  private amount: string = "";
  private yearValues: string = "";
  private countries: any;
  private country: string;
  private firstName: string;
  private lastName: string;
  private cardNumber: string;
  private expiryDate: string;
  private securityCode: string;
  private address: string;
  private city: string;
  private postcode: string;
  private saveDetails: boolean = true;
  private generateSecureKeyAlias: string = 'kT6c9a7LYM';
  private generateSecureIVAlias: string = '2lBeeT0wEr';
  private secureKeyAlias: string = 'f1nivAsBD3';
  private secureIVAlias: string = 'pvKwfyEzVO';
  private customerIdAlias: string = '7NlV4lYWXq';
  private countryAlias: string = '5e8F1mYymI';
  private firstNameAlias: string = '3BkG1HdA2V';
  private lastNameAlias: string = 'ntsdGyuzzc';
  private cardNumberAlias: string = 'UTRNqdQ9cQ';
  private expiryDateAlias: string = '126yAkQWRW';
  private securityCodeAlias: string = '0fnjfr7tez';
  private addressAlias: string = 'gaxWCdYAyU';
  private cityAlias: string = '4VMdKKT80c';
  private postcodeAlias: string = 'v92BGCar4v';
  
  constructor(private navCtrl: NavController, private navParams: NavParams, private sagepay: SagepayProvider,
    private auth: Authentication, private loadingCtrl: LoadingController, private utils: Utils, 
    private http: HttpServiceProvider, private storage: Storage, private aes256: AES256, private platform: Platform) {
      this.auth.activeUser.subscribe(_user => {
        this.currentUser = _user;
      });

      this.auth.activeShop.subscribe(_shop => {
        this.currentShop = _shop;
      });
  }

  ionViewDidLoad() {
    let date = new Date().getFullYear();
    for(let i = 0; i <  10; i++){
      this.yearValues += date + i;
      if(i < 9){
        this.yearValues += ",";
      }
    }

    this.amount = this.navParams.get('amount');
    this.country = 'GB';
    
    let loading = this.navParams.get('loading');
    if(loading == null){
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
    }

    this.loadData(loading);
  }

  loadData(loading) {
    if(this.platform.is('cordova')){
      this.getDetailsPayment();
    }

    this.http.getCountries()
      .subscribe(data => {
        if(data.error){
          this.utils.showMessage(data.message, 'error');
        }else{
          this.countries = data.list;
          loading.dismiss();
        }
      });
  }

  getDetailsPayment() {
    let secureKey = null;
    let secureIV = null;
    
    this.storage.get(this.secureKeyAlias)
      .then((val) => { 
        secureKey = val; 
        
        this.storage.get(this.secureIVAlias)
          .then((val) => { 
            secureIV = val; 

            this.storage.get(this.customerIdAlias).then((val) => {
              this.aes256.decrypt(secureKey, secureIV, val)
                .then(res => {
                  if(res == this.currentUser.id){
                    this.storage.get(this.firstNameAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.firstName = res;
                        });
                    });
                    this.storage.get(this.lastNameAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.lastName = res;
                        });
                    });
                    this.storage.get(this.cardNumberAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.cardNumber = res;
                        });
                    });
                    this.storage.get(this.expiryDateAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.expiryDate = res;
                        });
                    });
                    this.storage.get(this.securityCodeAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.securityCode = res;
                        });
                    });
                    this.storage.get(this.addressAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.address = res;
                        });
                    });
                    this.storage.get(this.cityAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.city = res;
                        });
                    });
                    this.storage.get(this.countryAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.country = res;
                        });
                    });
                    this.storage.get(this.postcodeAlias).then((val) => {
                      this.aes256.decrypt(secureKey, secureIV, val)
                        .then(res => {
                          this.postcode = res;
                        });
                    });
                  }
                });
            });
        });
      });
  }

  setDetailsPayment() {
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
            
            this.aes256.encrypt(secureKey, secureIV, this.currentUser.id)
              .then(res => {
                this.storage.set(this.customerIdAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.firstName)
              .then(res => {
                this.storage.set(this.firstNameAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.lastName)
              .then(res => {
                this.storage.set(this.lastNameAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.cardNumber)
              .then(res => {
                this.storage.set(this.cardNumberAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.expiryDate)
              .then(res => {
                this.storage.set(this.expiryDateAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.securityCode)
              .then(res => {
                this.storage.set(this.securityCodeAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.address)
              .then(res => {
                this.storage.set(this.addressAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.city)
              .then(res => {
                this.storage.set(this.cityAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.country)
              .then(res => {
                this.storage.set(this.countryAlias, res);
            });
            this.aes256.encrypt(secureKey, secureIV, this.postcode)
              .then(res => {
                this.storage.set(this.postcodeAlias, res);
            });
          })
      });
  }

  clearDetailsPayment() {
    this.storage.remove(this.customerIdAlias);
    this.storage.remove(this.firstNameAlias);
    this.storage.remove(this.lastNameAlias);
    this.storage.remove(this.cardNumberAlias);
    this.storage.remove(this.expiryDateAlias);
    this.storage.remove(this.securityCodeAlias);
    this.storage.remove(this.addressAlias);
    this.storage.remove(this.cityAlias);
    this.storage.remove(this.countryAlias);
    this.storage.remove(this.postcodeAlias);
  }

  confirmPayment(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    if(this.platform.is('cordova')){
      if(this.saveDetails){
        this.setDetailsPayment();
      }else{
        this.clearDetailsPayment();
      }
    }

    this.sagepay.generateMSK()
      .subscribe(data => {
        if(this.utils.isEmpty(data['merchantSessionKey'])){
          loading.dismiss();
          this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
        }else{
          let merchantSessionKey = data['merchantSessionKey'];
          let cardHolderName = this.formatCardHolderName();
          let expiryDate = this.formatExpiryDate();
          this.sagepay.generateCI(merchantSessionKey, cardHolderName, this.cardNumber, expiryDate, this.securityCode)
            .subscribe(data => {
              if(this.utils.isEmpty(data['cardIdentifier'])){
                loading.dismiss();
                this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
              }else{
                let cardIdentifier = data['cardIdentifier'];
                let amount = this.formatAmount();
                this.sagepay.transactions(merchantSessionKey, cardIdentifier, amount, this.firstName, this.lastName, 
                  this.address, this.city, this.postcode, this.country, this.currentUser.email, this.currentUser.phone)
                  .subscribe(data => {
                    if(this.utils.isEmpty(data['transactionId'])){
                      loading.dismiss();
                      this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
                    }else{
                      /*this.http.paymentConfirmation(this.currentUser.id, this.currentShop.shopId, this.currentUser.email, data['transactionId'], data['retrievalReference'])
                        .subscribe(data => {
                          if(data.error){
                            loading.dismiss();
                            this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
                          }else{
                            this.navCtrl.setRoot(MenuPage, {
                              'message': data.message,
                              'loading': loading
                            }); 
                          }
                        }, err => {
                          loading.dismiss();
                          this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
                        });*/
                    }
                  }, err => {
                    loading.dismiss();
                    this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
                  });
              }
            }, err => {
              loading.dismiss();
              this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
            });
        }
      }, err => {
        loading.dismiss();
        this.utils.showMessage('It was no possible complete your request. Please, verify your card details or try again later...', 'error');
      });
  }

  formatCardHolderName(){
    return this.firstName + " " + this.lastName;
  }

  formatExpiryDate(){
    return this.expiryDate.substr(5, 2) + this.expiryDate.substr(2, 2);
  }

  formatAmount(){
    let parts = this.amount.toString().split(".");
    if(parts.length == 1){
      return parseInt(parts[0])*100;
    }else{
      return parseInt(parts[0])*100+parseInt(parts[1]);
    }
  }
}
