import { spawn } from 'child_process';
  import { createServer } from 'net';
  import dotenv from 'dotenv';
  import path from 'path';
  import { fileURLToPath } from 'url';

  // Load environment variables
  dotenv.config({ path: '.env.local' });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(path.normalize(path.join(__dirname, '..')));

  let nextDev;
  let isCleaningUp = false;

  async function checkPort(port) {
    return new Promise((resolve) => {
      const server = createServer();
      
      server.once('error', () => {
        resolve(true); // Port is in use
      });
      
      server.once('listening', () => {
        server.close();
        resolve(false); // Port is free
      });
      
      server.listen(port);
    });
  }

  async function killProcessOnPort(port) {
    try {
      if (process.platform === 'win32') {
        // Windows: Use netstat to find the process
        const netstat = spawn('netstat', ['-ano', '|', 'findstr', `:${port}`]);
        netstat.stdout.on('data', (data) => {
          const match = data.toString().match(/\s+(\d+)$/);
          if (match) {
            const pid = match[1];
            spawn('taskkill', ['/F', '/PID', pid]);
          }
        });
        await new Promise((resolve) => netstat.on('close', resolve));
      } else {
        // Unix-like systems: Use lsof
        const lsof = spawn('lsof', ['-ti', `:${port}`]);
        lsof.stdout.on('data', (data) => {
          data.toString().split('\n').forEach(pid => {
            if (pid) {
              try {
                process.kill(parseInt(pid), 'SIGKILL');
              } catch (e) {
                if (e.code !== 'ESRCH') throw e;
              }
            }
          });
        });
        await new Promise((resolve) => lsof.on('close', resolve));
      }
    } catch (e) {
      // Ignore errors if no process found
    }
  }

  async function startDev() {
    // Check if port 3000 is already in use
    const isPortInUse = await checkPort(3000);
    if (isPortInUse) {
      console.error('Port 3000 is already in use. To find and kill the process using this port:\n\n' +
        (process.platform === 'win32' 
          ? '1. Run: netstat -ano | findstr :3000\n' +
            '2. Note the PID (Process ID) from the output\n' +
            '3. Run: taskkill /PID <PID> /F\n'
          : `On macOS/Linux, run:\nnpm run cleanup\n`) +
        '\nThen try running this command again.');
      process.exit(1);
    }

    const frameUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    console.log(`
💻 To test your mini app:
   1. Open the Warpcast Mini App Developer Tools: https://warpcast.com/~/developers
   2. Scroll down to the "Preview Mini App" tool
   3. Enter this URL: ${frameUrl}
   4. Click "Preview" to test your mini app (note that it may take ~5 seconds to load the first time)

📱 To test in Warpcast mobile app with Ngrok:
   1. Run 'ngrok http 3000' in a separate terminal to get a public URL (e.g., https://abcd1234.ngrok.io)
   2. Update NEXT_PUBLIC_URL and NEXTAUTH_URL in .env.local with the Ngrok URL
   3. Restart the server with 'npm run dev'
   4. Open Warpcast on your phone, go to Settings > Developer > Mini Apps
   5. Enter the Ngrok URL and click "Preview"
`);

    // Start next dev with appropriate configuration
    const nextBin = path.normalize(path.join(projectRoot, 'node_modules', '.bin', 'next'));

    nextDev = spawn(nextBin, ['dev'], {
      stdio: 'inherit',
      env: { ...process.env, NEXT_PUBLIC_URL: frameUrl, NEXTAUTH_URL: frameUrl },
      cwd: projectRoot,
      shell: process.platform === 'win32' // Add shell option for Windows
    });

    // Handle cleanup
    const cleanup = async () => {
      if (isCleaningUp) return;
      isCleaningUp = true;

      console.log('\n\nShutting down...');

      try {
        if (nextDev) {
          try {
            // Kill the main process first
            nextDev.kill('SIGKILL');
            // Then kill any remaining child processes in the group
            if (nextDev?.pid) {
              try {
                process.kill(-nextDev.pid);
              } catch (e) {
                // Ignore ESRCH errors when killing process group
                if (e.code !== 'ESRCH') throw e;
              }
            }
            console.log('🛑 Next.js dev server stopped');
          } catch (e) {
            // Ignore errors when killing nextDev
            console.log('Note: Next.js process already terminated');
          }
        }

        // Force kill any remaining processes on port 3000
        await killProcessOnPort(3000);
      } catch (error) {
        console.error('Error during cleanup:', error);
      } finally {
        process.exit(0);
      }
    };

    // Handle process termination
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }

  startDev().catch(console.error);