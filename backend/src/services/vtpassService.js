import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.VTPASS_BASE_URL || 'https://sandbox.vtpass.com/api';

const headers = {
  'api-key': process.env.VTPASS_API_KEY,
  'public-key': process.env.VTPASS_PUBLIC_KEY,
  'Content-Type': 'application/json',
};

// POST requests (purchases) need secret-key instead of public-key
const postHeaders = {
  'api-key': process.env.VTPASS_API_KEY,
  'secret-key': process.env.VTPASS_SECRET_KEY,
  'Content-Type': 'application/json',
};

function generateRequestId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `${ts}${rand}`;
}

// Map our internal provider names to VTpass serviceIDs
const AIRTIME_SERVICE_MAP = {
  MTN: 'mtn',
  Airtel: 'airtel',
  Glo: 'glo',
  '9mobile': 'etisalat',
  Etisalat: 'etisalat',
};

const DATA_SERVICE_MAP = {
  MTN: 'mtn-data',
  Airtel: 'airtel-data',
  Glo: 'glo-data',
  '9mobile': 'etisalat-data',
  Etisalat: 'etisalat-data',
};

const ELECTRICITY_SERVICE_MAP = {
  EKEDC: 'eko-electric',
  'Eko Electric': 'eko-electric',
  IKEDC: 'ikeja-electric',
  'Ikeja Electric': 'ikeja-electric',
  AEDC: 'abuja-electric',
  'Abuja Electric': 'abuja-electric',
  PHED: 'phed',
  'Port Harcourt Electric': 'phed',
  KEDCO: 'kedco',
  EEDC: 'enugu-electric',
};

class VTpassService {
  async buyAirtime({ provider, phone, amount }) {
    const serviceID = AIRTIME_SERVICE_MAP[provider];
    if (!serviceID) throw new Error(`Unsupported airtime provider: ${provider}`);

    const payload = {
      request_id: generateRequestId(),
      serviceID,
      amount,
      phone,
    };

    const { data } = await axios.post(`${BASE_URL}/pay`, payload, { headers: postHeaders });

    if (data.code !== '000') {
      throw new Error(data.response_description || 'VTpass airtime purchase failed');
    }
    return data;
  }

  async buyData({ provider, phone, variationCode, amount }) {
    const serviceID = DATA_SERVICE_MAP[provider];
    if (!serviceID) throw new Error(`Unsupported data provider: ${provider}`);

    const payload = {
      request_id: generateRequestId(),
      serviceID,
      billersCode: phone,
      variation_code: variationCode,
      amount,
      phone,
    };

    const { data } = await axios.post(`${BASE_URL}/pay`, payload, { headers: postHeaders });

    if (data.code !== '000') {
      throw new Error(data.response_description || 'VTpass data purchase failed');
    }
    return data;
  }

  async payElectricity({ provider, meterNumber, variationCode = 'prepaid', amount, phone }) {
    const serviceID = ELECTRICITY_SERVICE_MAP[provider];
    if (!serviceID) throw new Error(`Unsupported electricity provider: ${provider}`);

    const payload = {
      request_id: generateRequestId(),
      serviceID,
      billersCode: meterNumber,
      variation_code: variationCode,
      amount,
      phone,
    };

    const { data } = await axios.post(`${BASE_URL}/pay`, payload, { headers: postHeaders });

    if (data.code !== '000') {
      throw new Error(data.response_description || 'VTpass electricity payment failed');
    }
    return data;
  }

  async getDataVariations(provider) {
    const serviceID = DATA_SERVICE_MAP[provider];
    if (!serviceID) throw new Error(`Unsupported provider: ${provider}`);

    const { data } = await axios.get(
      `${BASE_URL}/service-variations?serviceID=${serviceID}`,
      { headers }
    );
    return data;
  }

  // Generic pay — accepts serviceID directly (no internal mapping needed)
  async payDirect({ serviceID, amount, phone, billersCode, variationCode }) {
    const payload = {
      request_id: generateRequestId(),
      serviceID,
      amount,
      phone,
      ...(billersCode && { billersCode }),
      ...(variationCode && { variation_code: variationCode }),
    };

    const { data } = await axios.post(`${BASE_URL}/pay`, payload, { headers: postHeaders });

    if (data.code !== '000') {
      throw new Error(data.response_description || `VTpass payment failed (${serviceID})`);
    }
    return data;
  }

  async verifyMeter({ provider, meterNumber, variationCode = 'prepaid' }) {
    const serviceID = ELECTRICITY_SERVICE_MAP[provider];
    if (!serviceID) throw new Error(`Unsupported electricity provider: ${provider}`);

    const { data } = await axios.post(
      `${BASE_URL}/merchant-verify`,
      { billersCode: meterNumber, serviceID, type: variationCode },
      { headers: postHeaders }
    );
    return data;
  }
}

export default new VTpassService();
