# Renders photo-style close-ups of the examinable objects with Blender Cycles.
#   python3 tools/photos.py <out_dir> [samples] [only_name]
# Everything is modelled procedurally: no downloaded models or textures.
import bpy, math, sys, os, random
from mathutils import Vector

OUT = sys.argv[1] if len(sys.argv) > 1 else 'photos'
SAMPLES = int(sys.argv[2]) if len(sys.argv) > 2 else 96
ONLY = sys.argv[3] if len(sys.argv) > 3 else None
RES = 720
os.makedirs(OUT, exist_ok=True)


# ---------------------------------------------------------------- helpers ----
def reset(world=(0.01, 0.012, 0.016), strength=1.0, exposure=-0.7):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.render.resolution_x = sc.render.resolution_y = RES
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 84
    try:
        sc.view_settings.view_transform = 'AgX'
        sc.view_settings.look = 'AgX - Medium High Contrast'
        sc.view_settings.exposure = exposure
    except Exception:
        sc.view_settings.view_transform = 'Filmic'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (*world, 1); bg.inputs[1].default_value = strength
    return sc


def mat(name, color=(0.5, 0.5, 0.5), rough=0.5, metal=0.0, coat=0.0, trans=0.0, emit=None, es=0.0,
        ior=1.45, bump=None, aniso=0.0, sheen=0.0, sss=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['IOR'].default_value = ior
    for k, v in (('Coat Weight', coat), ('Transmission Weight', trans), ('Anisotropic', aniso), ('Sheen Weight', sheen), ('Subsurface Weight', sss)):
        if k in p.inputs: p.inputs[k].default_value = v
    if emit:
        p.inputs['Emission Color'].default_value = (*emit, 1)
        p.inputs['Emission Strength'].default_value = es
    if alpha < 1: p.inputs['Alpha'].default_value = alpha
    if bump:
        scale, strength, kind = bump
        tex = nt.nodes.new('ShaderNodeTexNoise' if kind == 'noise' else 'ShaderNodeTexWave')
        if kind == 'noise':
            tex.inputs['Scale'].default_value = scale; tex.inputs['Detail'].default_value = 8
        else:
            tex.inputs['Scale'].default_value = scale; tex.inputs['Distortion'].default_value = 6
        b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = strength
        nt.links.new(tex.outputs['Fac'] if 'Fac' in tex.outputs else tex.outputs[0], b.inputs['Height'])
        nt.links.new(b.outputs['Normal'], p.inputs['Normal'])
    return m


def ramp_mat(name, kind, scale, stops, rough=0.5, coat=0.0, bump=0.1, detail=6, distortion=0.0, coords='Object', vector=None):
    """A material whose colour comes from a noise/wave texture through a colour ramp."""
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    p.inputs['Roughness'].default_value = rough
    if 'Coat Weight' in p.inputs: p.inputs['Coat Weight'].default_value = coat
    tex = nt.nodes.new({'noise': 'ShaderNodeTexNoise', 'wave': 'ShaderNodeTexWave', 'voronoi': 'ShaderNodeTexVoronoi'}[kind])
    tex.inputs['Scale'].default_value = scale
    if kind == 'noise': tex.inputs['Detail'].default_value = detail; tex.inputs['Distortion'].default_value = distortion
    if kind == 'wave': tex.inputs['Distortion'].default_value = distortion; tex.inputs['Detail'].default_value = detail
    tc = nt.nodes.new('ShaderNodeTexCoord')
    if vector:
        mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = vector
        nt.links.new(tc.outputs[coords], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], tex.inputs['Vector'])
    else:
        nt.links.new(tc.outputs[coords], tex.inputs['Vector'])
    cr = nt.nodes.new('ShaderNodeValToRGB')
    els = cr.color_ramp.elements
    els[0].position, els[0].color = stops[0][0], (*stops[0][1], 1)
    els[1].position, els[1].color = stops[-1][0], (*stops[-1][1], 1)
    for pos, col in stops[1:-1]:
        e = els.new(pos); e.color = (*col, 1)
    fac = tex.outputs['Fac'] if 'Fac' in tex.outputs else tex.outputs['Distance']
    nt.links.new(fac, cr.inputs['Fac'])
    nt.links.new(cr.outputs['Color'], p.inputs['Base Color'])
    if bump:
        b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = bump
        nt.links.new(fac, b.inputs['Height']); nt.links.new(b.outputs['Normal'], p.inputs['Normal'])
    return m


def obj(o, m=None, bevel=0.0, seg=3, sub=0, smooth=True):
    if m: o.data.materials.append(m)
    if bevel:
        b = o.modifiers.new('bev', 'BEVEL'); b.width = bevel; b.segments = seg; b.limit_method = 'ANGLE'
    if sub:
        s = o.modifiers.new('sub', 'SUBSURF'); s.levels = sub; s.render_levels = sub
    if smooth and hasattr(o.data, 'polygons'):
        for poly in o.data.polygons: poly.use_smooth = True
    return o


