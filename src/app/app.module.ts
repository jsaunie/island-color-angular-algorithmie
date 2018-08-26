import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {RulesComponent} from './rules/rules.component';
import {CanvasComponent} from './canvas/canvas.component';
import {FormsModule} from '@angular/forms';

const appRoutes: Routes = [
  {path: 'rules', component: RulesComponent},
  {path: 'test', component: CanvasComponent},
  {path: '', redirectTo: '/rules', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    RulesComponent,
    CanvasComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
