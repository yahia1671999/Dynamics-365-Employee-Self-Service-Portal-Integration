# Dynamics 365 Employee Self-Service Portal Integration

This repository contains the React/Vite frontend, Node/Express application server, and ASP.NET Core backend used for the Dynamics 365 Employee Self-Service integration.

## Windows quick start

> Run all commands from the **project root** (the folder that contains `package.json`). Do **not** run `npm run dev` from inside `src`.

### Option 1 — Recommended

Double-click:

`START-WINDOWS.bat`

The script checks Node/npm, installs dependencies when `node_modules` is missing, then starts the application.

### Option 2 — Command Prompt / PowerShell

```bat
cd C:\Paradise-ESS
npm install
npm run dev
```

After the first successful install, future starts only need:

```bat
cd C:\Paradise-ESS
npm run dev
```

## If you see: 'vite' is not recognized

That means the local npm dependencies have not been installed correctly.

From the project root run:

```bat
cd C:\Paradise-ESS
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

Normally you should **not delete `package-lock.json`**. Use the commands above only when the local installation is already corrupted. For a clean clone/download of this repository, use:

```bat
npm ci
npm run dev
```

## Useful commands

```bat
npm run dev
npm run dev:frontend
npm run build
npm run lint
npm run verify
```

- `npm run dev` starts the integrated Node/Express application using `server.ts`.
- `npm run dev:frontend` starts Vite directly on port 3000.
- `npm run verify` runs TypeScript validation followed by a production build.

## ASP.NET Core backend

The .NET project is located at:

`backend/D365.Ess.Api.csproj`

To run it separately:

```bat
cd backend
dotnet restore
dotnet run
```

## Prerequisites

- Node.js 20+ recommended
- npm
- .NET SDK compatible with `backend/D365.Ess.Api.csproj`