def cube(loc, size, m=None, bevel=0.0, rot=(0, 0, 0), **k):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object; o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    return obj(o, m, bevel, **k)


def cyl(loc, r, depth, m=None, bevel=0.0, rot=(0, 0, 0), verts=64, **k):
    bpy.ops.mesh.primitive_cylinder_add(location=loc, radius=r, depth=depth, rotation=rot, vertices=verts)
    return obj(bpy.context.object, m, bevel, **k)


def sphere(loc, r, m=None, scale=(1, 1, 1), sub=0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc, radius=r, segments=48, ring_count=24, rotation=rot)
    o = bpy.context.object; o.scale = scale
    return obj(o, m, sub=sub)


def torus(loc, R, r, m=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=R, minor_radius=r, rotation=rot, major_segments=96, minor_segments=24)
    return obj(bpy.context.object, m)


def plane(loc, size, m=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(location=loc, rotation=rot, size=1)
    o = bpy.context.object; o.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(scale=True)
    return obj(o, m, smooth=False)


def text(body, loc, size, m, rot=(0, 0, 0), extrude=0.0, font_mono=True):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    t = bpy.context.object; t.data.body = body; t.data.size = size; t.data.extrude = extrude
    t.data.align_x = 'LEFT'
    t.data.materials.append(m)
    return t


def backdrop(m, y=2.0, z=-0.001, w=12):
    # an infinite sweep: floor curving up into a wall
    bpy.ops.mesh.primitive_plane_add(size=w, location=(0, 0, z))
    o = bpy.context.object
    return obj(o, m, smooth=False)


def look_at(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def camera(loc, target, lens=85, fstop=2.2, focus=None):
    bpy.ops.object.camera_add(location=loc)
    c = bpy.context.object; look_at(c, target)
    c.data.lens = lens
    c.data.dof.use_dof = True
    c.data.dof.aperture_fstop = fstop
    c.data.dof.focus_distance = focus or (Vector(target) - Vector(loc)).length
    bpy.context.scene.camera = c
    return c


def light(kind, loc, target, energy, color=(1, 0.85, 0.7), size=1.0):
    bpy.ops.object.light_add(type=kind, location=loc)
    l = bpy.context.object; look_at(l, target)
    l.data.energy = energy; l.data.color = color
    if kind == 'AREA': l.data.size = size
    if kind in ('POINT', 'SPOT'): l.data.shadow_soft_size = size
    return l


def bokeh(n, center, spread, color, strength, rmin=0.02, rmax=0.06, seed=1, soft=1.0):
    # out-of-focus light points far behind the subject
    random.seed(seed)
    m = mat('bokeh%d' % seed, (0, 0, 0), emit=color, es=strength)
    for i in range(n):
        p = (center[0] + (random.random() - 0.5) * spread[0], center[1] + (random.random() - 0.5) * spread[1], center[2] + (random.random() - 0.5) * spread[2])
        sphere(p, (rmin + random.random() * (rmax - rmin)) * soft, m)


def render(name):
    path = os.path.abspath(os.path.join(OUT, name + '.jpg'))
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print('rendered', path, flush=True)


# ---------------------------------------------------------------- materials ----
def wood(dark=False):
    c1, c2 = ((0.03, 0.013, 0.006), (0.055, 0.024, 0.01)) if dark else ((0.1, 0.045, 0.018), (0.16, 0.075, 0.03))
    return ramp_mat('wood', 'wave', 1.2, [(0, c1), (0.5, c2), (1, c1)], rough=0.3, coat=0.5, bump=0.02, distortion=2.5, detail=10, vector=(1, 14, 1))


def velvet(col):
    return mat('velvet', col, rough=0.9, sheen=1.0, bump=(60, 0.08, 'noise'))


# ================================================================ OBJECTS ====
def chocolates():
    reset((0.02, 0.015, 0.012), 0.3, -1.1)
    backdrop(mat('pillow', (0.42, 0.4, 0.37), rough=0.85, sheen=0.6, bump=(18, 0.25, 'noise')))
    box = mat('box', (0.55, 0.42, 0.18), rough=0.35, metal=0.6)
    cube((0, 0, 0.03), (0.34, 0.24, 0.06), box, bevel=0.004)
    cube((0, 0, 0.061), (0.32, 0.22, 0.004), mat('tray', (0.35, 0.03, 0.04), rough=0.4))
    gold = mat('gold', (0.9, 0.62, 0.22), rough=0.18, metal=1.0, bump=(55, 0.9, 'noise'))
    red = mat('red', (0.6, 0.03, 0.04), rough=0.2, metal=1.0, bump=(55, 0.9, 'noise'))
    for ix in range(3):
        for iy in range(2):
            if (ix, iy) == (2, 0): continue
            sphere((-0.1 + ix * 0.1, -0.05 + iy * 0.1, 0.105), 0.045, red if (ix + iy) % 2 else gold, sub=1)
    choc = mat('choc', (0.05, 0.02, 0.01), rough=0.25, coat=0.3)
    sphere((0.22, -0.16, 0.042), 0.042, choc, sub=1)
    # half of a cut chocolate showing marzipan and nougat
    sphere((0.08, -0.22, 0.03), 0.04, choc, scale=(1, 1, 0.7))
    cyl((0.08, -0.22, 0.058), 0.034, 0.004, mat('marzipan', (0.35, 0.55, 0.2), rough=0.6))
    cyl((0.08, -0.22, 0.061), 0.02, 0.004, mat('nougat', (0.45, 0.25, 0.1), rough=0.6))
    foil = bpy.data.materials['gold']
    cyl((0.3, -0.05, 0.004), 0.06, 0.006, foil, verts=9)
    camera((0.55, -0.75, 0.42), (0.04, -0.06, 0.05), lens=70, fstop=2.0)
    light('SPOT', (-0.5, -0.4, 0.9), (0, 0, 0), 60, (1, 0.8, 0.6), 0.2)
    light('AREA', (0.6, 0.8, 0.5), (0, 0, 0), 12, (0.6, 0.7, 1.0), 0.6)
    render('chocolates')


def cassette():
    reset((0.01, 0.012, 0.016), 0.3, -1.0)
    backdrop(velvet((0.008, 0.04, 0.022)))
    brushed = mat('brushed', (0.65, 0.66, 0.68), rough=0.28, metal=1.0, aniso=0.8, bump=(400, 0.05, 'noise'))
    black = mat('blackplastic', (0.02, 0.02, 0.022), rough=0.35)
    body = cube((0, 0, 0.018), (0.14, 0.09, 0.034), brushed, bevel=0.006)
    cube((0.0, -0.005, 0.0355), (0.1, 0.06, 0.002), mat('window', (0.05, 0.05, 0.06), rough=0.05, trans=0.6, ior=1.5))
    # cassette visible through the window: two reels
    for x in (-0.024, 0.024):
        cyl((x, -0.005, 0.034), 0.011, 0.002, mat('reel%d' % int(x * 100), (0.9, 0.9, 0.88), rough=0.4))
        cyl((x, -0.005, 0.0352), 0.004, 0.002, black)
    for i in range(5):
        cube((-0.05 + i * 0.022, 0.048, 0.03), (0.016, 0.008, 0.01), black if i != 3 else mat('rec', (0.6, 0.05, 0.05), rough=0.4), bevel=0.001)
    cube((0.062, -0.02, 0.018), (0.008, 0.03, 0.02), black, bevel=0.002)
    # headphones: band + orange foam ear pads
    torus((-0.02, -0.16, 0.006), 0.075, 0.004, brushed, rot=(0, 0, 0))
    foam = mat('foam', (1.0, 0.32, 0.02), rough=1.0, sheen=1.0, bump=(250, 0.6, 'noise'))
    for x in (-0.095, 0.055):
        sphere((x, -0.16, 0.016), 0.024, foam, scale=(1, 1, 0.65), sub=1)
    # coiled cable
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    cu = bpy.context.object; cu.data.bevel_depth = 0.0018
    sp = cu.data.splines[0]; sp.bezier_points.add(3)
    for i, (x, y) in enumerate([(0.07, -0.01), (0.12, -0.08), (0.05, -0.14), (0.04, -0.16)]):
        bp = sp.bezier_points[i]; bp.co = (x, y, 0.004); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.data.materials.append(black)
    # a handwritten cassette tape
    tape = cube((0.13, 0.09, 0.006), (0.1, 0.064, 0.012), mat('tape', (0.05, 0.05, 0.05), rough=0.3), bevel=0.002, rot=(0, 0, 0.35))
    cube((0.13, 0.09, 0.0122), (0.08, 0.034, 0.0005), mat('label', (0.85, 0.82, 0.7), rough=0.7), rot=(0, 0, 0.35))
    camera((0.28, -0.42, 0.3), (0.01, -0.03, 0.02), lens=60, fstop=2.4)
    light('SPOT', (-0.5, -0.3, 0.7), (0, 0, 0), 30, (1, 0.8, 0.6), 0.1)
    light('AREA', (0.5, 0.6, 0.3), (0, 0, 0), 8, (0.6, 0.75, 1), 0.4)
    render('cassette')


def camera_obj():
    reset((0.005, 0.008, 0.015), 0.3, -1.3)
    sill = mat('sill', (0.2, 0.19, 0.18), rough=0.5, bump=(30, 0.1, 'noise'))
    cube((0, 0.05, -0.02), (0.8, 0.3, 0.04), sill, bevel=0.004)
    chrome = mat('chrome', (0.9, 0.9, 0.92), rough=0.08, metal=1.0)
    blackl = mat('leather', (0.02, 0.02, 0.02), rough=0.6, bump=(300, 0.2, 'noise'))
    cube((0, 0, 0.012), (0.08, 0.027, 0.016), chrome, bevel=0.006, rot=(0, 0, 0.25))
    cube((0, 0, 0.0205), (0.05, 0.02, 0.001), blackl, rot=(0, 0, 0.25))
    cyl((0.036, -0.004, 0.012), 0.004, 0.004, mat('lens', (0.02, 0.03, 0.05), rough=0.02, metal=0.2), rot=(math.pi / 2, 0, 0.25))
    # film cartridge
    cube((0.09, 0.05, 0.006), (0.03, 0.014, 0.012), mat('cart', (0.12, 0.13, 0.14), rough=0.3, metal=0.6), bevel=0.003)
    # rain on glass behind, city lights beyond
    glass = mat('glass', (0.8, 0.85, 0.9), rough=0.05, trans=1.0, ior=1.33)
    bokeh(40, (0, 4, 0.5), (5, 0.5, 1.2), (1.0, 0.6, 0.25), 8, 0.05, 0.12, seed=2)
    bokeh(20, (0, 4, 0.3), (5, 0.5, 1.2), (0.3, 0.5, 1.0), 6, 0.05, 0.1, seed=3)
    camera((0.1, -0.24, 0.14), (0.01, 0, 0.012), lens=90, fstop=1.6)
    light('SPOT', (-0.3, -0.25, 0.35), (0, 0, 0), 6, (1, 0.75, 0.5), 0.05)
    light('AREA', (0.3, 0.4, 0.3), (0, 0, 0), 4, (0.5, 0.65, 1), 0.4)
    render('camera')


def cake():
    reset((0.03, 0.018, 0.01), 1.0)
    cube((0, 0, -0.01), (3, 3, 0.02), ramp_mat('marble', 'noise', 4, [(0, (0.22, 0.21, 0.2)), (0.55, (0.12, 0.115, 0.11)), (1, (0.3, 0.29, 0.28))], rough=0.15, distortion=6, bump=0.02))
    cube((0, 1.2, 0.6), (4, 0.05, 1.4), mat('back', (0.05, 0.03, 0.02), rough=0.8))
    porcelain = mat('porcelain', (0.92, 0.9, 0.86), rough=0.12, coat=0.6)
    cyl((0, 0, 0.004), 0.07, 0.008, porcelain, bevel=0.003)
    cyl((0, 0, 0.05), 0.015, 0.09, porcelain, bevel=0.004)
    cyl((0, 0, 0.098), 0.2, 0.008, porcelain, bevel=0.003)
    glaze = mat('glaze', (0.035, 0.012, 0.006), rough=0.12, coat=0.5, bump=(30, 0.05, 'noise'))
    sponge = mat('sponge', (0.12, 0.05, 0.025), rough=0.9, bump=(120, 0.5, 'noise'))
    c = cyl((0, 0, 0.135), 0.15, 0.065, glaze, bevel=0.008)
    # cut a wedge out and show the inside
    cut = cube((0.11, -0.11, 0.135), (0.22, 0.22, 0.1), None, rot=(0, 0, math.radians(45)))
    boolean = c.modifiers.new('cut', 'BOOLEAN'); boolean.object = cut; boolean.operation = 'DIFFERENCE'
    cut.hide_render = True; cut.hide_viewport = True
    for i, h in enumerate([0.106, 0.135, 0.164]):
        pass
    # slice on the side
    s = cube((0.26, -0.16, 0.13), (0.1, 0.03, 0.06), sponge, bevel=0.002, rot=(0, 0, 0.5))
    cube((0.26, -0.16, 0.1605), (0.1, 0.03, 0.004), glaze, rot=(0, 0, 0.5))
    cube((0.26, -0.16, 0.13), (0.101, 0.031, 0.004), mat('apricot', (0.5, 0.12, 0.02), rough=0.3), rot=(0, 0, 0.5))
    sphere((0.34, -0.09, 0.118), 0.03, mat('cream', (0.95, 0.93, 0.88), rough=0.5, sss=0.3), scale=(1, 1, 0.6), sub=2)
    bokeh(30, (0, 1.1, 0.6), (4, 0.05, 1), (1.0, 0.65, 0.3), 10, 0.05, 0.12)
    camera((0.55, -0.7, 0.36), (0.05, -0.05, 0.12), lens=70, fstop=2.0)
    light('SPOT', (-0.6, -0.5, 0.9), (0, 0, 0.1), 70, (1, 0.8, 0.55), 0.2)
    light('AREA', (0.6, 0.7, 0.6), (0, 0, 0.1), 15, (1, 0.9, 0.8), 0.5)
    render('cake')


def globe():
    reset((0.01, 0.008, 0.006))
    cube((0, 0.4, 0.5), (4, 0.05, 2), wood(dark=True))
    cube((0, 0, -0.01), (4, 4, 0.02), wood())
    brass = mat('brass', (0.8, 0.55, 0.25), rough=0.25, metal=1.0)
    wd = wood(dark=True)
    for a in range(3):
        ang = a * 2 * math.pi / 3
        cyl((0.18 * math.cos(ang), 0.18 * math.sin(ang), 0.2), 0.012, 0.42, wd, rot=(0.25 * math.sin(ang), -0.25 * math.cos(ang), 0))
    torus((0, 0, 0.42), 0.26, 0.012, wd)
    # lower hemisphere with map + open lid
    mapm = ramp_mat('map', 'noise', 2.5, [(0, (0.12, 0.2, 0.18)), (0.52, (0.14, 0.22, 0.2)), (0.53, (0.55, 0.42, 0.24)), (1, (0.62, 0.5, 0.3))], rough=0.3, coat=0.8, detail=4)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, location=(0, 0, 0.44), segments=64, ring_count=32)
    lower = bpy.context.object
    bis = lower.modifiers.new('b', 'BOOLEAN')
    cut = cube((0, 0, 0.6), (0.6, 0.6, 0.32), None); cut.hide_render = True; cut.hide_viewport = True
    bis.object = cut; bis.operation = 'DIFFERENCE'
    obj(lower, mapm)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, location=(0, 0, 0.44), segments=64, ring_count=32)
    upper = bpy.context.object
    bu = upper.modifiers.new('b', 'BOOLEAN'); cut2 = cube((0, 0, 0.28), (0.6, 0.6, 0.32), None); cut2.hide_render = True; cut2.hide_viewport = True
    bu.object = cut2; bu.operation = 'DIFFERENCE'
    obj(upper, mapm)
    upper.location = (0, 0.235, 0.46); upper.rotation_euler = (math.radians(-100), 0, 0)
    torus((0, 0, 0.44), 0.255, 0.008, brass, rot=(math.radians(90), 0, math.radians(20)))
    # decanters inside
    glass = mat('glass', (0.95, 0.95, 0.95), rough=0.02, trans=1.0, ior=1.5)
    amber = mat('amber', (0.6, 0.25, 0.05), rough=0.05, trans=0.9, ior=1.35)
    for x, h in ((-0.07, 0.16), (0.06, 0.14)):
        cyl((x, 0, 0.46), 0.045, h, glass, bevel=0.01)
        cyl((x, 0, 0.44), 0.042, h * 0.6, amber)
        sphere((x, 0, 0.56 + h * 0.3), 0.02, glass)
    cyl((0.0, -0.1, 0.43), 0.02, 0.05, glass)
    light('AREA', (-0.8, -0.8, 1.2), (0, 0, 0.45), 160, (1, 0.72, 0.45), 0.8)
    light('POINT', (0, -0.05, 0.62), (0, 0, 0.45), 6, (1, 0.7, 0.4), 0.05)
    camera((0.5, -1.0, 0.95), (0, 0, 0.45), lens=55, fstop=2.8)
    render('globe')


