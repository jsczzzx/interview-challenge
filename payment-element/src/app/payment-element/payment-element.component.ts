import { Component, EventEmitter, Output, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NormalizedCardData } from '../data.model';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'payment-element',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './payment-element.component.html',
  styleUrl: './payment-element.component.scss',
})
export class PaymentElementComponent implements OnInit {

  @Output() paymentToken = new EventEmitter<string>();
  
  @Output() validationError = new EventEmitter<string>();

  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder, private tokenService: TokenService){}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(19)]],
      expirationDate: ['', [Validators.required, Validators.minLength(7), this.expirationDateValidator()]],
      securityCode: ['', [Validators.required, Validators.minLength(3)]],
      postalCode: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(val => {
      if (val) {
        const digitsOnly = val.replace(/\D/g, '');
        const formatted = digitsOnly.match(/.{1,4}/g)?.join(' ') || '';
        if (formatted !== val) {
          this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    this.paymentForm.get('expirationDate')?.valueChanges.subscribe(val => {
      if (val) {
        const digitsOnly = val.replace(/\D/g, '');
        const formatted = digitsOnly.match(/.{1,2}/g)?.join(' / ') || '';
        if (formatted !== val) {
          this.paymentForm.get('expirationDate')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    this.paymentForm.get('securityCode')?.valueChanges.subscribe(val => {
      if (val) {
        const digitOnly = val.replace(/\D/g, '');
        if (digitOnly !== val) {
          this.paymentForm.get('securityCode')?.setValue(digitOnly, { emitEvent: false });
        }
      }
    })

    this.paymentForm.get('postalCode')?.valueChanges.subscribe(val => {
      if (val) {
        const digitOnly = val.replace(/\D/g, '');
        if (digitOnly !== val) {
          this.paymentForm.get('postalCode')?.setValue(digitOnly, { emitEvent: false });
        }
      }
    })


  }

  expirationDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let val = control.value;
      if (!val || val.length !== 7) return null;
      let mm = parseInt(val.substring(0, 2));
      let yy = parseInt(val.substring(5, 7));
      if (mm < 1 || mm > 12) return { invalidMonth : true };
      
      let currentDate = new Date();
      let currentYear = currentDate.getFullYear() % 100;
      let currentMonth = currentDate.getMonth() + 1;

      if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        return { expired: true };
      }
      return null;
    }
  }

  submit() {
    if (this.paymentForm.invalid) return;

    const cardData = this.paymentForm.value;
    const normalizedCardData: NormalizedCardData = {
      cardNumber: cardData.cardNumber.replace(/\D/g, ''),
      expiryMonth: cardData.expirationDate.substring(0, 2),
      expiryYear: cardData.expirationDate.substring(5, 7),
      securityCode: cardData.securityCode,
      postalCode: cardData.postalCode
    };

    this.tokenService.getToken(normalizedCardData).subscribe({
      next: (res) => {
        this.paymentToken.emit(res.token);
      },
      error: (err) => {
        this.validationError.emit(err.error?.message || 'Tokenization failed');
      }
    });
  }
}