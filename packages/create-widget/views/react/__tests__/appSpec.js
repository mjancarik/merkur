import request from 'supertest';
import { app } from '../app';

describe('Widget endpoint', () => {
  it('should return merkur JSON structure for widget', async () => {
    const res = await request(app).get('/widget');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchInlineSnapshot();
  });
});