def typewriter():
    reset((0.004, 0.006, 0.005))
    cube((0, 0, -0.01), (4, 4, 0.02), wood(dark=True))
    paint = mat('mint', (0.28, 0.45, 0.38), rough=0.3, coat=0.5)
    blk = mat('platen', (0.015, 0.015, 0.015), rough=0.4)
    cube((0, 0, 0.04), (0.34, 0.26, 0.08), paint, bevel=0.02)
    cube((0, 0.1, 0.1), (0.36, 0.06, 0.04), paint, bevel=0.012)
    cyl((0, 0.11, 0.135), 0.022, 0.38, blk, rot=(0, math.pi / 2, 0))
    keycap = mat('key', (0.9, 0.88, 0.8), rough=0.3)
    stem = mat('stem', (0.1, 0.1, 0.1), rough=0.3, metal=0.8)
    for row in range(4):
        for k in range(10 - (row == 3) * 3):
            x = -0.13 + k * 0.028 + row * 0.008; y = -0.1 + row * 0.03; z = 0.085 + row * 0.01
            cyl((x, y, z), 0.009, 0.004, keycap)
            cyl((x, y, z - 0.012), 0.002, 0.02, stem)
    cube((0, -0.14, 0.07), (0.16, 0.012, 0.008), keycap, bevel=0.003)  # space bar
    # paper with the typed clue
    pap = mat('paper', (0.9, 0.88, 0.82), rough=0.8)
    plane((0, 0.14, 0.24), (0.21, 0.2), pap, rot=(math.radians(78), 0, 0))
    ink = mat('ink', (0.02, 0.02, 0.03), rough=0.8)
    for i, line in enumerate(['SHIPMENT CONFIRMED.', 'FRIDAY.', 'KARVOGRAD, PLATFORM 9.']):
        z = 0.29 - i * 0.024; t = text(line, (-0.09, 0.14 + (z - 0.24) / 0.978 * 0.208 - 0.003, z), 0.016, ink, rot=(math.radians(78), 0, 0))
    # banker's lamp glow
    shade = mat('shade', (0.05, 0.25, 0.1), rough=0.1, trans=0.5, emit=(0.2, 1, 0.4), es=0.6)
    sphere((-0.35, 0.25, 0.42), 0.12, shade, scale=(1.4, 0.8, 0.45))
    light('POINT', (-0.35, 0.25, 0.38), (0, 0, 0), 25, (1, 0.8, 0.5), 0.05)
    light('AREA', (0.8, -0.6, 0.8), (0, 0, 0.1), 30, (0.6, 0.7, 1), 0.6)
    camera((0.3, -0.62, 0.48), (0, 0.06, 0.15), lens=55, fstop=2.4)
    render('typewriter')


