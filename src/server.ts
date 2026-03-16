import { configManager } from './config';
import { createApp } from './app';
import net from 'net';

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(startPort, () => {
      srv.once('close', () => resolve(startPort));
      srv.close();
    });
    srv.on('error', () => {
      console.log(`⚠ Port ${startPort} is busy, trying ${startPort + 1}...`);
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function main(): Promise<void> {
  // Load configuration
  const config = configManager.load();

  // Create Express app
  const app = createApp();
  const requestedPort = config.port || 3001;

  const port = await findAvailablePort(requestedPort);
  
  if (port !== requestedPort) {
    configManager.save({ port });
  }

  // Start server
  app.listen(port, () => {
    console.log('');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│          ✨ Gemma Endpoint Proxy ✨          │');
    console.log('├─────────────────────────────────────────────┤');
    console.log(`│  🌐 Interface:  http://localhost:${port}        │`);
    console.log(`│  🔌 API:        http://localhost:${port}/v1     │`);
    console.log(`│  📦 Model:      ${(config.model || 'gemma-3-27b-it').padEnd(27)}│`);
    console.log(`│  🔑 API Key:    ${config.apiKey ? '✔ configured' : '✘ not set — use the UI'}     │`);
    console.log('└─────────────────────────────────────────────┘');
    console.log('');
  });
}

main();
