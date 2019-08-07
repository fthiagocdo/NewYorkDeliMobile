import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuItemPage } from './menu-item';

@NgModule({
  declarations: [
    MenuItemPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuItemPage),
  ],
})
export class MenuItemPageModule {}
