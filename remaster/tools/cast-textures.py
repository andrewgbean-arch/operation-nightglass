# Textures for the cast (Microsoft Rocketbox, MIT licence): shrunk for phones, specular turned
# into roughness, hair cards kept as PNG with alpha; then assets/cast/index.js, which imports
# every cast file so the bundler packs them. Run after tools/fbx2glb/run.js.
#   python3 tools/cast-textures.py <rocketbox checkout>
import sys, os, json
from PIL import Image

RB = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'cast')
spec = json.load(open(os.path.join(HERE, 'fbx2glb', 'cast.json')))

def textures(cid, folder):
    tex = os.path.join(RB, 'Assets/Avatars', folder, 'Textures')
    out = {}
    for f in sorted(os.listdir(tex)):
        base = os.path.splitext(f)[0]                        # m005_head_color
        part, kind = base.split('_')[1], base.split('_')[-1]  # head, color
        im = Image.open(os.path.join(tex, f))
        size = 2048 if (part == 'head' and kind == 'color') else (512 if part == 'opacity' else 1024)
        im = im.resize((size, size), Image.LANCZOS)
        if part == 'opacity':
            name = f'{cid}_opacity.png'; im.convert('RGBA').quantize(256, method=Image.FASTOCTREE).save(os.path.join(OUT, name), optimize=True)
            kind = 'color'
        elif kind == 'specular':                             # shiny where bright: roughness is the inverse
            g = im.convert('L').point(lambda v: int(255 * max(0.32, min(0.95, 0.95 - (v / 255) * 0.75))))
            name = f'{cid}_{part}_rough.jpg'; g.convert('RGB').save(os.path.join(OUT, name), quality=82); kind = 'rough'
        else:
            name = f'{cid}_{part}_{kind}.jpg'; im.convert('RGB').save(os.path.join(OUT, name), quality=86 if kind == 'color' else 90)
        out.setdefault(part, {})[kind] = name
    return out

manifest = {cid: textures(cid, folder) for cid, folder in spec['cast'].items()}
lines, entries = ['// Written by tools/cast-textures.py.'], []
for cid, parts in manifest.items():
    lines.append(f"import {cid}_glb from './{cid}.glb';")
    tex = []
    for part, maps in parts.items():
        for kind, name in maps.items():
            v = f'{cid}_{part}_{kind}'; lines.append(f"import {v} from './{name}';"); tex.append(f"'{part}_{kind}': {v}")
    entries.append(f"  {cid}: {{ glb: {cid}_glb, tex: {{ {', '.join(tex)} }} }},")
for s in spec['anims']: lines.append(f"import anim_{s} from './anim_{s}.glb';")
lines += ['export const ANIMS = { ' + ', '.join(f'{s}: anim_{s}' for s in spec['anims']) + ' };', 'export const CAST = {', *entries, '};', '']
open(os.path.join(OUT, 'index.js'), 'w').write('\n'.join(lines))
print(json.dumps(manifest))
