import { addServerConfig } from '../utils.mjs';

describe('server function', () => {
  describe('addServerConfig', () => {
    it('should update protocol when provided', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, { protocol: 'https:' });

      expect(result.protocol).toBe('https:');
      expect(result.origin).toBe('https://localhost:3000');
    });

    it('should update port when provided', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, { port: 8080 });

      expect(result.port).toBe(8080);
    });

    it('should update host when hostname is provided', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, { hostname: '127.0.0.1' });

      expect(result.host).toBe('127.0.0.1:3000');
      expect(result.origin).toBe('http://127.0.0.1:3000');
    });

    it('should update host when port is provided without hostname', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, { port: 8080 });

      expect(result.host).toBe('localhost:8080');
      expect(result.port).toBe(8080);
      expect(result.origin).toBe('http://localhost:8080');
    });

    it('should update host and port when both hostname and port are provided', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, {
        hostname: 'example.com',
        port: 8080,
      });

      expect(result.host).toBe('example.com:8080');
      expect(result.port).toBe(8080);
      expect(result.origin).toBe('http://example.com:8080');
    });

    it('should update all fields when protocol, hostname, and port are provided', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, {
        protocol: 'https:',
        hostname: 'example.com',
        port: 443,
      });

      expect(result.protocol).toBe('https:');
      expect(result.host).toBe('example.com:443');
      expect(result.port).toBe(443);
      expect(result.origin).toBe('https://example.com');
    });

    it('should not update host when no hostname or port is provided', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, { protocol: 'https:' });

      expect(result.host).toBe('localhost:3000');
      expect(result.origin).toBe('https://localhost:3000');
    });

    it('should handle serverConfig without existing host', () => {
      const serverConfig = {
        protocol: 'http:',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, {
        hostname: 'localhost',
        port: 8080,
      });

      expect(result.host).toBe('localhost:8080');
      expect(result.port).toBe(8080);
      expect(result.origin).toBe('http://localhost:8080');
    });

    it('should handle serverConfig without existing host', () => {
      const serverConfig = {};

      const result = addServerConfig(serverConfig, {
        port: 8080,
      });

      expect(result.host).toBe(undefined);
      expect(result.port).toBe(8080);
      expect(result.origin).toBe(undefined);
    });

    it('should return the modified serverConfig object', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, {});

      expect(result).toBe(serverConfig);
      expect(result.origin).toBe('http://localhost:3000');
    });

    it('should handle empty options object', () => {
      const serverConfig = {
        protocol: 'http:',
        host: 'localhost:3000',
        port: 3000,
      };

      const result = addServerConfig(serverConfig, {});

      expect(result.protocol).toBe('http:');
      expect(result.host).toBe('localhost:3000');
      expect(result.port).toBe(3000);
      expect(result.origin).toBe('http://localhost:3000');
    });
  });
});
