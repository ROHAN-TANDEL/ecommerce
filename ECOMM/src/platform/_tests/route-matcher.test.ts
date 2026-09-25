import { RouteTrie } from '../core/registry/route-matcher';
import { ApiRegistration } from '../core/registry/types';

describe('RouteTrie', () => {
    let trie: RouteTrie;

    beforeEach(() => {
        trie = new RouteTrie();
    });

    const createApi = (id: string, method: any, path: string, domain = 'test'): ApiRegistration => ({
        id,
        method,
        path,
        domain,
        tenant: false
    });

    test('should match static routes', () => {
        const api = createApi('test.get', 'GET', '/users');
        trie.insert('/users', api);

        const result = trie.find('GET', '/users');
        expect(result).toBeDefined();
        expect(result?.api.id).toBe('test.get');
        expect(result?.params).toEqual({});
    });

    test('should match parameter routes', () => {
        const api = createApi('user.get', 'GET', '/users/:id');
        trie.insert('/users/:id', api);

        const result = trie.find('GET', '/users/123');
        expect(result).toBeDefined();
        expect(result?.api.id).toBe('user.get');
        expect(result?.params).toEqual({ id: '123' });
    });

    test('should prioritize static over parameter', () => {
        const api1 = createApi('user.profile', 'GET', '/users/profile');
        const api2 = createApi('user.get', 'GET', '/users/:id');

        trie.insert('/users/profile', api1);
        trie.insert('/users/:id', api2);

        const result = trie.find('GET', '/users/profile');
        expect(result?.api.id).toBe('user.profile');
        expect(result?.params).toEqual({});
    });

    test('should match wildcard routes', () => {
        const api = createApi('admin.all', 'GET', '/admin/*');
        trie.insert('/admin/*', api);

        const result = trie.find('GET', '/admin/settings/users');
        expect(result?.api.id).toBe('admin.all');
        expect(result?.params).toEqual({ '*': 'settings/users' });
    });

    test('should handle same path different methods', () => {
        const api1 = createApi('users.get', 'GET', '/users');
        const api2 = createApi('users.post', 'POST', '/users');

        trie.insert('/users', api1);
        trie.insert('/users', api2);

        const getResult = trie.find('GET', '/users');
        expect(getResult?.api.id).toBe('users.get');

        const postResult = trie.find('POST', '/users');
        expect(postResult?.api.id).toBe('users.post');
    });

    test('should return null for unmatched routes', () => {
        const api = createApi('user.get', 'GET', '/users/:id');
        trie.insert('/users/:id', api);

        const result = trie.find('GET', '/products/123');
        expect(result).toBeNull();
    });

    test('should handle nested routes', () => {
        const api1 = createApi('api.v1', 'GET', '/api/v1/users');
        const api2 = createApi('api.v2', 'GET', '/api/v2/users/:id');

        trie.insert('/api/v1/users', api1);
        trie.insert('/api/v2/users/:id', api2);

        const result1 = trie.find('GET', '/api/v1/users');
        expect(result1?.api.id).toBe('api.v1');

        const result2 = trie.find('GET', '/api/v2/users/123');
        expect(result2?.api.id).toBe('api.v2');
        expect(result2?.params).toEqual({ id: '123' });
    });
});