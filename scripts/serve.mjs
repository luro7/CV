import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { output, build } from './build.mjs';

const port = Number(process.env.PORT || 5081);
const host = process.env.HOST || '127.0.0.1';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon' };
build();
const server = createServer(async (request, response) => {
    response.setHeader('X-Landing-Preview', 'lucas-rosat-cv');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
    }
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const file = resolve(output, '.' + (pathname === '/' ? '/index.html' : pathname));
        const location = relative(output, file);
        if (location.startsWith('..') || isAbsolute(location) || pathname.includes('\\') || pathname.includes('\0')) {
            response.writeHead(403); response.end(); return;
        }
        if (!(await stat(file)).isFile()) throw new Error('Not a file');
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        response.end(request.method === 'HEAD' ? undefined : await readFile(file));
    } catch {
        if (!response.headersSent) response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Recurso no encontrado');
    }
});
server.on('error', error => { console.error('No se pudo iniciar la vista local: ' + error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`Web estática: http://localhost:${port}/ — Ctrl+C para cerrar.`));
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
