@echo off
echo Starting Dreamland Group Application...

echo Starting Node.js server...
start cmd /k npm run server

echo Starting frontend...
start cmd /k npm run dev

echo Both server and frontend are now running!
echo Server: http://localhost:3000
echo Frontend: http://localhost:5173

echo.
echo Open your browser and navigate to http://localhost:5173 to use the application.
