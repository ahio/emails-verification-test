import axios from 'axios';
import { Readable } from 'node:stream';
import * as process from 'node:process';

const API_HOST = process.env.API_HOST || 'localhost';
const API_URL = `http://${API_HOST}:3001`;

async function waitForEventDataAndUnsubscribe() {
  let data = null;

  const controller = new AbortController();

  try {
    const sseResponse = await axios({
      method: 'get',
      url: `${API_URL}/emails/verification-status/sse`,
      responseType: 'stream',
      signal: controller.signal,
    });

    const reader = Readable.from(sseResponse.data);

    for await (const chunk of reader) {
      const result = chunk.toString().trim();
      if (result.length) {
        const rawData = result.split('\n')[2];
        const dataLine = rawData.replace('data: ', '');
        data = JSON.parse(dataLine);
        controller.abort();
      }
    }
  } catch (err) {
    if (!axios.isCancel(err)) {
      throw err;
    }
  }

  return data;
}

describe('Emails', () => {
  let email = '';
  let createdEmailData = null;

  beforeAll(async () => {
    const randomNumber = Math.random().toString().slice(2, 12);
    email = `test-${randomNumber}@test.com`;

    const emailsListResponse = await axios.post(`${API_URL}/emails/bulk`, { emails: [email] });
    createdEmailData = emailsListResponse.data[0];
  });

  it('added new email for verification', () => {
    expect(createdEmailData).toMatchObject({ email, status: 'validating' });
  });

  it('should return email with updated status', async () => {
      const sseData = await waitForEventDataAndUnsubscribe();

      expect(sseData).toMatchObject({
        email,
        status: expect.stringMatching(/valid|invalid/),
      });
    },
    20 * 1000,
  );

  it('should return a list that contain created email', async () => {
    const response = await axios.get(`${API_URL}/emails/list`);
    expect(response.data).toContainEqual({
      email,
      id: expect.anything(),
      status: expect.stringMatching(/valid|invalid/),
    });
  });
});
