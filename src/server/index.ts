import express from 'express';
import { exec, ChildProcess } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface ServerConfig {
  serverName: string;
  serverDirectory: string;
  serverPort: number;
  serverConfig: string;
  serverProfile: string;
  serverCPU: number;
  mods: string[];
  autoRestart: boolean;
  restartInterval: number;
}

interface ServerStatus {
  isRunning: boolean;
  players: number;
  uptime: string;
  config: ServerConfig;
}

const defaultConfig: ServerConfig = {
  serverName: "DayZ Server",
  serverDirectory: process.env.DAYZ_SERVER_PATH || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\DayZServer\\",
  serverPort: 2302,
  serverConfig: "serverDZ.cfg",
  serverProfile: "profiles",
  serverCPU: 2,
  mods: [],
  autoRestart: true,
  restartInterval: 14400 // 4 hours in seconds
};

let serverStatus: ServerStatus = {
  isRunning: false,
  players: 0,
  uptime: '0:00:00',
  config: { ...defaultConfig }
};

let serverProcess: ChildProcess | null = null;
let restartTimer: NodeJS.Timeout | null = null;
let uptimeInterval: NodeJS.Timeout | null = null;
let startTime: Date | null = null;

function createModString(mods: string[]): string {
  return mods.length > 0 ? `-mod=@${mods.join(';@')}` : '';
}

function updateUptime() {
  if (startTime && serverStatus.isRunning) {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    serverStatus.uptime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

function setupRestartTimer() {
  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  if (serverStatus.config.autoRestart) {
    restartTimer = setTimeout(async () => {
      console.log('Auto-restart timer triggered');
      await stopServer();
      setTimeout(async () => {
        await startServer();
      }, 10000); // Wait 10 seconds before restarting
    }, serverStatus.config.restartInterval * 1000);
  }
}

function cleanupProcesses() {
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
    uptimeInterval = null;
  }
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (error) {
      console.error('Error killing server process:', error);
    }
    serverProcess = null;
  }
}

async function startServer() {
  if (serverStatus.isRunning) {
    throw new Error('Server is already running');
  }

  const { serverDirectory, serverConfig, serverPort, serverProfile, serverCPU, mods } = serverStatus.config;

  // Create profile directory if it doesn't exist
  const profilePath = path.join(serverDirectory, serverProfile);
  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(profilePath, { recursive: true });
  }

  const modString = createModString(mods);
  const startCommand = `"${path.join(serverDirectory, 'DayZServer_x64.exe')}" -config=${serverConfig} -port=${serverPort} -profiles=${serverProfile} -BEpath=battleye ${modString} -cpuCount=${serverCPU} -dologs -adminlog -netlog -freezecheck`;

  console.log('Starting server with command:', startCommand);

  return new Promise((resolve, reject) => {
    serverProcess = exec(startCommand);

    if (serverProcess.stdout) {
      serverProcess.stdout.on('data', (data) => {
        console.log('Server output:', data);
      });
    }

    if (serverProcess.stderr) {
      serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data);
      });
    }

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      cleanupProcesses();
      reject(error);
    });

    serverProcess.on('exit', (code) => {
      console.log('Server process exited with code:', code);
      if (serverStatus.isRunning) {
        cleanupProcesses();
        serverStatus.isRunning = false;
        serverStatus.players = 0;
        serverStatus.uptime = '0:00:00';
      }
    });

    // Give the server a moment to start
    setTimeout(() => {
      serverStatus.isRunning = true;
      startTime = new Date();
      
      // Start uptime counter
      if (uptimeInterval) {
        clearInterval(uptimeInterval);
      }
      uptimeInterval = setInterval(updateUptime, 1000);
      
      setupRestartTimer();
      resolve(true);
    }, 2000);
  });
}

async function stopServer() {
  if (!serverStatus.isRunning) {
    throw new Error('Server is not running');
  }

  return new Promise((resolve, reject) => {
    exec('taskkill /IM DayZServer_x64.exe /F', (error) => {
      if (error) {
        console.error('Error stopping server:', error);
        reject(error);
        return;
      }

      cleanupProcesses();
      serverStatus.isRunning = false;
      serverStatus.players = 0;
      serverStatus.uptime = '0:00:00';
      startTime = null;
      resolve(true);
    });
  });
}

// Cleanup on process exit
process.on('exit', cleanupProcesses);
process.on('SIGINT', () => {
  cleanupProcesses();
  process.exit();
});

// API Endpoints
app.post('/api/server/start', async (_req, res) => {
  try {
    await startServer();
    res.json({ message: 'Server started successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start server' });
  }
});

app.post('/api/server/stop', async (_req, res) => {
  try {
    await stopServer();
    res.json({ message: 'Server stopped successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop server' });
  }
});

app.get('/api/server/status', (_req, res) => {
  res.json(serverStatus);
});

app.post('/api/server/config', (req, res) => {
  const newConfig: Partial<ServerConfig> = req.body;
  serverStatus.config = { ...serverStatus.config, ...newConfig };
  res.json(serverStatus.config);
});

app.post('/api/server/mods', (req, res) => {
  const { mods }: { mods: string[] } = req.body;
  serverStatus.config.mods = mods;
  res.json(serverStatus.config);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 