def recorder():
    reset((0.004, 0.005, 0.007))
    cube((0, 0, -0.01), (4, 4, 0.02), wood(dark=True))
    cube((0, 0.6, 0.5), (4, 0.05, 1.2), mat('wall', (0.03, 0.045, 0.05), rough=0.8))
    body = mat('grey', (0.35, 0.37, 0.38), rough=0.35, metal=0.4)
    cube((0, 0, 0.06), (0.42, 0.34, 0.12), body, bevel=0.01)
    cube((0, -0.17, 0.03), (0.4, 0.004, 0.05), mat('panel', (0.05, 0.05, 0.05), rough=0.4))
    tape = mat('tape', (0.14, 0.07, 0.03), rough=0.35)
    alu = mat('alu', (0.75, 0.76, 0.78), rough=0.25, metal=1.0)
    for x, rr in ((-0.1, 0.07), (0.1, 0.05)):
        cyl((x, 0.04, 0.13), 0.09, 0.004, alu)
        cyl((x, 0.04, 0.128), rr, 0.012, tape)
        cyl((x, 0.04, 0.136), 0.012, 0.012, alu)
        for a in range(3):
            ang = a * 2 * math.pi / 3
            cube((x + 0.05 * math.cos(ang), 0.04 + 0.05 * math.sin(ang), 0.133), (0.03, 0.02, 0.002), mat('hole', (0.01, 0.01, 0.01), rough=0.5), rot=(0, 0, ang))
    cube((0, -0.08, 0.125), (0.24, 0.02, 0.005), tape)
    for i in range(4):
        cube((-0.12 + i * 0.05, -0.13, 0.124), (0.03, 0.03, 0.01), mat('btn%d' % i, (0.08, 0.08, 0.08), rough=0.3), bevel=0.003)
    sphere((0.16, -0.13, 0.126), 0.008, mat('red', (0.4, 0, 0), emit=(1, 0.05, 0.02), es=20))
    light('POINT', (0.16, -0.14, 0.15), (0, 0, 0), 0.4, (1, 0.1, 0.05), 0.01)
    # telephone beside it
    phone = mat('bakelite', (0.01, 0.01, 0.01), rough=0.15, coat=0.6)
    cube((0.38, 0.05, 0.05), (0.2, 0.22, 0.1), phone, bevel=0.03)
    cyl((0.38, 0.05, 0.12), 0.05, 0.03, phone, bevel=0.01)
    cyl((0.38, 0.05, 0.136), 0.034, 0.004, mat('dial', (0.8, 0.78, 0.7), rough=0.4))
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    cu = bpy.context.object; cu.data.bevel_depth = 0.003
    sp = cu.data.splines[0]; sp.bezier_points.add(1)
    pts = [(0.2, 0.1, 0.02), (0.26, 0.2, 0.004), (0.3, 0.08, 0.02)]
    for i, p in enumerate(pts):
        bp = sp.bezier_points[i]; bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.data.materials.append(phone)
    light('AREA', (-0.7, -0.6, 0.9), (0, 0, 0.1), 50, (1, 0.75, 0.5), 0.6)
    light('AREA', (0.6, 0.6, 0.6), (0, 0, 0.1), 25, (0.5, 0.65, 1.0), 0.5)
    camera((0.35, -0.7, 0.5), (0.05, 0, 0.1), lens=50, fstop=2.8)
    render('recorder')


