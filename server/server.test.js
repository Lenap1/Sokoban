import request from 'supertest';
import server from './server';  

describe('API Tests', () => {
  let accessToken;

  
  it('POST /api/login - sollte ein Token zurückgeben', async () => {
    const response = await request(server)
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'password123',
      })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
    accessToken = response.body.access_token;  
  });

 
  it('GET /api/data - sollte eine Antwort mit Daten zurückgeben', async () => {
    const response = await request(server)
      .get('/api/data')
      .set('Authorization', `Bearer ${accessToken}`);  

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBe('some data');
  });

 
  it('GET /test - sollte eine Willkommensnachricht zurückgeben', async () => {
    const response = await request(server).get('/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Sokoban mid Jas und Lena, Kollegen. Viel Spass!');
  });
});
