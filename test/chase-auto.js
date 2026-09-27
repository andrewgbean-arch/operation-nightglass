// A test autopilot for the bazaar chase: route to the hammam around the chasers, or flee them.
window.CHASE_AUTO = () => setInterval(() => {
  const C = BazaarChase; if (C.dead || C.done) return;
  const cx = Math.round(C.j.x), cy = Math.round(C.j.y);
  if (Math.abs(C.j.x - cx) + Math.abs(C.j.y - cy) > 0.15) return;
  const danger = (x, y) => C.chasers.some(c => c.wait <= 0.3 && Math.hypot(c.x - x, c.y - y) < 1.8);
  const [ex, ey] = C.find('E');
  const prev = {}, q = [[cx, cy]]; prev[cx + ',' + cy] = null;
  let found = false;
  while (q.length) {
    const [x, y] = q.shift();
    if (x === ex && y === ey) { found = true; break; }
    for (const [dx, dy] of Object.values(BC_DIRS)) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (!C.open(nx, ny) || k in prev || danger(nx, ny)) continue;
      prev[k] = x + ',' + y; q.push([nx, ny]);
    }
  }
  let step = null;
  if (found) { let k = ex + ',' + ey; while (prev[k] && prev[k] !== cx + ',' + cy) k = prev[k]; step = k.split(',').map(Number); }
  else { // flee: the open neighbour furthest from the nearest chaser
    let bv = -1;
    for (const [dx, dy] of Object.values(BC_DIRS)) { const nx = cx + dx, ny = cy + dy; if (!C.open(nx, ny)) continue; const v = Math.min(...C.chasers.map(c => Math.hypot(c.x - nx, c.y - ny))); if (v > bv) { bv = v; step = [nx, ny]; } }
  }
  if (!step) return;
  const dx = step[0] - cx, dy = step[1] - cy;
  C.j.want = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
}, 40);
