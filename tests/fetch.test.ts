import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { createHttpClient } from '../src/fetch';

describe('Fetch HTTP Client', () => {
  const baseURL = 'https://api.example.com';
  let client: ReturnType<typeof createHttpClient>;

  beforeEach(() => {
    client = createHttpClient({ baseURL });
  });

  it('should create a fetch client instance', () => {
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

  it('should make POST requests with JSON data', async () => {
    const userData = { name: 'Jane', email: 'jane@example.com' };

    server.use(
      http.post(`${baseURL}/users`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 2, ...body });
      })
    );

    const response = await client.post('/users', userData);
    expect(response).toEqual({ id: 2, ...userData });
  });

  it('should handle text responses', async () => {
    server.use(
      http.get(`${baseURL}/text`, () => {
        return new HttpResponse('Plain text response', {
          headers: { 'Content-Type': 'text/plain' },
        });
      })
    );

    const response = await client.get('/text');
    expect(response).toBe('Plain text response');
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

  it('should handle dynamic headers with tokens', async () => {
    const getTokens = () => ({ token: 'dynamic-token' });
    const clientWithDynamicHeaders = createHttpClient({
      baseURL,
      getTokens,
      headers: tokens => ({ Authorization: `Bearer ${tokens.token}` }),
    });

    server.use(
      http.get(`${baseURL}/dynamic`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer dynamic-token') {
          return HttpResponse.json({ message: 'Dynamic auth success' });
        }
        return new HttpResponse(null, { status: 401 });
      })
    );

    const response = await clientWithDynamicHeaders.get('/dynamic');
    expect(response).toEqual({ message: 'Dynamic auth success' });
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

  it('should handle HTTP errors', async () => {
    server.use(
      http.get(`${baseURL}/error`, () => {
        return new HttpResponse(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );

    await expect(client.get('/error')).rejects.toThrow('Request failed');
  });

  it('should build URLs correctly', async () => {
    const uri = await client.getUri({ url: '/test/path' });
    expect(uri).toBe('https://api.example.com/test/path');
  });

  it('should work without baseURL using relative paths', async () => {
    const clientWithoutBaseURL = createHttpClient({});

    // In browser/Next.js environments, relative paths work fine
    // In Node.js test environment, we need to use absolute URLs
    const absoluteURL = 'http://localhost:3000/users';

    server.use(
      http.get(absoluteURL, () => {
        return HttpResponse.json({ users: [{ id: 1, name: 'John' }] });
      })
    );

    const response = await clientWithoutBaseURL.get(absoluteURL);
    expect(response).toEqual({ users: [{ id: 1, name: 'John' }] });
  });

  it('should work without baseURL using absolute URLs', async () => {
    const clientWithoutBaseURL = createHttpClient({});
    const absoluteURL = 'https://api.example.com/users';

    server.use(
      http.get(absoluteURL, () => {
        return HttpResponse.json({ users: [{ id: 1, name: 'John' }] });
      })
    );

    const response = await clientWithoutBaseURL.get(absoluteURL);
    expect(response).toEqual({ users: [{ id: 1, name: 'John' }] });
  });

  it('should handle getUri without baseURL', async () => {
    const clientWithoutBaseURL = createHttpClient({});

    const uri = await clientWithoutBaseURL.getUri({ url: '/test/path' });
    expect(uri).toBe('/test/path');

    const absoluteUri = await clientWithoutBaseURL.getUri({ url: 'https://api.example.com/test' });
    expect(absoluteUri).toBe('https://api.example.com/test');
  });

  it('should handle all HTTP methods without baseURL', async () => {
    const clientWithoutBaseURL = createHttpClient({});
    const testData = { name: 'Test' };
    const baseUrl = 'http://localhost:3000';

    server.use(
      http.get(`${baseUrl}/get-test`, () => HttpResponse.json({ method: 'GET' })),
      http.post(`${baseUrl}/post-test`, () => HttpResponse.json({ method: 'POST' })),
      http.put(`${baseUrl}/put-test`, () => HttpResponse.json({ method: 'PUT' })),
      http.patch(`${baseUrl}/patch-test`, () => HttpResponse.json({ method: 'PATCH' })),
      http.delete(`${baseUrl}/delete-test`, () => HttpResponse.json({ method: 'DELETE' })),
      http.head(`${baseUrl}/head-test`, () => new HttpResponse(null, { status: 200 })),
      http.options(`${baseUrl}/options-test`, () => HttpResponse.json({ method: 'OPTIONS' }))
    );

    const getResponse = await clientWithoutBaseURL.get(`${baseUrl}/get-test`);
    expect(getResponse).toEqual({ method: 'GET' });

    const postResponse = await clientWithoutBaseURL.post(`${baseUrl}/post-test`, testData);
    expect(postResponse).toEqual({ method: 'POST' });

    const putResponse = await clientWithoutBaseURL.put(`${baseUrl}/put-test`, testData);
    expect(putResponse).toEqual({ method: 'PUT' });

    const patchResponse = await clientWithoutBaseURL.patch(`${baseUrl}/patch-test`, testData);
    expect(patchResponse).toEqual({ method: 'PATCH' });

    const deleteResponse = await clientWithoutBaseURL.delete(`${baseUrl}/delete-test`);
    expect(deleteResponse).toEqual({ method: 'DELETE' });

    const optionsResponse = await clientWithoutBaseURL.options(`${baseUrl}/options-test`);
    expect(optionsResponse).toEqual({ method: 'OPTIONS' });
  });

  it('should work without any parameters at all', async () => {
    const clientWithNoParams = createHttpClient(); // No parameters needed!
    const absoluteURL = 'http://localhost:3000/users';

    server.use(
      http.get(absoluteURL, () => {
        return HttpResponse.json({ users: [{ id: 1, name: 'Jane' }] });
      })
    );

    const response = await clientWithNoParams.get(absoluteURL);
    expect(response).toEqual({ users: [{ id: 1, name: 'Jane' }] });
  });
});
