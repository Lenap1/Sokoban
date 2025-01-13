import request from 'supertest';
import server from './server';

describe('API Tests', () => {

 
  describe('GET /test', () => {
    it('sollte eine Willkommensnachricht zurückgeben', async () => {
      const response = await request(server).get('/test');


      expect(response.status).toBe(200);
      expect(response.text).toBe('Sokoban mid Jas und Lena, Kollegen. Viel Spass!');
    });
  });


  describe('POST /api/user/register', () => {
    beforeEach(async () => {
      // Vor jedem test bereinigen
      const db = server.get('db');
      await db.collection('users').deleteMany({ username: 'newuser' });
    });

    afterEach(async () => {
      // Nach jedem test bereinigen
      const db = server.get('db');
      await db.collection('users').deleteMany({ username: 'newuser' });
    });

    it('sollte einen neuen Benutzer registrieren', async () => {
      const response = await request(server)
        .post('/api/user/register')
        .send({
          username: 'newuser',
          password: 'newpassword123',
          email: 'newuser@example.com',
        })
        .set('Content-Type', 'application/json');


      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registrierung erfolgreich');
    });

    it('sollte einen Fehler bei fehlenden Feldern zurückgeben', async () => {
      const response = await request(server)
        .post('/api/user/register')
        .send({
          username: 'userwithoutpassword',
          email: 'user@example.com',
        })
        .set('Content-Type', 'application/json');


      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});