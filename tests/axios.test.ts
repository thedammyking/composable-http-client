import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { createHttpClient } from '../src/axios';

describe('Axios HTTP Client', () => {
  const baseURL = 'https://api.example.com';
  let client: ReturnType<typeof createHttpClient>;

  beforeEach(() => {
    client = createHttpClient({ baseURL });
  });

  it('should create an axios client instance', () => {
    expect(client).toBeDefined();
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
    expect(typeof client.put).toBe('function');
    expect(typeof client.patch).toBe('function');
    expect(typeof client.delete).toBe('function');
  });

  it('should make GET requests', async () => {
    server.use(
      http.get(`${baseURL}/users`, () => {
        return HttpResponse.json({ users: [{ id: 1, name: 'John' }] });
      })
    );

    const response = await client.get('/users');
    expect(response).toEqual({ users: [{ id: 1, name: 'John' }] });
  });

  it('should make POST requests', async () => {
    const userData = { name: 'Jane', email: 'jane@example.com' };

    server.use(
      http.post(`${baseURL}/users`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({ id: 2, ...body });
      })
    );

    const response = await client.post('/users', userData);
    expect(response).toEqual({ id: 2, ...userData });
  });

  it('should handle headers', async () => {
    const clientWithHeaders = createHttpClient({
      baseURL,
      headers: { Authorization: 'Bearer token123' },
    });

    server.use(
      http.get(`${baseURL}/protected`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer token123') {
          return HttpResponse.json({ message: 'Authorized' });
        }
        return new HttpResponse(null, { status: 401 });
      })
    );

    const response = await clientWithHeaders.get('/protected');
    expect(response).toEqual({ message: 'Authorized' });
  });

  it('should handle token refresh on 401', async () => {
    let tokenRefreshed = false;
    const getTokens = () => ({ token: tokenRefreshed ? 'new-token' : 'old-token' });
    const refreshToken = async () => {
      tokenRefreshed = true;
    };

    const clientWithAuth = createHttpClient({
      baseURL,
      getTokens,
      refreshToken,
      headers: tokens => ({ Authorization: `Bearer ${tokens.token}` }),
    });

    server.use(
      http.get(`${baseURL}/auth-test`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer new-token') {
          return HttpResponse.json({ message: 'Success with new token' });
        }
        return new HttpResponse(null, { status: 401 });
      })
    );

    const response = await clientWithAuth.get('/auth-test');
    expect(tokenRefreshed).toBe(true);
    expect(response).toEqual({ message: 'Success with new token' });
  });

  it('should handle request timeout', async () => {
    const clientWithTimeout = createHttpClient({
      baseURL,
      timeout: 100, // 100ms timeout
    });

    server.use(
      http.get(`${baseURL}/slow`, async () => {
        // Simulate slow response
        await new Promise(resolve => setTimeout(resolve, 200));
        return HttpResponse.json({ message: 'Slow response' });
      })
    );

    await expect(clientWithTimeout.get('/slow')).rejects.toThrow();
  });
});
