const API_DEMO = 'https://cybqa.pesapal.com/pesapalv3/api';
const API_LIVE = 'https://pay.pesapal.com/v3/api';

function getBaseUrl() {
  return process.env.PESAPAL_ENV === 'live' ? API_LIVE : API_DEMO;
}

export async function getSessionToken() {
  const res = await fetch(`${getBaseUrl()}/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pesapal auth failed: ${err}`);
  }
  const data = await res.json();
  return data.token;
}

export async function registerIPNUrl() {
  const token = await getSessionToken();
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const res = await fetch(`${getBaseUrl()}/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      url: `${baseUrl}/api/pesapal/ipn`,
      ipn_notification_type: 'GET'
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pesapal IPN registration failed: ${err}`);
  }
  const data = await res.json();
  return data;
}

export async function submitOrder({ orderNumber, totalAmount, currency, firstName, lastName, email, phone, callbackUrl }) {
  const token = await getSessionToken();
  const ipn = await registerIPNUrl();
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const body = {
    id: orderNumber,
    currency: currency || 'USD',
    amount: totalAmount,
    description: `AstonnyFlyy Order ${orderNumber}`,
    callback_url: callbackUrl || `${baseUrl}/api/pesapal/callback?order_id=${orderNumber}`,
    notification_id: ipn.ipn_id,
    branch: 'AstonnyFlyy',
    billing_address: {
      email_address: email,
      phone_number: phone || '',
      first_name: firstName,
      last_name: lastName,
      country_code: 'UG'
    }
  };
  const res = await fetch(`${getBaseUrl()}/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pesapal submit order failed: ${err}`);
  }
  const data = await res.json();
  return data;
}

export async function getTransactionStatus(orderTrackingId) {
  const token = await getSessionToken();
  const res = await fetch(`${getBaseUrl()}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pesapal status check failed: ${err}`);
  }
  return res.json();
}
