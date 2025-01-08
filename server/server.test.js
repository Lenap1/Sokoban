import request from 'supertest';
import server from './server';  // Importiere server.js

describe('API Tests', () => {
  let accessToken;

  // Test für POST /api/login - sollte ein Token zurückgeben
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
    accessToken = response.body.access_token;  // Speichern des Tokens für den nächsten Test
  });

  // Test für GET /api/data - sollte Daten zurückgeben
  it('GET /api/data - sollte eine Antwort mit Daten zurückgeben', async () => {
    const response = await request(server)
      .get('/api/data')
      .set('Authorization', `Bearer ${accessToken}`);  // Setzt das Token in den Header

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBe('some data');
  });

  // Test für GET /test - einfache Willkommensnachricht
  it('GET /test - sollte eine Willkommensnachricht zurückgeben', async () => {
    const response = await request(server).get('/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Sokoban mid Jas und Lena, Kollegen. Viel Spass!');
  });
});