def newspapers():
    reset((0.02, 0.012, 0.008))
    cube((0, 0, -0.01), (3, 3, 0.02), ramp_mat('marble2', 'noise', 3, [(0, (0.3, 0.29, 0.27)), (0.5, (0.18, 0.17, 0.16)), (1, (0.36, 0.35, 0.33))], rough=0.12, distortion=5, bump=0.02))
    cube((0, 1.3, 0.6), (4, 0.05, 1.4), mat('back', (0.06, 0.035, 0.02), rough=0.8))
    rod = wood()
    ink = mat('ink', (0.03, 0.03, 0.03), rough=0.9)
    grey = mat('grey', (0.2, 0.2, 0.2), rough=0.9)
    heads = ['WIENER ABENDPOST', 'LE MATIN DE PARIS', 'THE LONDON COURIER']
    for i in range(3):
        x = -0.24 + i * 0.22; ang = 0.12 * (i - 1)
        cyl((x, 0.1 - i * 0.05, 0.012), 0.008, 0.36, rod, rot=(0, math.pi / 2, ang))
        paper = mat('paper%d' % i, (0.78 - i * 0.03, 0.75 - i * 0.03, 0.68 - i * 0.02), rough=0.9, bump=(80, 0.05, 'noise'))
        plane((x, -0.06 - i * 0.05, 0.004), (0.3, 0.34), paper, rot=(0, 0, ang))
        text(heads[i], (x - 0.13, 0.06 - i * 0.05, 0.0065), 0.024, ink, rot=(0, 0, ang))
        for col in range(3):
            for row in range(14):
                cube((x - 0.1 + col * 0.09, 0.01 - i * 0.05 - row * 0.016, 0.0055), (0.075, 0.004, 0.0004), ink if row % 5 else grey, rot=(0, 0, ang))
    porcelain = mat('porc', (0.92, 0.9, 0.86), rough=0.1, coat=0.6)
    cyl((0.36, -0.3, 0.004), 0.08, 0.008, porcelain, bevel=0.003)
    cyl((0.36, -0.3, 0.045), 0.045, 0.07, porcelain, bevel=0.005)
    cyl((0.36, -0.3, 0.078), 0.04, 0.004, mat('coffee', (0.05, 0.02, 0.01), rough=0.05))
    torus((0.415, -0.3, 0.05), 0.018, 0.005, porcelain, rot=(math.pi / 2, 0, 0))
    cyl((0.22, -0.4, 0.06), 0.03, 0.12, mat('water', (0.95, 0.97, 1), rough=0.02, trans=1, ior=1.5))
    bokeh(30, (0, 1.2, 0.7), (4, 0.05, 1), (1.0, 0.65, 0.3), 10, 0.05, 0.14)
    light('SPOT', (-0.5, -0.5, 1.0), (0, -0.1, 0), 80, (1, 0.78, 0.5), 0.2)
    light('AREA', (0.8, 0.5, 0.6), (0, 0, 0), 10, (1, 0.85, 0.7), 0.6)
    camera((0.35, -0.75, 0.55), (0.0, -0.12, 0.0), lens=50, fstop=2.8)
    render('newspapers')


