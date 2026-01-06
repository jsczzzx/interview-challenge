import { bootstrapApplication, createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { createCustomElement } from '@angular/elements';
import { PaymentElementComponent } from './app/payment-element/payment-element.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

createApplication(appConfig)
  .then((app) => {
    const paymentComponent = createCustomElement(PaymentElementComponent, {
      injector: app.injector
    });
    customElements.define('payment-element', paymentComponent);
  })
  .catch((err) => console.error(err));