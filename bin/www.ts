#!/usr/bin/env node

import http from 'http';

const app = require('../app.js');
const debug = require('debug')('ecomm:server');
const port = normalizePort(process.env.PORT ?? '3000');
app.set('port', port);

const server = http.createServer(app);
app.locals.runtime.configureServer(server);
server.on('error', onError);
server.on('listening', onListening);

async function startServer(): Promise<void> {
    try {
        await app.locals.runtime.start();
        server.listen(port);
    } catch (error) {
        app.locals.runtime.logger.fatal({ err: error }, 'runtime startup failed');
        process.exit(1);
    }
}

function normalizePort(value: string): number | string | false {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return value;
    return parsed >= 0 ? parsed : false;
}

function onError(error: NodeJS.ErrnoException): never | void {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
    if (error.code === 'EACCES') {
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
    }
    if (error.code === 'EADDRINUSE') {
        console.error(`${bind} is already in use`);
        process.exit(1);
    }
    throw error;
}

function onListening(): void {
    const address = server.address();
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address?.port}`;
    debug(`Listening on ${bind}`);
}

void startServer();
