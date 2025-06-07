const { spawn } = require('child_process');
const path = require('path');

// Function to start a server
function startServer(command, args, options) {
    const server = spawn(command, args, options);
    
    server.stdout.on('data', (data) => {
        console.log(`${options.name}: ${data}`);
    });
    
    server.stderr.on('data', (data) => {
        console.error(`${options.name}: ${data}`);
    });
    
    server.on('close', (code) => {
        console.log(`${options.name} process exited with code ${code}`);
    });
    
    return server;
}

// Start backend server
const backend = startServer('node', ['backend/server.js'], {
    name: 'Backend',
    cwd: process.cwd()
});

// Start frontend server using Python's built-in HTTP server
const frontend = startServer('python', ['-m', 'http.server', '8000'], {
    name: 'Frontend',
    cwd: path.join(process.cwd(), 'frontend')
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit();
}); 