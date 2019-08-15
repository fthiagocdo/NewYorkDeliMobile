import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Platform } from 'ionic-angular';
import { Utils } from '../../utils/utils';

@Injectable()
export class HttpServiceProvider {
  private url: string;
  
  constructor(public http: Http, public platform: Platform, public utils: Utils) { 
      //if(this.platform.is('cordova')){
        this.url = 'http://nyd-delivery.hostingerapp.com/api/';
      /*}else{
        this.url = 'http://localhost:8000/api/';
      }*/
  }

  createAuthHeader(token){
    let headers: Headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.append('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization');
        headers.append('Authorization', 'Bearer '+token);
    return new RequestOptions({ headers: headers });
  }

  findOrCreateUser(user) {
    return this.http.get(this.url+'customer/find', {
      params: {
        provider_id: user.uid,
        provider: user.provider,
        email: user.email
      }
    })
      .map(res => {
        return res.json()
      });
  }

  getUser(email) {
    return this.http.get(this.url+'user/get/'+email)
      .map(res => {
        return res.json()
      });
  }

  updateUser(user) {
    return this.http.get(this.url+'customer/update/'+user.id, {
      params: {
        name: user.name,
        phoneNumber: user.phone,
        postcode: user.postcode,
        address: user.address,
        receiveNotifications: user.receiveNotifications ? 1 : 0,
        provider: user.provider
      }
    })
      .map(res => {
        return res.json()
      });
  }

  deleteUser(user) {
    return this.http.get(this.url+'user/delete/'+user.id)
      .map(res => {
        return res.json()
      });
  }

  getMenuTypes(shopId) {
    return this.http.get(this.url+'menutype/all/'+shopId)
      .map(res => {
        return res.json()
      });
  }

  getMenuItems(menutypeId) {
    return this.http.get(this.url+'menuitem/all/'+menutypeId)
      .map(res => {
        return res.json()
      });
  }

  downloadImageMenuItem(menuType) {
    return this.url+'menuitem/image/'+menuType;
  }

  getMenuExtras(menuitemId) {
    return this.http.get(this.url+'menuextra/all/'+menuitemId)
      .map(res => {
        return res.json()
      });
  }

  getOrderHistory(userId, shopId) {
    return this.http.get(this.url+'orderhistory/all/'+userId+'/'+shopId)
      .map(res => {
        return res.json()
      });
  }

  findOrder(id) {
    return this.http.get(this.url+'orderhistory/find/'+id)
      .map(res => {
        return res.json()
      });
  }

  orderAgain(id, userId, shopId) {
    return this.http.get(this.url+'orderhistory/orderagain/'+id+'/'+userId+'/'+shopId)
      .map(res => {
        return res.json()
      });
  }

  getShoppingCart(userId, shopId) {
    return this.http.get(this.url+'checkout/get/'+userId+'/'+shopId)
      .map(res => {
        return res.json()
      });
  }

  deleteShoppingCart(userId) {
    return this.http.get(this.url+'checkout/delete/'+userId)
      .map(res => {
        return res.json()
      });
  }

  addMenuItem(userId, shopId, menuItemId, menuExtras) {
    let listMenuExtras = '';
    let count = 1;
    menuExtras.forEach(menuExtraId => {
      listMenuExtras += menuExtraId;
      count++;
      if(count <= menuExtras.length){
        listMenuExtras += ',';
      }     
    });
    return this.http.get(this.url+'checkout/additem/'+userId+'/'+shopId, {
      params: {
        menuitem_id: menuItemId,
        menuExtras: listMenuExtras
      }})
      .map(res => {
        return res.json()
      });
  }

  removeMenuItem(userId, shopId, menuItemId) {
    return this.http.get(this.url+'checkout/removeitem/'+userId+'/'+shopId+'/'+menuItemId)
      .map(res => {
        return res.json()
      });
  }

  plusMenuItem(userId, shopId, checkoutItemId) {
    return this.http.get(this.url+'checkout/plusitem/'+userId+'/'+shopId+'/'+checkoutItemId)
      .map(res => {
        return res.json()
      });
  }

  minusMenuItem(userId, shopId,checkoutItemId) {
    return this.http.get(this.url+'checkout/minusitem/'+userId+'/'+shopId+'/'+checkoutItemId)
      .map(res => {
        return res.json()
      });
  }

  plusRiderTip(userId, shopId) {
    return this.http.get(this.url+'checkout/plusridertip/'+userId+'/'+shopId)
      .map(res => {
        return res.json()
      });
  }

  minusRiderTip(userId, shopId) {
    return this.http.get(this.url+'checkout/minusridertip/'+userId+'/'+shopId)
      .map(res => {
        return res.json()
      });
  }

  setDeliverOrCollect(userId, shopId, deliverOrCollect) {
    return this.http.get(this.url+'checkout/deliverorcollect/'+userId+'/'+shopId, {
      params: {
        deliverOrCollect: deliverOrCollect
      }
    })
      .map(res => {
        return res.json()
      });
  }

  setCheckoutMessage(userId, shopId, checkoutMessage) {
    return this.http.get(this.url+'checkout/checkoutmessage/'+userId+'/'+shopId, {
      params: {
        checkoutMessage: checkoutMessage
      }
    })
      .map(res => {
        return res.json()
      });
  }

  listShops(openedShops) {
    return this.http.get(this.url+'shop/all/'+openedShops)
      .map(res => {
        return res.json()
      });
  }

  confirmCheckout(userId, shopId, deliverOrCollect, time, name, phone, postcode, address, tableNumber) {
    return this.http.get(this.url+'checkout/confirm/'+userId+'/'+shopId, {
      params: {
        deliverOrCollect: deliverOrCollect,
        time: time,
        tableNumber: tableNumber,
        name: name,
        phone: phone,
        postcode: postcode,
        address: address,
      }
    })
      .map(res => {
        return res.json()
      });
  }

  sendMessage(name, reply, message) {
    return this.http.get(this.url+'contactus/send', {
        params: {
          name: name,
          reply: reply,
          message: message
        }
      })
      .map(res => {
        return res.json()
      });
  }

  getLimitTimeOrder(shopId) {
    return this.http.get(this.url+'checkout/getLimitTimeOrder/'+shopId)
      .map(res => {
        return res.json()
      });
  }

  getCountries() {
    return this.http.get(this.url+'countries/get')
      .map(res => {
        return res.json()
      });
  }

  paymentConfirmation(userId, shopId, email, transactionId, retrievalReference) {
    return this.http.get(this.url+'checkout/paymentConfirmation/'+userId+'/'+shopId, {
        params: {
          email: email,
          transactionId: transactionId,
          retrievalReference: retrievalReference
        }
      })
      .map(res => {
        return res.json()
      });
  }
}
