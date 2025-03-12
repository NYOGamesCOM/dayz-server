# DayZ Server Control Panel

A web-based control panel for managing your DayZ server with ease. Built with React, TypeScript, and Node.js.

## Screenshots

### Current Version
![DayZ Server Control Panel Main Interface](https://i.imgur.com/bUrCBBJ.png)
![DayZ Server Control Panel Settings](https://i.imgur.com/awdLHlU.png)

### Coming Soon
Here's a preview of what the final product will look like:

![DayZ Server Control Panel Dashboard](https://i.imgur.com/p4KhrSO.png)
![DayZ Server Control Panel Mod Management](https://i.imgur.com/2O23oz7.png)
![DayZ Server Control Panel Advanced Settings](https://i.imgur.com/qmFv5UG.png)
![DayZ Server Control Panel Server Logs](https://i.imgur.com/oJMsNPe.png)

## Features

- 🎮 Start/Stop server controls
- ⚙️ Server configuration management
- ⏱️ Auto-restart functionality
- ⏲️ Real-time server uptime monitoring
- 🔄 Server status monitoring
- 🛠️ Mod management (Work in Progress)

## Prerequisites

- Node.js (v14 or higher)
- DayZ Server files
- Windows OS

## Installation

1. Clone the repository:
```bash
git clone https://github.com/NYOGamesCOM/dayz-server.git
cd dayz-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
DAYZ_SERVER_PATH="C:\\Program Files (x86)\\Steam\\steamapps\\common\\DayZServer\\"
```

Adjust the `DAYZ_SERVER_PATH` to match your DayZ server installation directory.

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

3. Use the control panel to:
   - Start/Stop the DayZ server
   - Configure server settings
   - Monitor server status and uptime
   - Set up auto-restart intervals

## Configuration

The control panel allows you to configure:

- Server Name
- Server Directory
- Server Port
- Config File Path
- Profile Directory
- CPU Core Allocation
- Auto-restart Settings

## Mod Management

⚠️ **Note: Mod management features are currently under development (WIP)**

The mod management system will allow you to:
- Add/Remove mods
- Manage mod load order
- Auto-update mods (planned)
- Mod dependency handling (planned)

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 