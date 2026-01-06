import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { Injector } from '@angular/core';
import { PaymentElementComponent } from './app/payment-element/payment-element.component';
import { provideHttpClient } from '@angular/common/http';
import { TokenService } from './app/services/token.service';

(async () => {
  const app = await createApplication({
    providers: [
      provideReactiveForm(), 
      provideHttpClient(),
      TokenService,
    ]
  });

  const injector = app.injector;

  const el = createCustomElement(PaymentElementComponent, { injector });
  customElements.define('payment-element', el);
})();
function provideReactiveForm(): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error('Function not implemented.');
}

