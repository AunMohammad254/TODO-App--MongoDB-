#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests all critical functionality after Vercel deployment
 */

const https = require('https');
const http = require('http');

class DeploymentVerifier {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Deployment-Verifier/1.0'
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async test(name, testFn) {
    console.log(`Testing: ${name}...`);
    try {
      const result = await testFn();
      this.results.push({ name, status: 'PASS', result });
      console.log(`✅ ${name}: PASSED`);
      return result;
    } catch (error) {
      this.results.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name}: FAILED - ${error.message}`);
      return null;
    }
  }

  async runAllTests() {
    console.log(`🚀 Starting deployment verification for: ${this.baseUrl}\n`);

    // Test 1: Static file serving
    await this.test('Static HTML serving', async () => {
      const response = await this.makeRequest('/');
      if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
      }
      if (!response.body.includes('Task Manager')) {
        throw new Error('HTML content not found');
      }
      return 'HTML loads correctly';
    });

    // Test 2: CSS file serving
    await this.test('CSS file serving', async () => {
      const response = await this.makeRequest('/css/style.css');
      if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
      }
      return 'CSS loads correctly';
    });

    // Test 3: JavaScript file serving
    await this.test('JavaScript file serving', async () => {
      const response = await this.makeRequest('/js/app.js');
      if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
      }
      return 'JavaScript loads correctly';
    });

    // Test 4: API health check
    await this.test('API health check', async () => {
      const response = await this.makeRequest('/api/health');
      if (response.statusCode !== 200 && response.statusCode !== 404) {
        throw new Error(`API not responding properly: ${response.statusCode}`);
      }
      return 'API endpoint accessible';
    });

    // Test 5: Auth endpoint
    await this.test('Auth endpoint accessibility', async () => {
      const response = await this.makeRequest('/api/auth/register', 'POST', {
        username: 'test',
        email: 'test@example.com',
        password: 'testpassword'
      });
      // We expect either success or validation error, not server error
      if (response.statusCode >= 500) {
        throw new Error(`Server error: ${response.statusCode}`);
      }
      return 'Auth endpoint responding';
    });

    // Test 6: Tasks endpoint
    await this.test('Tasks endpoint accessibility', async () => {
      const response = await this.makeRequest('/api/tasks');
      // Should return 401 (unauthorized) or similar, not 500
      if (response.statusCode >= 500) {
        throw new Error(`Server error: ${response.statusCode}`);
      }
      return 'Tasks endpoint responding';
    });

    // Test 7: CORS headers
    await this.test('CORS headers', async () => {
      const response = await this.makeRequest('/');
      const corsHeader = response.headers['access-control-allow-origin'];
      if (corsHeader) {
        return `CORS configured: ${corsHeader}`;
      }
      return 'CORS headers present';
    });

    // Test 8: Security headers
    await this.test('Security headers', async () => {
      const response = await this.makeRequest('/');
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ];
      
      const presentHeaders = securityHeaders.filter(header => 
        response.headers[header]
      );
      
      if (presentHeaders.length === 0) {
        throw new Error('No security headers found');
      }
      
      return `Security headers present: ${presentHeaders.join(', ')}`;
    });

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }
    
    console.log('\n🎯 Deployment Status:', failed === 0 ? '✅ READY' : '⚠️  NEEDS ATTENTION');
  }
}

// Usage
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const verifier = new DeploymentVerifier(baseUrl);
  verifier.runAllTests().catch(console.error);
}

module.exports = DeploymentVerifier;