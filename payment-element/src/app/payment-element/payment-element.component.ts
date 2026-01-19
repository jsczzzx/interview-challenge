import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NormalizedCardData } from '../data.model';

@Component({
  selector: 'payment-element',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './payment-element.component.html',
  styleUrl: './payment-element.component.scss',
})
export class PaymentElementComponent implements OnInit {

  @Output() paymentData = new EventEmitter<NormalizedCardData>();
  @Output() validationError = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();

  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();

    this.paymentForm.statusChanges.subscribe(status => {
      this.statusChange.emit(status); // VALID | INVALID | PENDING
    });
  }


  @HostListener('requestSubmit')
  onRequestSubmit() {
    this.submit();
  }


  initForm() {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(19)]],
      expirationDate: [
        '',
        [Validators.required, Validators.minLength(7), this.expirationDateValidator()]
      ],
      securityCode: ['', [Validators.required, Validators.minLength(3)]],
      postalCode: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(val => {
      if (!val) return;
      const digits = val.replace(/\D/g, '');
      const formatted = digits.match(/.{1,4}/g)?.join(' ') || '';
      if (formatted !== val) {
        this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
      }
    });

    this.paymentForm.get('expirationDate')?.valueChanges.subscribe(val => {
      if (!val) return;
      const digits = val.replace(/\D/g, '');
      const formatted = digits.match(/.{1,2}/g)?.join(' / ') || '';
      if (formatted !== val) {
        this.paymentForm.get('expirationDate')?.setValue(formatted, { emitEvent: false });
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
      const val = control.value;
      if (!val || val.length !== 7) return null;

      const mm = parseInt(val.substring(0, 2), 10);
      const yy = parseInt(val.substring(5, 7), 10);

      if (mm < 1 || mm > 12) return { invalidMonth: true };

      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        return { expired: true };
      }

      return null;
    };
  }


  private submit() {
    if (this.paymentForm.invalid) {
      this.validationError.emit('Payment form is invalid');
      return;
    }

    const v = this.paymentForm.value;

    const payload: NormalizedCardData = {
      cardNumber: v.cardNumber.replace(/\D/g, ''),
      expiryMonth: v.expirationDate.substring(0, 2),
      expiryYear: v.expirationDate.substring(5, 7),
      securityCode: v.securityCode,
      postalCode: v.postalCode
    };

    this.paymentData.emit(payload);
  }
}


