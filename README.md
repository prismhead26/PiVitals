# PiVitals

**Raspberry Pi Health Monitoring Dashboard**

A real-time health monitoring application for Raspberry Pi 4 that displays CPU, memory, disk, and network metrics with beautiful charts and visualizations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Real-time Monitoring**: Updates every 3 seconds with live system metrics
- **CPU Metrics**: Usage percentage, temperature, frequency, and per-core statistics
- **Memory Metrics**: RAM and swap usage with visual representations
- **Disk Metrics**: Partition usage and I/O statistics
- **Network Metrics**: Interface statistics, bandwidth, and active connections
- **Process Monitor**: Top CPU and memory processes with counts by state
- **Service Monitor**: systemd service health, failures, and watched services
- **Security Overview**: Current sessions, recent logins, failed logins, and sudo activity
- **Beautiful UI**: Modern responsive dashboard with interactive charts
- **Lightweight**: Optimized for Raspberry Pi with minimal resource usage
- **Auto-restart**: Systemd service with automatic recovery

## Tech Stack

- **Backend**: Python 3 + Flask + psutil
- **Frontend**: React + Vite + Recharts
- **Deployment**: Gunicorn + systemd
- **Port**: 5001 (configurable)

## Screenshots

The dashboard displays:
- CPU usage with temperature monitoring and historical charts
- Memory usage with pie charts and progress bars
- Disk partitions with usage visualization
- Network interfaces with bandwidth tracking

## Requirements

- Raspberry Pi 4 (or compatible device)
- Raspberry Pi OS (Debian-based)
- Python 3.7+
- Node.js 16+
- 100MB free disk space

## Quick Start

### 1. Clone the Repository

```bash
cd ~
git clone https://github.com/prismhead26/PiVitals.git
cd PiVitals
```

### 2. Run Setup Script

```bash
./scripts/setup.sh
```

This script will:
- Install system dependencies (Python, Node.js)
- Create Python virtual environment
- Install backend dependencies
- Install frontend dependencies and build
- Create environment file
- Create log directory
- Install systemd service

### 3. Configure Environment (Optional)

Edit the `.env` file to customize settings:

```bash
nano .env
```

### 4. Start the Service

```bash
# Enable service to start on boot
sudo systemctl enable pivitals

# Start the service
sudo systemctl start pivitals

# Check status
sudo systemctl status pivitals
```

### 5. Access the Dashboard

Open your browser and navigate to:

```
http://<your-pi-ip>:5001
```

For example: `http://192.168.5.162:5001`

## Manual Setup

If you prefer to set up manually:

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# For development (with hot reload)
npm run dev

# For production (build static files)
npm run build
```

### Production Deployment

For production, copy the systemd service file and start the service:

```bash
# Create log directory
sudo mkdir -p /var/log/pivitals
sudo chown $USER:$USER /var/log/pivitals

# Copy service file
sudo cp systemd/pivitals.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start
sudo systemctl enable pivitals
sudo systemctl start pivitals
```

## Configuration

### Environment Variables

The `.env` file supports the following variables:

```bash
# Flask Configuration
FLASK_ENV=production              # development or production
FLASK_PORT=5001                   # Port to run on
FLASK_HOST=0.0.0.0               # Host to bind to

# CORS Origins (comma-separated)
CORS_ORIGINS=http://192.168.5.162:5173,http://localhost:5173

# Application Settings
METRICS_CACHE_SECONDS=1          # Cache duration for metrics
LOG_LEVEL=INFO                   # Logging level

# System Monitoring Settings
SYSTEM_CACHE_SECONDS=5           # Cache duration for system info
SYSTEM_PROCESS_LIMIT=10          # Top process count for CPU/memory lists
SYSTEM_SERVICE_LIMIT=15          # Max services returned for lists
SYSTEM_SECURITY_LIMIT=10         # Max login/failed/sudo rows
WATCHED_SERVICES=pivitals,ssh    # Comma-separated systemd services
```

### Systemd Service

The service is configured in `systemd/pivitals.service`:

- **Workers**: 2 Gunicorn workers
- **Threads**: 2 threads per worker
- **Auto-restart**: Service restarts automatically on failure
- **Logs**: `/var/log/pivitals/access.log` and `/var/log/pivitals/error.log`

## Usage

### Dashboard Controls

- **Pause/Resume**: Stop/start automatic updates
- **Refresh**: Manually refresh metrics
- **Connection Status**: Shows if backend is connected

### API Endpoints

The backend provides REST API endpoints:

- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics/cpu` - CPU metrics
- `GET /api/v1/metrics/memory` - Memory metrics
- `GET /api/v1/metrics/disk` - Disk metrics
- `GET /api/v1/metrics/network` - Network metrics
- `GET /api/v1/metrics/all` - All metrics (recommended)
- `GET /api/v1/system/processes` - Top processes and process summary
- `GET /api/v1/system/services` - systemd service summary and failures
- `GET /api/v1/system/security` - Logins, sessions, and auth events
- `GET /api/v1/system/overview` - All system info (recommended)

