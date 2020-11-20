import { AlertController } from "ionic-angular";
import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';
import { Authentication } from "../providers/auth/auth";

@Injectable()
export class Utils {
  currentUser: any;
  
  constructor(
    public alertCtrl: AlertController, 
    public storage: Storage,
    public auth: Authentication) { 
      this.auth.activeUser.subscribe((_user)=>{
        this.currentUser = _user;
      });
  }

  showMessage(message, messageType?) {
    if(message != null){
      if(messageType == 'error'){
        let alert = this.alertCtrl.create(  {
          title: 'Error:',
          message: message,
          buttons: [{
            text: 'Ok',
            cssClass: 'error-color'
          }],
          cssClass: 'error-color'
        });
        alert.present();
      }else{
        let alert = this.alertCtrl.create({
          title: 'Message:',
          message: message,
          buttons: [{
            text: 'Ok',
            cssClass: 'primary-color'
          }],
          cssClass: 'primary-color'
        });
        alert.present();
      }
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  isEmpty(value){
    if(value == null || value == 'null' || value == '' || value == ""){
      return true;
    }else{
      return false;
    }
  }

  setUserInfo(data) {
    this.currentUser.id = data.id;
    this.currentUser.phone = data.phone_number;
    this.currentUser.address = data.address;
    this.currentUser.postcode = data.postcode;
    this.currentUser.allowAccess = data.allow_access == '1' ? true : false;
    this.currentUser.showMessage = data.show_message  == '1' ? true : false;
    this.currentUser.receiveNotifications = data.receive_notifications == '1' ? true : false;
    if(!this.isEmpty(data.name)){
      this.currentUser.name = data.name;
    }
    if(this.currentUser.provider == 'email'){
      this.currentUser.photo = "/assets/imgs/user.png";
    }
  }

  setKeepMeLogged() {
    this.storage.set('UID', this.currentUser.uid);
    this.storage.set('EMAIL', this.currentUser.email);
    this.storage.set('PROVIDER', this.currentUser.provider);
  }

  clearKeepMeLogged() {
    this.storage.remove('UID');
    this.storage.remove('EMAIL');
    this.storage.remove('PROVIDER');
  }

  showMessageLogin(messages){
    if(messages.hasMessages && this.currentUser.showMessage){
      messages.messages.forEach(item => {
        this.showMessage(item.message, 'info');
      });
    }
  }

}