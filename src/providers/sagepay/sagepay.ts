import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Utils } from '../../utils/utils';
import { Authentication } from '../auth/auth';

@Injectable()
export class SagepayProvider {
  currentShop: any;
  /*Test Sage Pay Aylesbury 
  vendorNameAylesbury: string = "newyorkdeliayle";
  integrationKeyAylesbury: string = "DHOkf07razYvhqdU61Mel76fzZt1KUrEsyPhZuPy280KCDOzCv";
  integrationPasswordAylesbury: string = "nYPgCLEFYfAlM21b4AH9kzyq86wuFSffyo6OBzfBMK6zT6urpViSdmAD0NCpgQGzT";*/
  /*Test Sage Pay Maidenhead
  vendorNameMaidenhead: string = "newyorkdelimaid";
  integrationKeyMaidenhead: string = "pr78smjLFPgKvxekkYNG97pIZ2axCkDMwS5WNbyW4sFi4489wc";
  integrationPasswordMaidenhead: string = "FbN86044C9jXCUlCQVAxu94ydEcZKI2k1RrN3E55bgzurMWnFyJ4HqphvF0TQEGio";*/
  /*Live Sage Pay Maidenhead
  vendorNameMaidenhead: string = "newyorkdelimaid";
  integrationKeyMaidenhead: string = "OdLhqz2InK2vDRa7uvtEetpouHyoRcG1yl36RFq0jap3hZYy0H";
  integrationPasswordMaidenhead: string = "8BeuvGZ5tusNq960KVV3EYWhMPNpWJpsHrNVPpWyBT2zjRzPuikZPhF6reCmbRZUE";*/
  constructor(public http: Http, public utils: Utils, public auth: Authentication) {
    //this.url = 'https://live.sagepay.com/api/v1/';
    //this.url = 'https://pi-test.sagepay.com/api/v1/';
    this.auth.activeShop.subscribe(_shop => {
      this.currentShop = _shop;
    });
  }

  generateMSK() {
    const requestOptions = this.createAuthHeader();
    
    return this.http.post(this.currentShop.shopUrl+'merchant-session-keys/', {
      "vendorName": this.currentShop.shopVendorName
    }, requestOptions)
      .map(res => {
        return res.json()
      });
  }

  generateCI(merchantSessionKey, cardholderName, cardNumber, expiryDate, securityCode) {
    const requestOptions = this.createMSKHeader(merchantSessionKey);

    return this.http.post(this.currentShop.shopUrl+'card-identifiers/', {
      "cardDetails": {
        "cardholderName": cardholderName,
        "cardNumber": cardNumber,
        "expiryDate": expiryDate,
        "securityCode": securityCode
      }
    }, requestOptions)
      .map(res => {
        return res.json()
      });
  }

  transactions(merchantSessionKey, cardIdentifier, amount, firstName, lastName, address, city, postalcode, country, email, telephone) {
    let utils = this.utils;

    const requestOptions = this.createAuthHeader();

    return this.http.post(this.currentShop.shopUrl+'transactions/', {
      "paymentMethod": {
        "card": {
         "merchantSessionKey":merchantSessionKey,
         "cardIdentifier": cardIdentifier
        }
       },
       "transactionType":"Payment",
       "vendorTxCode":"newyorkdeli"+utils.getRandomInt(9999999999),
       "amount":amount,
       "currency":"GBP",
       "customerFirstName":firstName,
       "customerLastName":lastName,
       "billingAddress":{
           "address1":address,
           "city":city,
           "postalCode":postalcode,
           "country":country
       },
       "entryMethod":"Ecommerce",
       "apply3DSecure":"Disable",
       "applyAvsCvcCheck":"Disable",
       "description":"New York Deli App Payment",
       "customerEmail":email,
       "customerPhone":telephone,
       "shippingDetails":{
           "recipientFirstName":firstName,
           "recipientLastName":lastName,
           "shippingAddress1":address,
           "shippingCity":city,
           "shippingPostalCode":postalcode,
           "shippingCountry":country
       }
    }, requestOptions)
      .map(res => {
        return res.json()
      });
  }

  createAuthHeader(){
    let token = btoa(this.currentShop.shopIntegrationKey+':'+this.currentShop.shopIntegrationPassword);
    let headers: Headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Basic '+token);
    return new RequestOptions({ headers: headers });
  }

  createMSKHeader(merchantSessionKey){
    let headers: Headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer '+merchantSessionKey);
    return new RequestOptions({ headers: headers });
  }

}
