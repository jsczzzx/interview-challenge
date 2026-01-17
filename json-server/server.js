const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/api/v1/pay', (req, res) => {
  const {
    cardNumber,
    expiryMonth,
    expiryYear,
    securityCode,
    postalCode,
    amount
  } = req.body;

  if (
    !cardNumber ||
    !expiryMonth ||
    !expiryYear ||
    !securityCode ||
    cardNumber.length < 16
  ) {
    return res.status(400).json({
      success: false,
      errorType: 'VALIDATION_ERROR',
      message: 'Invalid or missing payment information.'
    });
  }

  const isSuccess = Math.random() > 0.5;

  if (isSuccess) {
    return res.status(200).json({
      success: true,
      transactionId: 'txn_' + Date.now(),
      amount,
      message: 'Payment successful.'
    });
  }

  return res.status(400).json({
    success: false,
    errorType: 'PAYMENT_FAILED',
    message: 'Payment failed due to simulated processor error.'
  });
});

server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server running on port ${PORT}`);
  console.log(`Payment Endpoint: POST http://localhost:${PORT}/api/v1/pay`);
});
