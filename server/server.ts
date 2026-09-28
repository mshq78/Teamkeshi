/**
 * Teamkeshi sync server — zero dependencies (node:http only).
 *
 * The same server runs in both setups:
 * - online:  on a VPS behind HTTPS (the default setup)
 * - offline: on the operator's laptop, phones join the laptop's hotspot
 *
 * It serves the built app (dist/) and a small JSON API. State lives in
 * DATA_DIR/state.json (atomic writes) with rolling backups.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';
import { AppState } from '../src/store/state';
import {
  JudgeOp,
  applyJudgeOps,
  isAppStateLike,
  mergeOperatorState,
  redactForJudge,
} from '../src/sync/merge';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.resolve(process.env.DATA_DIR || 'data');
const STATIC_DIR = path.resolve(process.env.STATIC_DIR || 'dist');
const MODE = process.env.MODE === 'offline' || process.argv.includes('--offline') ? 'offline' : 'online';
const MAX_BODY = 5 * 1024 * 1024;
const BACKUP_EVERY_MS = 5 * 60 * 1000;
const BACKUPS_TO_KEEP = 60;

fs.mkdirSync(path.join(DATA_DIR, 'backups'), { recursive: true });

// ---------------------------------------------------------------- admin key
function loadAdminKey(): string {
  if (process.env.ADMIN_KEY && process.env.ADMIN_KEY.length >= 12) return process.env.ADMIN_KEY;
  const file = path.join(DATA_DIR, 'admin-key.txt');
  try {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing.length >= 12) return existing;
  } catch {
    // create below
  }
  const key = crypto.randomBytes(12).toString('base64url');
  fs.writeFileSync(file, key + '\n', { mode: 0o600 });
  return key;
}
const ADMIN_KEY = loadAdminKey();

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

// ---------------------------------------------------------------- state
const STATE_FILE = path.join(DATA_DIR, 'state.json');
let state: AppState | null = null;
let rev = 0;
let seededFrom: string | null = null;

/** Identifies this data folder, so browsers never push leftovers meant for another server. */
const INSTANCE_FILE = path.join(DATA_DIR, 'instance-id.txt');
let INSTANCE_ID = '';
try {
  INSTANCE_ID = fs.readFileSync(INSTANCE_FILE, 'utf8').trim();
} catch {
  // created below
}
if (!INSTANCE_ID) {
  INSTANCE_ID = crypto.randomBytes(8).toString('hex');
  fs.writeFileSync(INSTANCE_FILE, INSTANCE_ID + '\n');
}

try {
  const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  if (isAppStateLike(saved.state)) {
    state = saved.state;
    rev = Number(saved.rev) || 1;
  }
} catch {
  // first run
}

/**
 * Offline fallback: seed an empty laptop server from a backup file the
 * operator downloaded from the online app («پشتیبان → دانلود فایل پشتیبان»).
 * Uses --seed <file>, or the newest teamkeshi-backup-*.json in Downloads.
 */
function findSeedFile(): string | null {
  const idx = process.argv.indexOf('--seed');
  if (idx !== -1 && process.argv[idx + 1]) return path.resolve(process.argv[idx + 1]);
  if (MODE !== 'offline') return null;
  const dirs = [path.join(os.homedir(), 'Downloads'), process.cwd()];
  let best: { file: string; mtime: number } | null = null;
  for (const dir of dirs) {
    let names: string[] = [];
    try {
      names = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!/^teamkeshi-backup-.*\.json$/.test(name)) continue;
      const file = path.join(dir, name);
      const mtime = fs.statSync(file).mtimeMs;
      if (!best || mtime > best.mtime) best = { file, mtime };
    }
  }
  return best ? best.file : null;
}

if (!state) {
  const seedFile = findSeedFile();
  if (seedFile) {
    try {
      const parsed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
      if (isAppStateLike(parsed)) {
        state = parsed;
        rev = 1;
        seededFrom = seedFile;
      }
    } catch {
      console.warn(`Could not read backup file: ${seedFile}`);
    }
  }
}

let persistTimer: NodeJS.Timeout | null = null;
function persistSoon() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistNow();
  }, 200);
}
function persistNow() {
  if (!state) return;
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ rev, state }));
  fs.renameSync(tmp, STATE_FILE);
}

let lastBackupRev = -1;
setInterval(() => {
  if (!state || rev === lastBackupRev) return;
  lastBackupRev = rev;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(path.join(DATA_DIR, 'backups', `state-${stamp}.json`), JSON.stringify({ rev, state }));
  const files = fs.readdirSync(path.join(DATA_DIR, 'backups')).sort();
  for (const f of files.slice(0, Math.max(0, files.length - BACKUPS_TO_KEEP))) {
    fs.rmSync(path.join(DATA_DIR, 'backups', f), { force: true });
  }
}, BACKUP_EVERY_MS).unref();

function commit(next: AppState) {
  if (next === state) return;
  state = next;
  rev += 1;
  persistSoon();
}

// ---------------------------------------------------------------- login throttle
const failures = new Map<string, { count: number; until: number }>();
function isBlocked(ip: string): boolean {
  const f = failures.get(ip);
  return !!f && f.count >= 8 && f.until > Date.now();
}
function recordFailure(ip: string) {
  const f = failures.get(ip);
  const now = Date.now();
  if (!f || f.until < now) failures.set(ip, { count: 1, until: now + 60_000 });
  else f.count += 1;
}

// ---------------------------------------------------------------- helpers
function lanUrls(): string[] {
  const urls: string[] = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) {
      if (i.family === 'IPv4' && !i.internal) urls.push(`http://${i.address}:${PORT}`);
    }
  }
  return urls;
}