Example:

```bash
curl http://localhost:5001/api/v1/metrics/all
```

System example:

```bash
curl http://localhost:5001/api/v1/system/overview
```

## Monitoring & Logs

### View Service Status

```bash
sudo systemctl status pivitals
```

### View Logs

```bash
# Follow logs in real-time
sudo journalctl -u pivitals -f

# View last 100 lines
sudo journalctl -u pivitals -n 100

# View access logs
tail -f /var/log/pivitals/access.log

# View error logs
tail -f /var/log/pivitals/error.log
```

### Service Management

```bash
# Start service
sudo systemctl start pivitals

# Stop service
sudo systemctl stop pivitals

# Restart service
sudo systemctl restart pivitals

# Enable on boot
sudo systemctl enable pivitals

# Disable on boot
sudo systemctl disable pivitals
```

## Troubleshooting

### Service won't start

```bash
# Check logs for errors
sudo journalctl -u pivitals -n 50

# Common issues:
# - Port 5001 already in use
sudo lsof -i :5001

# - Virtual environment path incorrect
# Edit /etc/systemd/system/pivitals.service

# - Permissions issue
sudo chown -R pi:pi ~/PiVitals
```

### Dashboard shows connection error

```bash
# Check if backend is running
curl http://localhost:5001/api/v1/health

# Check CORS settings in .env
# Make sure frontend origin is in CORS_ORIGINS
```

### Security panel shows permission errors

The security view reads `/var/log/auth.log` or `/var/log/secure` and runs `who`/`last`.
On Raspberry Pi OS, the service user may need access to auth logs:

```bash
sudo usermod -a -G adm $USER
```

Then restart the service (or log out and back in for the group to apply).

### CPU temperature not showing

```bash
# Check thermal zone
cat /sys/class/thermal/thermal_zone0/temp

# If the path is different, update cpu_monitor.py
```

### High CPU usage from PiVitals

```bash
# Check current resource usage
top -p $(pgrep -f "gunicorn.*pivitals" | tr '\n' ',' | sed 's/,$//')

# Reduce workers in systemd service if needed
sudo nano /etc/systemd/system/pivitals.service
# Change --workers to 1
sudo systemctl daemon-reload
sudo systemctl restart pivitals
```

## Development

### Running in Development Mode

Backend:

```bash
cd backend
source venv/bin/activate
export FLASK_ENV=development
python app.py
```

Frontend:

```bash
cd frontend
npm run dev
```

Access at `http://localhost:5173` (Vite dev server proxies API calls to backend)

### Project Structure

```
PiVitals/
├── backend/
│   ├── app.py                 # Flask application
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   ├── monitors/              # Metric collection modules
│   └── routes/                # API endpoints
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API service
│   │   └── styles/            # CSS styles
│   ├── package.json
│   └── vite.config.js
├── systemd/
│   └── pivitals.service       # Systemd service file
└── scripts/
    ├── setup.sh               # Setup script
    └── deploy.sh              # Deployment script
```

## Deployment Updates

To deploy updates:

```bash
cd ~/PiVitals
git pull
./scripts/deploy.sh
```

This will:
1. Stop the service
2. Update backend and frontend dependencies
3. Build frontend
4. Restart the service

## Performance

Resource usage on Raspberry Pi 4:

- **Memory**: ~50-100 MB
- **CPU**: <5% idle, ~10-15% when serving requests
- **Disk**: ~20 MB + logs
- **Network**: Minimal (only API polling)

## Raspberry Pi Notes

- **systemd required**: Service monitoring uses `systemctl`.
- **Auth logs**: Security view needs read access to `/var/log/auth.log` or `/var/log/secure`.
- **Watched services**: Configure via `WATCHED_SERVICES` to highlight critical units.
- **Low power**: Keep `SYSTEM_CACHE_SECONDS` higher if you want less polling overhead.

## Security

- **Read-only metrics**: No system modification capabilities
- **CORS protection**: Restrict origins in production
- **No authentication**: Add authentication if exposing beyond local network
- **Rate limiting**: Consider adding Flask-Limiter for public exposure

## Future Enhancements

Potential features for future releases:

- GPU monitoring
- Process monitoring (top processes by CPU/memory)
- Service health checks (check other services like LockNest)
- Alert system (email/webhook notifications)
- Historical data persistence (SQLite database)
- Multi-device support (monitor multiple Pis)
- Custom threshold configuration
- Export metrics (CSV/JSON)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- UI powered by [React](https://react.dev/)
- Charts by [Recharts](https://recharts.org/)
- System metrics via [psutil](https://github.com/giampaolo/psutil)

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check the troubleshooting section above
- Review logs: `sudo journalctl -u pivitals -f`

---

**Made with ❤️ for Raspberry Pi**
