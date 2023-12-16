const request = require('supertest');
const app = require('./app'); 
describe('GET /api/users', () => {
  it('should respond with a list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    // Add more assertions 
    expect(res.body).toBeInstanceOf(Array);
  });

  // Add more tests 
});