function send(res: http.ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(json);
}

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('too_large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new Error('bad_json'));
      }
    });
    req.on('error', reject);
  });
}

function isAdmin(req: http.IncomingMessage): boolean {
  const key = req.headers['x-admin-key'];
  return typeof key === 'string' && safeEqual(key, ADMIN_KEY);
}

function judgeFromCode(code: unknown): string | null {
  if (!state || typeof code !== 'string') return null;
  const judge = state.scoring.judges.find((j) => safeEqual(j.accessCode, code.trim()));
  return judge ? judge.id : null;
}

function clientIp(req: http.IncomingMessage): string {
  const remote = req.socket.remoteAddress || 'unknown';
  // Behind a local reverse proxy (Caddy/nginx) every request comes from
  // loopback; use the forwarded client address so one person's typos don't
  // lock out every judge.
  const forwarded = req.headers['x-forwarded-for'];
  const isLoopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
  if (isLoopback && typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return remote;
}

// ---------------------------------------------------------------- static files
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse) {
  const urlPath = decodeURIComponent(new URL(req.url || '/', 'http://x').pathname);
  let file = path.normalize(path.join(STATIC_DIR, urlPath));
  if (file !== STATIC_DIR && !file.startsWith(STATIC_DIR + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    // SPA fallback
    file = path.join(STATIC_DIR, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('dist/ not found — run `npm run build` first.');
      return;
    }
  }
  const ext = path.extname(file);
  const immutable = file.includes(`${path.sep}assets${path.sep}`);
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  fs.createReadStream(file).pipe(res);
}

// ---------------------------------------------------------------- API
async function handleApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
  const route = `${req.method} ${url.pathname}`;
  const sinceRev = Number(url.searchParams.get('rev'));

  if (route === 'GET /api/health') {
    return send(res, 200, { ok: true, mode: MODE, rev, ready: !!state, instanceId: INSTANCE_ID });
  }

  // ---- operator (admin)
  if (url.pathname === '/api/state' || url.pathname === '/api/info') {
    if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });

    if (route === 'GET /api/info') {
      return send(res, 200, { mode: MODE, lanUrls: lanUrls(), port: PORT });
    }
    if (route === 'GET /api/state') {
      if (!state) return send(res, 200, { rev, state: null });
      if (sinceRev === rev) return send(res, 200, { rev, unchanged: true });
      return send(res, 200, { rev, state });
    }
    if (route === 'PUT /api/state') {
      const body = (await readBody(req)) as { state?: unknown };
      if (!isAppStateLike(body.state)) return send(res, 400, { error: 'invalid_state' });
      commit(state ? mergeOperatorState(state, body.state) : body.state);
      return send(res, 200, { rev, state });
    }
  }

  // ---- judges
  if (route === 'POST /api/judge/login') {
    const ip = clientIp(req);
    if (isBlocked(ip)) return send(res, 429, { error: 'too_many_attempts' });
    if (!state) return send(res, 503, { error: 'not_ready' });
    const body = (await readBody(req)) as { code?: unknown };
    const judgeId = judgeFromCode(body.code);
    if (!judgeId) {
      recordFailure(ip);
      return send(res, 401, { error: 'invalid_code' });
    }
    failures.delete(ip);
    return send(res, 200, { judgeId, rev, state: redactForJudge(state, judgeId) });
  }

  if (url.pathname === '/api/judge/state' || url.pathname === '/api/judge/ops') {
    if (!state) return send(res, 503, { error: 'not_ready' });
    const judgeId = judgeFromCode(req.headers['x-judge-code']);
    if (!judgeId) return send(res, 401, { error: 'invalid_code' });

    if (route === 'GET /api/judge/state') {
      if (sinceRev === rev) return send(res, 200, { rev, unchanged: true });
      return send(res, 200, { rev, state: redactForJudge(state, judgeId) });
    }
    if (route === 'POST /api/judge/ops') {
      const body = (await readBody(req)) as { ops?: unknown };
      if (!Array.isArray(body.ops)) return send(res, 400, { error: 'invalid_ops' });
      commit(applyJudgeOps(state, judgeId, body.ops as JudgeOp[]));
      return send(res, 200, { rev, state: redactForJudge(state, judgeId) });
    }
  }

  return send(res, 404, { error: 'not_found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else serveStatic(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'error';
    if (!res.headersSent) send(res, msg === 'too_large' ? 413 : 400, { error: msg });
  }
});

function shutdown() {
  if (persistTimer) clearTimeout(persistTimer);
  persistNow();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, HOST, () => {
  const line = '─'.repeat(60);
  console.log(line);
  console.log(`  Teamkeshi server (${MODE === 'offline' ? 'OFFLINE / laptop' : 'online'}) — port ${PORT}`);
  console.log(line);
  console.log(`  Operator (open on THIS laptop):  http://localhost:${PORT}/?admin=${ADMIN_KEY}`);
  for (const u of lanUrls()) {
    console.log(`  Judges on the same Wi-Fi:        ${u}/?judge=1`);
  }
  console.log(`  Data folder: ${DATA_DIR}`);
  if (seededFrom) console.log(`  Loaded event data from backup: ${seededFrom}`);
  else if (!state) console.log('  No event data yet: the operator page will upload its data on first open.');
  console.log(line);
  if (seededFrom) persistNow();

  if (process.argv.includes('--open')) {
    const url = `http://localhost:${PORT}/?admin=${ADMIN_KEY}`;
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd, () => undefined);
  }
});
