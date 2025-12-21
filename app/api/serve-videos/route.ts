// app/api/serve-videos/route.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Store the server process globally
let serverProcess = null;

export async function GET(request) {
  const videosPath = path.join(process.cwd(), 'public', 'videos');
  
  // Ensure videos directory exists
  if (!fs.existsSync(videosPath)) {
    fs.mkdirSync(videosPath, { recursive: true });
  }
  
  // Start server if not running
  if (!serverProcess) {
    serverProcess = spawn('npx', ['http-server', videosPath, '-p', '8080', '-c-1', '--cors']);
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });
    
    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      serverProcess = null;
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return Response.json({ 
    message: 'Video server is running',
    url: 'http://localhost:8080',
    files: fs.readdirSync(videosPath).filter(f => f.match(/\.(mp4|webm|mov)$/i))
  });
}