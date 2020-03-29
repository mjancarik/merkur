import request from 'supertest';
import { app } from '../server';

describe('Widget endpoint', () => {
  it('should return merkur JSON structure for widget', async () => {
    const res = await request(app).get('/widget');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "assets": Array [
          Object {
            "source": "http://localhost:4444/static/widget-client.js",
            "type": "script",
          },
          Object {
            "source": "http://localhost:4444/static/widget-client.css",
            "type": "stylesheet",
          },
        ],
        "html": "
            <div class=\\"merkur__page\\">
              <div class=\\"merkur__headline\\">
                <div class=\\"merkur__view\\">
                  
          <div class=\\"merkur__icon\\">
            <img src=\\"http://localhost:4444/static/merkur-icon.png\\" alt=\\"Merkur\\">
          </div>
        
                  
          <h1>Welcome to <a href=\\"https://github.com/mjancarik/merkur\\">MERKUR</a> front-end microservices library.</h1>
        
                  
          <p>Configured view is <strong></strong>.</p>
        
                </div>
              </div>
              <div class=\\"merkur__view\\">
                
          <div>
            <h2>Counter widget:</h2>
            <p>Count: 0</p>
            <button onclick=\\"return ((...rest) =&gt; {
              return originalFunction(widget, ...rest);
            }).call(this, event)\\">
              increase counter
            </button>
            <button onclick=\\"return ((...rest) =&gt; {
              return originalFunction(widget, ...rest);
            }).call(this, event)\\">
              reset counter
            </button>
          </div>
        
              </div>
            </div>
        ",
        "name": "my-widget",
        "props": Object {},
        "state": Object {
          "counter": 0,
        },
        "version": "0.0.1",
      }
    `);
  });
});
