import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

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

function App() {
  const [status, setStatus] = useState<ServerStatus>({
    isRunning: false,
    players: 0,
    uptime: '0:00:00',
    config: {
      serverName: '',
      serverDirectory: '',
      serverPort: 2302,
      serverConfig: '',
      serverProfile: '',
      serverCPU: 2,
      mods: [],
      autoRestart: true,
      restartInterval: 14400
    }
  });
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newMod, setNewMod] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/server/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching server status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartServer = async () => {
    setLoading(true);
    try {
      await axios.post('/api/server/start');
      await fetchStatus();
    } catch (error) {
      console.error('Error starting server:', error);
    }
    setLoading(false);
  };

  const handleStopServer = async () => {
    setLoading(true);
    try {
      await axios.post('/api/server/stop');
      await fetchStatus();
    } catch (error) {
      console.error('Error stopping server:', error);
    }
    setLoading(false);
  };

  const handleConfigChange = async (newConfig: Partial<ServerConfig>) => {
    try {
      const response = await axios.post('/api/server/config', newConfig);
      setStatus(prev => ({ ...prev, config: response.data }));
      setConfigError(null);
    } catch (error) {
      console.error('Error updating config:', error);
      setConfigError('Failed to update configuration');
    }
  };

  const handleAddMod = async () => {
    if (!newMod) return;
    const updatedMods = [...status.config.mods, newMod];
    try {
      await axios.post('/api/server/mods', { mods: updatedMods });
      setNewMod('');
      await fetchStatus();
    } catch (error) {
      console.error('Error adding mod:', error);
    }
  };

  const handleRemoveMod = async (modToRemove: string) => {
    const updatedMods = status.config.mods.filter(mod => mod !== modToRemove);
    try {
      await axios.post('/api/server/mods', { mods: updatedMods });
      await fetchStatus();
    } catch (error) {
      console.error('Error removing mod:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {status.config.serverName || 'DayZ Server Control Panel'}
          </Typography>
          <IconButton onClick={() => setSettingsOpen(true)} disabled={status.isRunning}>
            <Tooltip title={status.isRunning ? "Stop the server to modify settings" : "Server Settings"}>
              <SettingsIcon />
            </Tooltip>
          </IconButton>
        </Box>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Status</Typography>
              <Typography variant="body1" color={status.isRunning ? 'success.main' : 'error.main'}>
                {status.isRunning ? 'Running' : 'Stopped'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Players</Typography>
              <Typography variant="body1">{status.players}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Uptime</Typography>
              <Typography variant="body1">{status.uptime}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Port</Typography>
              <Typography variant="body1">{status.config.serverPort}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Active Mods ({status.config.mods.length})</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {status.config.mods.map((mod) => (
              <Chip
                key={mod}
                label={mod}
                onDelete={() => !status.isRunning && handleRemoveMod(mod)}
                disabled={status.isRunning}
              />
            ))}
          </Box>
          {!status.isRunning && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                label="Add Mod"
                value={newMod}
                onChange={(e) => setNewMod(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMod()}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddMod}
                disabled={!newMod}
              >
                Add
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayIcon />}
            onClick={handleStartServer}
            disabled={status.isRunning || loading}
          >
            Start Server
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStopServer}
            disabled={!status.isRunning || loading}
          >
            Stop Server
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStatus}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Server Settings</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Server Name"
                  value={status.config.serverName}
                  onChange={(e) => handleConfigChange({ serverName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Server Directory"
                  value={status.config.serverDirectory}
                  onChange={(e) => handleConfigChange({ serverDirectory: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Server Port"
                  value={status.config.serverPort}
                  onChange={(e) => handleConfigChange({ serverPort: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="CPU Cores"
                  value={status.config.serverCPU}
                  onChange={(e) => handleConfigChange({ serverCPU: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Config File"
                  value={status.config.serverConfig}
                  onChange={(e) => handleConfigChange({ serverConfig: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Profile Directory"
                  value={status.config.serverProfile}
                  onChange={(e) => handleConfigChange({ serverProfile: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={status.config.autoRestart}
                      onChange={(e) => handleConfigChange({ autoRestart: e.target.checked })}
                    />
                  }
                  label="Auto Restart"
                />
              </Grid>
              {status.config.autoRestart && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Restart Interval (seconds)"
                    value={status.config.restartInterval}
                    onChange={(e) => handleConfigChange({ restartInterval: parseInt(e.target.value) })}
                  />
                </Grid>
              )}
            </Grid>
            {configError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {configError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default App; 