def piano():
    reset((0.02, 0.012, 0.006))
    floor = ramp_mat('parquet', 'wave', 6, [(0, (0.12, 0.05, 0.02)), (1, (0.3, 0.14, 0.06))], rough=0.2, coat=0.6, distortion=3, vector=(1, 8, 1))
    cube((0, 0, -0.01), (12, 12, 0.02), floor)
    lac = mat('lacquer', (0.005, 0.005, 0.006), rough=0.06, coat=1.0)
    # grand piano outline: straight spine, curved tail
    bpy.ops.curve.primitive_bezier_curve_add()
    cu = bpy.context.object
    sp = cu.data.splines[0]; sp.bezier_points.add(4); sp.use_cyclic_u = True
    outline = [(-0.75, -0.3), (0.75, -0.3), (0.72, 0.4), (0.0, 0.9), (-0.75, 1.9)]
    for i, (x, y) in enumerate(outline):
        bp = sp.bezier_points[i]; bp.co = (x, y, 0); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.data.dimensions = '2D'; cu.data.fill_mode = 'BOTH'; cu.data.extrude = 0.16; cu.data.bevel_depth = 0.01
    cu.location = (0, 0, 0.78); cu.data.materials.append(lac)
    for x, y in ((-0.6, -0.15), (0.6, -0.15), (-0.55, 1.5)):
        cyl((x, y, 0.36), 0.05, 0.72, lac, bevel=0.01)
    # keyboard
    white = mat('ivory', (0.9, 0.88, 0.82), rough=0.25)
    cube((0, -0.42, 0.74), (1.3, 0.16, 0.04), white, bevel=0.003)
    for k in range(36):
        if k % 7 in (2, 6): continue
        cube((-0.62 + k * 0.036, -0.39, 0.765), (0.016, 0.1, 0.02), lac)
    cube((0, -0.33, 0.8), (1.44, 0.06, 0.12), lac, bevel=0.01)
    # raised lid, hinged along the straight bass side
    lidc = cu.data.copy(); lidc.extrude = 0.012
    for bp in lidc.splines[0].bezier_points:
        bp.co.x += 0.75; bp.handle_left.x += 0.75; bp.handle_right.x += 0.75
    lid = bpy.data.objects.new('lid', lidc); bpy.context.collection.objects.link(lid)
    lid.location = (-0.75, 0, 0.955); lid.rotation_euler = (0, math.radians(-38), 0)
    cyl((0.25, 0.55, 1.2), 0.008, 0.62, lac, rot=(0, math.radians(-20), 0))
    # warm ballroom glow behind instead of discrete lights
    cube((0, 6, 2), (14, 0.1, 6), mat('hall', (0, 0, 0), emit=(1.0, 0.62, 0.3), es=0.35))
    light('AREA', (-2, -2, 3), (0, 0.4, 0.8), 600, (1, 0.8, 0.55), 2)
    light('AREA', (2, 2, 2.5), (0, 0.4, 0.8), 300, (1, 0.85, 0.7), 1.5)
    camera((2.6, -2.6, 1.7), (0, 0.5, 0.85), lens=45, fstop=2.0)
    render('piano')


