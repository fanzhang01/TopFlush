const request = require('supertest');
const app = require('../app');


describe('POST /register', () => {
    it('should register a user', async () => {
        const response = await request(app).post("/register").send('username=testuser&email=test@example.com&password=testpassword&confirmedpassword=testpassword&gender=male');

        expect(response.status).toBe(302); 
        expect(response.header.location).toBe('/home'); 
    });

    it('should handle user registration failure', async () => {
        const response = await request(app)
            .post('/register')
            .send('username=&email=&password=&gender=');

        expect(response.status).toBe(400); 
        //expect(response.text).toEqual("<script> alert('${error.message}'); </script>"); 
    }); 
});