# Pulls every spoken line (speaker id + text) out of the game scripts, so each
# can be pre-recorded. Speaker variables are resolved from the nearest
# `x = actor('id')` / `{ id: 'id' }` assignment before the say() call.
import json, re, sys
src = {f: open(f).read() for f in ['src/js/story.js', 'src/js/main.js', 'src/js/engine.js']}
STR = r"'((?:[^'\\]|\\.)*)'"
def unesc(t): return t.replace("\\'", "'").replace('\\"', '"')
lines = []
def add(who, text):
    if (who, text) not in lines: lines.append((who, text))
def split_args(s, i):
    # s[i] is just after "say(": return list of top-level argument strings and end index
    depth, args, cur, q = 0, [], '', None
    while i < len(s):
        c = s[i]
        if q:
            cur += c
            if c == '\\': cur += s[i + 1]; i += 1
            elif c == q: q = None
        elif c in "'`\"": q = c; cur += c
        elif c in '([{': depth += 1; cur += c
        elif c in ')]}':
            if depth == 0: args.append(cur); return args
            depth -= 1; cur += c
        elif c == ',' and depth == 0: args.append(cur); cur = ''
        else: cur += c
        i += 1
    return args
for f, s in src.items():
    for m in re.finditer(r"\b(say|think)\(", s):
        args = split_args(s, m.end())
        if m.group(1) == 'think':
            if s[m.start()-9:m.start()] == 'function ' or not args: continue
            args = ['G.jack', args[0]]
        if len(args) < 2: continue
        who, body = args[0].strip(), args[1]
        if who == 'G.jack': sp = 'jack'
        elif who.startswith("'"): sp = who.strip("'")
        elif who.startswith('actor('):
            mm = re.match(r"actor\('(\w+)'\)", who)
            if not mm: continue
            sp = mm.group(1)
        elif who in ('who', 'fig'): continue
        else:
            before = s[:m.start()]
            cands = [(mm.start(), mm.group(1) or mm.group(2) or mm.group(3)) for mm in re.finditer(r"\b" + re.escape(who) + r"\s*=\s*(?:actor\('(\w+)'\)|makeFigure\('\w+'[^;]*?id: '(\w+)'|G\.(jack))", before)]
            if not cands: print('UNRESOLVED', who, body[:50], file=sys.stderr); continue
            sp = cands[-1][1]
        body = re.sub(r"(flag|actor|has|ITEMS)\(\s*'[^']*'\s*\)", '', body)
        for t in re.findall(STR, body): add(sp, unesc(t))
# item descriptions are spoken by Jack
for m in re.finditer(r"desc: " + STR, src['src/js/story.js']): add('jack', unesc(m.group(1)))
# intro / outro pages are narrated
for m in re.finditer(r"\{ kicker: [^}]*?text: " + STR, src['src/js/main.js']): add('narrator', unesc(m.group(1)))
json.dump([{'id': a, 'text': b} for a, b in lines], open('tools/lines.json', 'w'), indent=1, ensure_ascii=False)
from collections import Counter
print(len(lines), 'lines', sum(len(t) for _, t in lines), 'chars'); print(Counter(a for a, _ in lines))
