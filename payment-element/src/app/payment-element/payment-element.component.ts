import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NormalizedCardData } from '../data.model';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'payment-element',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './payment-element.component.html',
  styleUrl: './payment-element.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class PaymentElementComponent {

  @Output() paymentToken = new EventEmitter<string>();


  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder, private tokenService: TokenService){}

  ngOnInit() {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(19)]],
      expirationDate: ['', [Validators.required, Validators.minLength(7), this.expirationDateValidator()]],
      securityCode: ['', [Validators.required, Validators.minLength(3)]],
      postalCode: ['', [Validators.required, Validators.minLength(5)]]
    })

    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(val => {
      if (val) {
        const digitsOnly = val.replace(/\D/g, '');

        const formatted = digitsOnly
          .match(/.{1,4}/g)
          ?.join(' ') || '';

        if (formatted !== val) {
          this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
        }
      }
    });


    this.paymentForm.get('expirationDate')?.valueChanges.subscribe(val=>{
      if (val) {
        const digitsOnly = val.replace(/\D/g, '');
        
        const formatted = digitsOnly
          .match(/.{1,2}/g)
          ?.join(' / ') || '';
        
        if (formatted !== val) {
          this.paymentForm.get('expirationDate')?.setValue(formatted, { emitEvent: false });
        }
      }
    })

    this.paymentForm.get('securityCode')?.valueChanges.subscribe(val=>{
      if (val) {
        const digitOnly = val.replace(/\D/g, '');
        if (digitOnly !== val) {
          this.paymentForm.get('securityCode')?.setValue(digitOnly, {emitEvent: false});
        }
      }      
    })

    this.paymentForm.get('postalCode')?.valueChanges.subscribe(val=>{
      if (val) {
        const digitOnly = val.replace(/\D/g, '');
        if (digitOnly !== val) {
          this.paymentForm.get('postalCode')?.setValue(digitOnly, {emitEvent: false});
        }
      }      
    })

  }


  expirationDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let val = control.value;
      if (!val || val.length !== 7) {
        return null;
      }
      let mm = val.substring(0, 2);
      let yy = val.substring(5, 7);
      if (mm < 1 || mm > 12) {
        return { invalidMonth : true };
      }
      let currentDate = new Date();
      if (yy < currentDate.getFullYear() % 2000 || (yy === currentDate.getFullYear() % 2000 && mm < currentDate.getMonth())) {
        return { expired: true };
      }
      return null;
    }
  }

  submit() {
    const cardData = this.paymentForm.value;
    const normalizedCardData: NormalizedCardData = {
      cardNumber: cardData.cardNumber.replace(/\D/g, ''),
      expiryMonth: cardData.expirationDate.substring(0,2),
      expiryYear: cardData.expirationDate.substring(5,7),
      securityCode: cardData.securityCode,
      postalCode: cardData.postalCode
    }
    this.tokenService.getToken(normalizedCardData).subscribe(res=>{
      //this.paymentToken.emit(token);
      const token = res.token;

      window.parent.postMessage(
        {
          type: 'paymentToken',
          token: token
        },
        '*'
      );
    })

  }

}
