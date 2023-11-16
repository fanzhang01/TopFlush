const request = require('supertest');
const app = require('../app');


describe('POST /register', () => {
    it('should register a user', async () => {
        const response = await request(app).post("/register").send('username=testuser&email=test@example.com&password=testpassword&gender=male');

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

describe('POST /login', () => {
    it('should authenticate and redirect to home', async () => {
        const response = await request(app)
            .post('/login')
            .send('username=testuser&password=testpassword');

        expect(response.status).toBe(302);
        expect(response.header.location).toBe('/home');
    });

    it('should handle login failure', async () => {
        const response = await request(app)
            .post('/login')
            .send('username=wronguser&password=wrongpassword');

        expect(response.status).toBe(401);
    });
});

describe('GET /logout', () => {
    it('should logout and redirect', async () => {
        const response = await request(app).get('/logout');
        expect(response.status).toBe(302);
        expect(response.header.location).toBe('/');
    });
});

describe('GET /home', () => {
    it('should return the home page', async () => {
        const response = await request(app).get('/home');
        expect(response.status).toBe(200);
    });
});

describe('GET /createRestroom', () => {
    // Note: This requires setup for an authenticated session
    it('should return the create restroom page for logged-in users', async () => {
        // Example assuming you have a way to simulate a login or set session data
        const response = await request(app).get('/createRestroom');
        expect(response.status).toBe(200);
    });
});