def column():
    reset((0.004, 0.006, 0.012), 1.0)
    wet = ramp_mat('cobble', 'voronoi', 14, [(0, (0.02, 0.02, 0.022)), (0.4, (0.06, 0.06, 0.065)), (1, (0.04, 0.04, 0.045))], rough=0.08, bump=0.3)
    cube((0, 0, -0.01), (20, 20, 0.02), wet)
    green = mat('green', (0.03, 0.12, 0.08), rough=0.35, metal=0.5)
    cyl((0, 0, 1.4), 0.45, 2.8, mat('paste', (0.5, 0.45, 0.36), rough=0.9, bump=(20, 0.2, 'noise')))
    random.seed(5)
    palette = [((0.75, 0.62, 0.4), (0.45, 0.05, 0.05)), ((0.5, 0.04, 0.04), (0.9, 0.8, 0.6)), ((0.06, 0.1, 0.28), (0.85, 0.65, 0.2)),
               ((0.85, 0.8, 0.68), (0.05, 0.05, 0.05)), ((0.8, 0.55, 0.12), (0.2, 0.05, 0.05)), ((0.2, 0.35, 0.3), (0.9, 0.85, 0.7))]
    for k in range(10):
        a = k * 2 * math.pi / 10 + random.random() * 0.2
        z = 0.7 + (k % 2) * 1.0 + random.random() * 0.2
        bg, fg = palette[k % len(palette)]
        cube((0.458 * math.cos(a), 0.458 * math.sin(a), z), (0.004, 0.3, 0.46), mat('p%d' % k, bg, rough=0.8, bump=(30, 0.15, 'noise')), rot=(0, 0, a))
        fgm = mat('g%d' % k, fg, rough=0.8)
        cube((0.462 * math.cos(a), 0.462 * math.sin(a), z + 0.06), (0.002, 0.2, 0.14), fgm, rot=(0, 0, a))
        for r in range(3):
            cube((0.462 * math.cos(a), 0.462 * math.sin(a), z - 0.1 - r * 0.04), (0.002, 0.22 - r * 0.05, 0.015), fgm, rot=(0, 0, a))
    cyl((0, 0, 2.85), 0.5, 0.12, green, bevel=0.02)
    sphere((0, 0, 2.95), 0.42, green, scale=(1, 1, 0.45))
    sphere((0, 0, 3.18), 0.07, green)
    cyl((0, 0, 0.08), 0.5, 0.16, green, bevel=0.02)
    # streetlamp glow and rain
    light('POINT', (1.6, -1.0, 3.2), (0, 0, 0), 800, (1, 0.7, 0.35), 0.2)
    sphere((1.6, -1.0, 3.2), 0.12, mat('lamp', (0, 0, 0), emit=(1, 0.75, 0.4), es=40))
    light('AREA', (-3, 2, 3), (0, 0, 1), 200, (0.4, 0.55, 1.0), 2)
    rain = mat('rain', (0.8, 0.85, 0.9), rough=0.05, trans=0.9, emit=(0.6, 0.7, 0.8), es=0.08)
    random.seed(9)
    for i in range(90):
        x = -3 + random.random() * 6; y = -3 + random.random() * 4; z = random.random() * 4
        cyl((x, y, z), 0.0025, 0.3, rain, verts=6, rot=(0.15, 0, 0))
    cube((0, 12, 3), (30, 0.1, 8), mat('city', (0, 0, 0), emit=(0.35, 0.28, 0.25), es=0.25))
    camera((1.8, -4.5, 1.4), (0, 0, 1.5), lens=40, fstop=2.0)
    render('column')


ALL = {'chocolates': chocolates, 'cassette': cassette, 'camera': camera_obj, 'cake': cake, 'globe': globe,
       'typewriter': typewriter, 'recorder': recorder, 'newspapers': newspapers, 'piano': piano, 'column': column}
for name, fn in ALL.items():
    if ONLY and name not in ONLY.split(','): continue
    try:
        fn()
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', name, e, flush=True)
