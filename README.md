# Secure Payment Element (Angular + iframe)

This project demonstrates a secure payment element architecture using **Angular inside an iframe**, a **mock backend (json-server)**, and **design-token based theming via postMessage**.

The goal is to simulate how modern payment systems (e.g. Stripe Elements, Adyen Drop-in) isolate sensitive card data while still allowing host applications to control styling and handle payment flow.

This is intentionally not built as a traditional Angular SPA. The payment UI is treated as an isolated, embeddable component.

---

## Project Structure

```
.
├── json-server/          # Mock backend (tokenize + pay)
├── payment-element/      # Angular app (iframe content)
├── pe-default.html       # Host demo page (default theme)
├── pe-dark.html          # Host demo page (dark theme)
└── README.md
```

---

## Architecture Overview

The project is split into three clearly separated parts:

### 1. payment-element (Angular – iframe content)

Responsibilities:
- Render payment form UI
- Handle input formatting (card number, expiry, CVC, postal code)
- Validate user input
- Normalize card data
- Call `/api/v1/tokenize`
- Send token to host via `window.parent.postMessage`

Key points:
- The Angular app never handles payment processing directly
- It only produces a token
- It has no knowledge of order amount or business logic

This mirrors how real payment elements work: collect + tokenize only.

---

### 2. Host pages (pe-default.html / pe-dark.html)

Responsibilities:
- Load the payment element via iframe
- Send theme tokens to iframe via `postMessage`
- Receive payment token from iframe
- Call `/api/v1/pay`
- Display payment result

The host page never sees raw card data. It only deals with tokens.

This separation is intentional and is the core security model.

---

### 3. json-server (mock backend)

Endpoints:
- `POST /api/v1/tokenize`  
  Simulates token generation from card data

- `POST /api/v1/pay`  
  Simulates payment processing using token

This backend is only for demo purposes. No real payment logic exists.

---

## Data Flow

```
User types card data
        ↓
[ Angular payment-element (iframe) ]
        ↓  POST /api/v1/tokenize
[ json-server ]
        ↓  returns token
[ Angular iframe ]
        ↓  postMessage(token)
[ Host page ]
        ↓  POST /api/v1/pay
[ json-server ]
```

At no point does raw card data leave the iframe context.

---

## Theming Model

The host controls styling by sending CSS variables:

```js
paymentFrame.contentWindow.postMessage({
  type: 'setTheme',
  variables: {
    '--pe-color-bg': '#020617',
    '--pe-color-text': '#e5e7eb',
    '--pe-color-border': '#1e293b',
    '--pe-color-primary': '#38bdf8'
  }
}, '*');
```

Inside Angular, styles are defined using these tokens:

```scss
form {
  background-color: var(--pe-color-bg);
  color: var(--pe-color-text);
  border: 1px solid var(--pe-color-border);
}
```

This allows:
- Dark / light theme switching
- Brand customization
- Zero coupling between host and iframe styles

---

## How to Run

### 1. Start mock backend

```bash
cd json-server
npm install
node index.js
```

Server will run on:

```
http://localhost:3000
```

---

### 2. Start Angular payment element

```bash
cd payment-element
npm install
npm start
```

Angular app will run on:

```
http://localhost:4200
```

---

### 3. Open host pages

Open in browser:

```
pe-default.html
pe-dark.html
```

These demonstrate:
- Default theme
- Dark theme via postMessage tokens

---

## Why iframe (and not Web Components)

This is a deliberate design decision.

iframe provides:
- Full DOM isolation
- No CSS leakage
- No JS context sharing
- Strong security boundary

For payment use cases, this is closer to real-world production systems than using Shadow DOM alone.

---

## Notes

- This project focuses on architecture and data flow, not visual design
- The backend is mocked
- No real payment provider is used
- The goal is to demonstrate correct separation of concerns and security boundaries

---

## License

For demonstration and evaluation purposes only.
