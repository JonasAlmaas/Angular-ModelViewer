import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ModelViewerComponent } from './components/model-viewer/model-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    ModelViewerComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
