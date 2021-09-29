import request from 'supertest';

import { app } from '../app';

describe('Widget', () => {
  it('should return merkur JSON structure for widget', async () => {
    const res = await request(app).get('/widget');

    expect(res.statusCode).toEqual(200);
    expect(res.body.assets.length).toBeGreaterThan(0);
    delete res.body.assets;
    expect(res.body).toMatchInlineSnapshot();
  });

  it('should return 404 for not defined route', async () => {
    const res = await request(app).get('/x');

    expect(res.statusCode).toEqual(404);
    expect(res.body.error.status).toEqual(404);
  });

  it('should return 200 for playground page', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toEqual(200);
  });
});
