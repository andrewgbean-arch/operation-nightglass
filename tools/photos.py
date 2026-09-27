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


# ================================================================ CHAPTER TWO ====
def teaglass():
    # tea in a faceted glass, in a silver holder, on a night-train table
    reset((0.004, 0.006, 0.012), 0.4, -0.9)
    cube((0, 0, -0.01), (3, 3, 0.02), ramp_mat('cloth', 'wave', 30, [(0, (0.5, 0.48, 0.44)), (1, (0.62, 0.6, 0.55))], rough=0.9, bump=0.05, vector=(1, 1, 1)))
    cube((0, 0.9, 0.5), (4, 0.05, 1.2), mat('glass_night', (0.01, 0.015, 0.03), rough=0.05))
    silver = mat('silver', (0.8, 0.8, 0.82), rough=0.22, metal=1.0, bump=(160, 0.25, 'noise'))
    glass = mat('glass', (0.95, 0.97, 1), rough=0.02, trans=1.0, ior=1.5)
    tea = mat('tea', (0.55, 0.16, 0.02), rough=0.02, trans=0.85, ior=1.33)
    # holder: base, open filigree band, handle
    cyl((0, 0, 0.006), 0.05, 0.012, silver, bevel=0.003)
    cyl((0, 0, 0.03), 0.043, 0.05, silver, bevel=0.002)
    engr = mat('engraving', (0.12, 0.12, 0.13), rough=0.5, metal=1.0)
    for k in range(16):
        a = k * 2 * math.pi / 16
        cube((0.0432 * math.cos(a), 0.0432 * math.sin(a), 0.03), (0.002, 0.006, 0.04), engr, rot=(0, 0, a))
    torus((0, 0, 0.055), 0.0435, 0.003, silver)
    torus((0, 0, 0.006), 0.0435, 0.003, silver)
    torus((0.06, 0, 0.055), 0.03, 0.006, silver, rot=(math.pi / 2, 0, 0))
    # faceted glass rising out of the holder, tea inside
    cyl((0, 0, 0.075), 0.04, 0.14, glass, verts=12)
    cyl((0, 0, 0.06), 0.037, 0.105, tea, verts=12)
    # teaspoon and two sugar lumps
    cyl((0.01, 0.01, 0.13), 0.002, 0.16, silver, rot=(0.25, -0.2, 0))
    sug = mat('sugar', (0.95, 0.94, 0.9), rough=0.9, bump=(400, 0.3, 'noise'), sss=0.2)
    cube((0.1, -0.06, 0.008), (0.016, 0.016, 0.016), sug, bevel=0.001, rot=(0, 0, 0.4))
    cube((0.125, -0.04, 0.008), (0.016, 0.016, 0.016), sug, bevel=0.001, rot=(0, 0, -0.3))
    bokeh(24, (0, 0.85, 0.5), (3, 0.05, 0.8), (0.4, 0.55, 1.0), 6, 0.03, 0.08, seed=4)
    light('SPOT', (-0.4, -0.35, 0.6), (0, 0, 0.05), 25, (1, 0.8, 0.55), 0.15)
    light('AREA', (0.4, 0.5, 0.3), (0, 0, 0.05), 6, (0.5, 0.65, 1), 0.4)
    camera((0.28, -0.42, 0.22), (0.01, 0, 0.07), lens=70, fstop=2.2)
    render('teaglass')


def samovar():
    reset((0.02, 0.012, 0.005), 0.5, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), wood())
    cube((0, 0.8, 0.8), (4, 0.05, 2), mat('tiles', (0.18, 0.3, 0.26), rough=0.3, coat=0.4, bump=(8, 0.2, 'noise')))
    brass = mat('brass', (0.85, 0.58, 0.24), rough=0.18, metal=1.0, bump=(90, 0.08, 'noise'))
    dark = mat('darkbrass', (0.4, 0.25, 0.1), rough=0.3, metal=1.0)
    ivory = mat('ivory', (0.85, 0.8, 0.7), rough=0.4)
    # stepped base, urn body, collar, chimney, teapot on top
    cyl((0, 0, 0.02), 0.14, 0.04, dark, bevel=0.01)
    cyl((0, 0, 0.07), 0.07, 0.07, brass, bevel=0.01)
    sphere((0, 0, 0.25), 0.18, brass, scale=(1, 1, 1.05), sub=1)
    cyl((0, 0, 0.42), 0.1, 0.04, dark, bevel=0.01)
    cyl((0, 0, 0.47), 0.05, 0.06, brass, bevel=0.005)
    for d in (-1, 1):
        torus((d * 0.2, 0, 0.32), 0.04, 0.008, dark, rot=(math.pi / 2, 0, 0))
        sphere((d * 0.2, 0, 0.36), 0.015, ivory)
    # tap with an ivory key
    cyl((0.0, -0.2, 0.15), 0.012, 0.08, brass, rot=(math.pi / 2, 0, 0))
    cyl((0.0, -0.24, 0.13), 0.01, 0.04, brass)
    cube((0.0, -0.24, 0.175), (0.05, 0.01, 0.015), ivory, bevel=0.003)
    # porcelain teapot with red flowers
    porc = mat('porcelain', (0.92, 0.9, 0.86), rough=0.12, coat=0.6)
    sphere((0, 0, 0.56), 0.075, porc, scale=(1, 1, 0.8), sub=1)
    cyl((0.09, 0, 0.56), 0.012, 0.07, porc, rot=(0, 1.0, 0))
    torus((-0.08, 0, 0.56), 0.03, 0.008, porc, rot=(math.pi / 2, 0, 0))
    torus((0, 0, 0.555), 0.074, 0.004, mat('goldband', (0.9, 0.65, 0.25), rough=0.2, metal=1.0))
    sphere((0, 0, 0.62), 0.015, porc)
    # a glass of tea waiting under the tap
    cyl((0.0, -0.3, 0.05), 0.03, 0.1, mat('tglass', (0.95, 0.97, 1), rough=0.02, trans=1.0, ior=1.5), verts=12)
    cyl((0.0, -0.3, 0.04), 0.027, 0.07, mat('ttea', (0.55, 0.16, 0.02), rough=0.02, trans=0.85, ior=1.33), verts=12)
    bokeh(30, (0, 0.75, 0.8), (3, 0.05, 1.2), (1.0, 0.7, 0.35), 8, 0.04, 0.1, seed=7)
    light('SPOT', (-0.7, -0.6, 1.0), (0, 0, 0.3), 90, (1, 0.8, 0.55), 0.25)
    light('AREA', (0.8, -0.2, 0.6), (0, 0, 0.3), 25, (0.8, 0.85, 1), 0.6)
    camera((0.55, -0.95, 0.55), (0, -0.05, 0.3), lens=60, fstop=2.4)
    render('samovar')


def crowbar():
    reset((0.01, 0.006, 0.003), 0.4, -0.9)
    planks = ramp_mat('planks', 'wave', 1.5, [(0, (0.06, 0.03, 0.012)), (0.5, (0.12, 0.06, 0.025)), (1, (0.05, 0.025, 0.01))], rough=0.8, bump=0.1, distortion=4, vector=(1, 10, 1))
    cube((0, 0, -0.01), (4, 4, 0.02), planks)
    cube((0, 0.6, 0.6), (4, 0.05, 1.4), planks)
    red = mat('redpaint', (0.45, 0.03, 0.03), rough=0.45, coat=0.3, bump=(60, 0.3, 'noise'))
    steel = mat('steel', (0.4, 0.42, 0.44), rough=0.35, metal=1.0, bump=(200, 0.2, 'noise'))
    # the bar lying diagonally, a curved claw at one end
    cyl((0, 0, 0.018), 0.018, 0.7, red, rot=(0, math.pi / 2, 0.35), verts=6)
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    cu = bpy.context.object; cu.data.bevel_depth = 0.018; cu.data.bevel_resolution = 1
    sp = cu.data.splines[0]; sp.bezier_points.add(1)
    ex, ey = 0.35 * math.cos(0.35), 0.35 * math.sin(0.35)
    for i, pt in enumerate([(ex - 0.02, ey - 0.01, 0.012), (ex + 0.05, ey + 0.04, 0.03), (ex + 0.06, ey + 0.08, 0.07)]):
        if i >= len(sp.bezier_points): break
        bp = sp.bezier_points[i]; bp.co = pt; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.data.materials.append(red)
    cube((-ex - 0.01, -ey, 0.012), (0.04, 0.03, 0.006), steel, rot=(0, 0, 0.35), bevel=0.002)
    # bent nails and straw
    for k in range(4):
        cyl((0.12 + k * 0.05, -0.12 + (k % 2) * 0.03, 0.004), 0.002, 0.06, steel, rot=(math.pi / 2 - 0.2, 0.3 * k, k))
    straw = mat('straw', (0.6, 0.45, 0.15), rough=0.7)
    random.seed(12)
    for k in range(80):
        cyl((random.uniform(-0.5, 0.5), random.uniform(-0.4, 0.3), 0.003), 0.0015, random.uniform(0.04, 0.12), straw, rot=(math.pi / 2, 0, random.uniform(0, 3.14)), verts=5)
    light('SPOT', (0.1, -0.3, 0.7), (0.2, 0.05, 0), 80, (1, 0.75, 0.45), 0.25)
    light('AREA', (0.6, 0.4, 0.4), (0, 0, 0), 14, (0.6, 0.7, 1), 0.5)
    camera((0.5, -0.46, 0.32), (0.26, 0.1, 0.03), lens=50, fstop=2.4)
    render('crowbar')


def handbag():
    reset((0.03, 0.018, 0.01), 0.6, -0.8)
    cube((0, 0, -0.01), (4, 4, 0.02), wood())
    cube((0, 0.7, 0.6), (4, 0.05, 1.4), mat('plaster', (0.35, 0.22, 0.15), rough=0.9, bump=(20, 0.2, 'noise')))
    leather = mat('leather', (0.35, 0.02, 0.04), rough=0.35, coat=0.3, bump=(250, 0.15, 'noise'))
    gold = mat('gold', (0.9, 0.65, 0.25), rough=0.15, metal=1.0)
    cube((0, 0, 0.09), (0.26, 0.09, 0.18), leather, bevel=0.03, seg=5)
    cube((0, -0.047, 0.15), (0.26, 0.004, 0.06), mat('flap', (0.3, 0.015, 0.03), rough=0.35, coat=0.3), bevel=0.01)
    cube((0, -0.052, 0.14), (0.04, 0.006, 0.025), gold, bevel=0.004)
    torus((0, 0, 0.18), 0.1, 0.007, gold, rot=(math.pi / 2, 0, 0))
    # a photograph slipping out, a lipstick and a hairpin on the table
    photo = mat('photo', (0.85, 0.83, 0.78), rough=0.5)
    cube((0.2, -0.12, 0.002), (0.09, 0.12, 0.002), photo, rot=(0, 0, 0.3))
    cube((0.2, -0.12, 0.0035), (0.075, 0.09, 0.001), mat('image', (0.3, 0.33, 0.38), rough=0.4), rot=(0, 0, 0.3))
    cyl((-0.2, -0.12, 0.012), 0.011, 0.05, gold, rot=(math.pi / 2, 0, 0.8))
    cyl((-0.22, -0.14, 0.012), 0.009, 0.02, mat('lip', (0.6, 0.02, 0.05), rough=0.3), rot=(math.pi / 2, 0, 0.8))
    cube((-0.05, -0.16, 0.002), (0.09, 0.004, 0.002), mat('pin', (0.05, 0.05, 0.06), rough=0.2, metal=1.0), rot=(0, 0, -0.2))
    bokeh(20, (0, 0.65, 0.6), (3, 0.05, 1), (1.0, 0.7, 0.4), 6, 0.04, 0.1, seed=9)
    light('SPOT', (0.6, -0.5, 0.8), (0, 0, 0.08), 50, (1, 0.8, 0.55), 0.3)
    light('AREA', (-0.6, 0.2, 0.5), (0, 0, 0.08), 12, (0.6, 0.7, 1), 0.5)
    camera((0.2, -0.75, 0.38), (0, -0.04, 0.08), lens=60, fstop=2.2)
    render('handbag')


def programme():
    reset((0.01, 0.008, 0.012), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), velvet((0.05, 0.08, 0.2)))
    paper = mat('cream', (0.85, 0.8, 0.68), rough=0.7, bump=(60, 0.05, 'noise'))
    red = mat('opera_red', (0.45, 0.03, 0.05), rough=0.5)
    gold = mat('gold2', (0.85, 0.62, 0.25), rough=0.25, metal=1.0)
    cube((0, 0, 0.004), (0.21, 0.29, 0.006), paper, bevel=0.001, rot=(0, 0, -0.15))
    cube((0, 0.1, 0.0075), (0.21, 0.06, 0.001), red, rot=(0, 0, -0.15))
    ink = mat('ink2', (0.05, 0.03, 0.02), rough=0.8)
    cs, sn = math.cos(-0.15), math.sin(-0.15)
    def at(x, y): return (x * cs - y * sn, x * sn + y * cs)
    for (x, y), txt, size, m in [((-0.085, 0.095), 'WIENER STAATSOPER', 0.016, mat('goldtext', (0.95, 0.85, 0.5), rough=0.3, metal=0.8)),
                                  ((-0.09, 0.03), 'Die Fledermaus', 0.026, ink), ((-0.06, -0.01), 'ZDENKA NOVAK', 0.015, ink), ((-0.045, -0.035), 'als Rosalinde', 0.012, ink)]:
        tx, ty = at(x, y); text(txt, (tx, ty, 0.0082), size, m, rot=(0, 0, -0.15))
    # a lipstick kiss on the cover
    kiss = mat('kiss', (0.6, 0.02, 0.06), rough=0.4)
    for dx, dy, sx, sy in ((0.0, 0.0, 1.0, 0.45), (0.0, -0.012, 0.9, 0.4)):
        kx, ky = at(0.05 + dx, -0.09 + dy); sphere((kx, ky, 0.0075), 0.02, kiss, scale=(sx, sy, 0.02))
    # opera glasses beside it
    for dx in (-0.025, 0.025):
        cyl((0.2 + dx, 0.02, 0.025), 0.018, 0.05, mat('mop%d' % int(dx * 1000), (0.9, 0.88, 0.85), rough=0.1, coat=1.0, sss=0.2))
        cyl((0.2 + dx, 0.02, 0.052), 0.016, 0.004, gold)
    cube((0.2, 0.02, 0.03), (0.02, 0.01, 0.01), gold)
    bokeh(20, (0, 0.8, 0.5), (3, 0.05, 1), (1.0, 0.75, 0.45), 6, 0.03, 0.08, seed=10)
    light('SPOT', (-0.4, -0.4, 0.7), (0, 0, 0), 35, (1, 0.82, 0.6), 0.2)
    light('AREA', (0.5, 0.5, 0.4), (0, 0, 0), 6, (0.6, 0.65, 1), 0.4)
    camera((0.12, -0.45, 0.42), (0.04, 0, 0.0), lens=55, fstop=2.8)
    render('programme')


def chess():
    # Olga's half-played game in first class, white losing badly, knitting beside it
    reset((0.006, 0.012, 0.008), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), wood(True))
    cube((0, 1.0, 0.8), (4, 0.05, 2), velvet((0.03, 0.12, 0.06)))
    light_sq = mat('sq_light', (0.8, 0.7, 0.5), rough=0.3, coat=0.5)
    dark_sq = mat('sq_dark', (0.25, 0.12, 0.05), rough=0.3, coat=0.5)
    s = 0.045
    cube((0, 0, 0.004), (8 * s + 0.03, 8 * s + 0.03, 0.008), mat('rim', (0.15, 0.07, 0.03), rough=0.3, coat=0.6), bevel=0.002)
    for i in range(8):
        for j in range(8):
            cube(((i - 3.5) * s, (j - 3.5) * s, 0.0085), (s, s, 0.001), light_sq if (i + j) % 2 else dark_sq)
    ivory = mat('ivory_pc', (0.9, 0.86, 0.76), rough=0.25, coat=0.4, sss=0.1)
    ebony = mat('ebony_pc', (0.03, 0.025, 0.02), rough=0.2, coat=0.6)
    def piece(i, j, kind, m, fallen=False):
        x, y = (i - 3.5) * s, (j - 3.5) * s
        h = {'p': 0.03, 'r': 0.04, 'n': 0.045, 'b': 0.05, 'q': 0.06, 'k': 0.068}[kind]
        if fallen:
            cyl((x, y, 0.02), 0.012, h, m, rot=(math.pi / 2, 0, 0.7)); return
        cyl((x, y, 0.013), 0.015, 0.01, m, bevel=0.002)
        cyl((x, y, 0.013 + h / 2), 0.008, h, m)
        sphere((x, y, 0.013 + h), 0.011 if kind == 'p' else 0.013, m)
        if kind == 'k': cube((x, y, 0.013 + h + 0.018), (0.004, 0.004, 0.016), m); cube((x, y, 0.013 + h + 0.02), (0.012, 0.004, 0.004), m)
        if kind == 'q': torus((x, y, 0.013 + h + 0.004), 0.011, 0.003, m)
        if kind == 'r': cyl((x, y, 0.013 + h), 0.012, 0.012, m)
    for i, j, k in [(4, 0, 'k'), (0, 1, 'p'), (6, 1, 'p'), (5, 2, 'p')]: piece(i, j, k, ivory)
    for i, j, k in [(4, 7, 'k'), (3, 3, 'q'), (0, 7, 'r'), (5, 1, 'r'), (2, 4, 'b'), (6, 5, 'n'), (1, 6, 'p'), (2, 5, 'p'), (5, 6, 'p'), (7, 6, 'p')]: piece(i, j, k, ebony)
    # captured white pieces lined up beside the board
    for n, k in enumerate('qrbnnpp'): piece(9.2 + (n % 2) * 0.9, 0.5 + n * 0.9, k, ivory, fallen=n > 3)
    # a ball of red wool with two knitting needles through it
    sphere((-0.3, 0.1, 0.05), 0.05, ramp_mat('wool', 'wave', 60, [(0, (0.4, 0.02, 0.03)), (1, (0.6, 0.06, 0.06))], rough=0.95, bump=0.3, vector=(1, 0.3, 1)), sub=1)
    steel = mat('needle', (0.8, 0.8, 0.82), rough=0.2, metal=1.0)
    cyl((-0.3, 0.1, 0.07), 0.003, 0.25, steel, rot=(1.1, 0.3, 0))
    cyl((-0.29, 0.12, 0.07), 0.003, 0.25, steel, rot=(1.2, -0.4, 0))
    bokeh(24, (0, 0.95, 0.6), (3, 0.05, 1), (1.0, 0.75, 0.4), 6, 0.03, 0.08, seed=12)
    light('SPOT', (-0.5, -0.4, 0.8), (0, 0, 0.02), 40, (1, 0.82, 0.55), 0.2)
    light('AREA', (0.6, 0.4, 0.5), (0, 0, 0.02), 8, (0.6, 0.7, 1), 0.5)
    camera((0.3, -0.55, 0.42), (-0.02, 0.02, 0.02), lens=55, fstop=2.8)
    render('chess')


def handcuffs():
    # Karvonian handcuffs chained to the luggage rail, a lady's nail file beside them
    reset((0.004, 0.006, 0.014), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), velvet((0.05, 0.08, 0.22)))
    steel = mat('cuffsteel', (0.55, 0.56, 0.58), rough=0.28, metal=1.0, bump=(200, 0.2, 'noise'))
    dark = mat('cuffdark', (0.2, 0.2, 0.22), rough=0.35, metal=1.0)
    for x in (-0.07, 0.09):
        torus((x, 0, 0.012), 0.04, 0.007, steel)
        cube((x + (0.04 if x < 0 else -0.04), 0, 0.012), (0.03, 0.02, 0.016), dark, bevel=0.002)
        cyl((x + (0.04 if x < 0 else -0.04), -0.004, 0.022), 0.003, 0.004, mat('keyhole', (0.01, 0.01, 0.01), rough=0.9))
    for k in range(5):
        torus((-0.025 + k * 0.014, 0, 0.012), 0.008, 0.002, steel, rot=(0, (k % 2) * math.pi / 2, 0))
    # the heavy chain running away up to the rail
    for k in range(9):
        torus((0.13 + k * 0.022, 0.02 + k * 0.012, 0.01), 0.012, 0.003, steel, rot=(0, (k % 2) * math.pi / 2, 0.5))
    brass = mat('railbrass', (0.85, 0.6, 0.25), rough=0.2, metal=1.0)
    cyl((0.25, 0.2, 0.03), 0.02, 1.4, brass, rot=(0, math.pi / 2, 0.12))
    # the nail file
    cube((-0.06, -0.12, 0.004), (0.14, 0.012, 0.002), mat('file', (0.8, 0.8, 0.82), rough=0.35, metal=1.0, bump=(600, 0.4, 'noise')), rot=(0, 0, 0.3))
    cube((0.02, -0.095, 0.005), (0.04, 0.014, 0.005), mat('filehandle', (0.8, 0.6, 0.25), rough=0.3, metal=1.0), bevel=0.001, rot=(0, 0, 0.3))
    bokeh(20, (0, 0.8, 0.5), (3, 0.05, 1), (0.4, 0.55, 1.0), 6, 0.03, 0.08, seed=14)
    light('SPOT', (-0.4, -0.4, 0.6), (0, 0, 0), 30, (1, 0.85, 0.65), 0.15)
    light('AREA', (0.5, 0.4, 0.4), (0, 0, 0), 8, (0.5, 0.6, 1), 0.4)
    camera((0.1, -0.42, 0.34), (0.03, 0, 0.0), lens=60, fstop=2.4)
    render('handcuffs')


def mesh(name, verts, faces, m):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    return o


def beer():
    # Mirek's beers on a scrubbed inn table: one full, one drained
    reset((0.02, 0.012, 0.006), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), wood())
    glass = mat('mugglass', (0.95, 0.97, 1), rough=0.03, trans=1.0, ior=1.5)
    lager = mat('lager', (0.95, 0.55, 0.08), rough=0.02, trans=0.9, ior=1.33)
    foam = mat('foam', (0.95, 0.92, 0.85), rough=0.8, sss=0.3, bump=(300, 0.3, 'noise'))
    card = mat('coaster', (0.85, 0.8, 0.7), rough=0.9)
    cyl((0, 0, 0.001), 0.06, 0.002, card)
    cyl((0, 0, 0.075), 0.045, 0.15, glass, verts=16)
    cyl((0, 0, 0.065), 0.041, 0.125, lager, verts=16)
    cyl((0, 0, 0.14), 0.042, 0.02, foam, bevel=0.008)
    torus((0.055, 0, 0.08), 0.03, 0.007, glass, rot=(math.pi / 2, 0, 0))
    # the empty one behind, with a lace of foam
    cyl((-0.12, 0.12, 0.075), 0.045, 0.15, glass, verts=16)
    cyl((-0.12, 0.12, 0.02), 0.041, 0.01, lager, verts=16)
    torus((-0.065, 0.12, 0.08), 0.03, 0.007, glass, rot=(math.pi / 2, 0, 0))
    bokeh(28, (0, 0.9, 0.5), (3, 0.05, 1), (1.0, 0.65, 0.3), 8, 0.03, 0.09, seed=21)
    light('SPOT', (-0.5, -0.4, 0.6), (0, 0, 0.07), 30, (1, 0.78, 0.5), 0.2)
    light('AREA', (0.4, 0.5, 0.3), (0, 0, 0.07), 8, (1, 0.6, 0.3), 0.5)
    camera((0.25, -0.4, 0.18), (-0.02, 0.02, 0.08), lens=60, fstop=2.2)
    render('beer')


def bread():
    # Vlasta's basket: rolls and a plaited loaf, flour on the board
    reset((0.02, 0.014, 0.008), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), ramp_mat('board', 'wave', 1.5, [(0, (0.3, 0.2, 0.1)), (1, (0.42, 0.3, 0.16))], rough=0.8, bump=0.03, vector=(1, 10, 1)))
    flour = mat('flour', (0.95, 0.93, 0.88), rough=1.0)
    for k in range(160):
        r = random.Random(k)
        sphere((r.uniform(-0.3, 0.3), r.uniform(-0.25, 0.1), -0.002), r.uniform(0.004, 0.012), flour, scale=(1, 1, 0.3))
    crust = ramp_mat('crust', 'noise', 40, [(0, (0.35, 0.16, 0.04)), (1, (0.6, 0.32, 0.1))], rough=0.6, bump=0.2)
    wicker = ramp_mat('wicker', 'wave', 30, [(0, (0.3, 0.2, 0.08)), (1, (0.55, 0.4, 0.18))], rough=0.8, bump=0.4, vector=(1, 1, 6))
    cyl((0.05, 0.05, 0.04), 0.16, 0.08, wicker, verts=48)
    for k in range(7):
        a = k * 2 * math.pi / 7
        sphere((0.05 + 0.09 * math.cos(a), 0.05 + 0.09 * math.sin(a), 0.1), 0.045, crust, scale=(1.3, 0.9, 0.7), rot=(0, 0, a), sub=1)
    sphere((0.05, 0.05, 0.12), 0.05, crust, scale=(1.3, 0.9, 0.7), sub=1)
    for k in range(6):
        sphere((-0.2 + k * 0.035, -0.12 + (k % 2) * 0.02, 0.03), 0.028, crust, scale=(1.2, 0.9, 0.9), rot=(0, 0, 0.6 * (1 if k % 2 else -1)), sub=1)
    bokeh(26, (0, 0.9, 0.5), (3, 0.05, 1), (1.0, 0.75, 0.4), 8, 0.03, 0.09, seed=22)
    light('SPOT', (-0.5, -0.5, 0.7), (0, 0, 0.05), 40, (1, 0.82, 0.55), 0.25)
    light('AREA', (0.5, 0.4, 0.4), (0, 0, 0.05), 10, (0.7, 0.75, 1), 0.5)
    camera((0.3, -0.55, 0.4), (-0.02, 0.0, 0.04), lens=55, fstop=2.8)
    render('bread')


def jetmodel():
    # the Colonel's desk model of Nightglass, in gold, on green leather
    reset((0.012, 0.01, 0.006), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), mat('leather', (0.03, 0.12, 0.05), rough=0.5, coat=0.3, bump=(120, 0.15, 'noise')))
    gold = mat('goldjet', (0.9, 0.65, 0.25), rough=0.15, metal=1.0)
    brass = mat('stand', (0.3, 0.2, 0.1), rough=0.3, metal=1.0)
    cyl((0, 0, 0.005), 0.05, 0.01, mat('marble', (0.1, 0.1, 0.1), rough=0.1, coat=1.0), bevel=0.003)
    cyl((0, 0, 0.05), 0.004, 0.09, brass)
    z = 0.1
    v = [(0.16, 0, z + 0.01), (-0.08, 0.13, z), (-0.08, -0.13, z), (-0.1, 0, z + 0.004), (0.0, 0, z + 0.035), (0.0, 0, z - 0.008)]
    f = [(0, 1, 4), (0, 4, 2), (4, 1, 3), (4, 3, 2), (0, 5, 1), (0, 2, 5), (5, 3, 1), (5, 2, 3)]
    mesh('jet', v, f, gold)
    for d in (1, -1):
        mesh('tail%d' % d, [(-0.05, 0.03 * d, z + 0.005), (-0.1, 0.035 * d, z + 0.005), (-0.1, 0.06 * d, z + 0.05), (-0.08, 0.055 * d, z + 0.05)], [(0, 1, 2, 3)], gold)
    cube((0.0, 0.0, 0.012), (0.06, 0.012, 0.004), mat('plaque', (0.85, 0.65, 0.3), rough=0.25, metal=1.0), rot=(0, 0, 0))
    bokeh(22, (0, 0.8, 0.5), (3, 0.05, 1), (1.0, 0.8, 0.5), 7, 0.03, 0.08, seed=23)
    light('SPOT', (-0.35, -0.35, 0.5), (0, 0, 0.1), 25, (1, 0.85, 0.6), 0.15)
    light('AREA', (0.4, 0.3, 0.4), (0, 0, 0.1), 8, (0.6, 0.7, 1), 0.4)
    light('SPOT', (0.1, -0.2, 0.6), (0, 0, 0.1), 20, (1, 0.9, 0.7), 0.1)
    camera((0.26, -0.3, 0.36), (0.0, 0.0, 0.09), lens=60, fstop=2.8)
    render('jetmodel')


def lathe(name, profile, m, loc=(0, 0, 0), seg=48, cap=True):
    """Spins a (radius, height) profile round the z axis into a smooth, closed mesh."""
    v, f = [], []
    for (r, z) in profile:
        for k in range(seg):
            a = k * 2 * math.pi / seg
            v.append((loc[0] + r * math.cos(a), loc[1] + r * math.sin(a), loc[2] + z))
    for i in range(len(profile) - 1):
        for k in range(seg):
            a, b = i * seg + k, i * seg + (k + 1) % seg
            f.append((a, b, b + seg, a + seg))
    if cap:
        v.append((loc[0], loc[1], loc[2] + profile[0][1])); c0 = len(v) - 1
        v.append((loc[0], loc[1], loc[2] + profile[-1][1])); c1 = len(v) - 1
        top = (len(profile) - 1) * seg
        for k in range(seg):
            f.append((c0, (k + 1) % seg, k))
            f.append((c1, top + k, top + (k + 1) % seg))
    o = mesh(name, v, f, m)
    for p in o.data.polygons: p.use_smooth = True
    return o


def cay():
    # tulip glasses of Turkish tea on a brass tray, sugar cubes, a view of the water behind
    reset((0.02, 0.012, 0.01), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), wood())
    brass = mat('traybrass', (0.85, 0.6, 0.25), rough=0.25, metal=1.0, bump=(80, 0.1, 'noise'))
    cyl((0, 0, 0.004), 0.22, 0.008, brass, bevel=0.003, verts=96)
    torus((0, 0, 0.009), 0.22, 0.006, brass)
    glass = mat('tulipglass', (0.95, 0.97, 1), rough=0.02, trans=1.0, ior=1.5)
    tea = mat('cay', (0.55, 0.1, 0.02), rough=0.02, trans=0.85, ior=1.33)
    saucer = mat('saucer', (0.85, 0.2, 0.18), rough=0.15, coat=0.8)
    for k, (x, y) in enumerate([(-0.09, -0.05), (0.06, -0.08), (0.1, 0.07), (-0.05, 0.1)]):
        cyl((x, y, 0.012), 0.035, 0.006, saucer, verts=48)
        shape = [(0.014, 0.0), (0.019, 0.01), (0.017, 0.03), (0.014, 0.045), (0.017, 0.062), (0.022, 0.078), (0.024, 0.085)]
        lathe('glass%d' % k, shape, glass, (x, y, 0.015))
        lathe('tea%d' % k, [(r - 0.0015, z) for (r, z) in shape[:6]], tea, (x, y, 0.016))
        cyl((x + 0.03, y + 0.01, 0.02), 0.003, 0.09, mat('spoon%d' % k, (0.85, 0.85, 0.88), rough=0.2, metal=1.0), rot=(0.35, 0.2, 0))
    sug = mat('cube', (0.95, 0.94, 0.9), rough=0.9, bump=(400, 0.3, 'noise'), sss=0.2)
    for k in range(4): cube((0.0 + k * 0.02, 0.0, 0.017), (0.014, 0.014, 0.014), sug, bevel=0.001, rot=(0, 0, k * 0.4))
    bokeh(30, (0, 0.9, 0.5), (3, 0.05, 1), (1.0, 0.7, 0.45), 8, 0.03, 0.09, seed=31)
    light('SPOT', (-0.5, -0.4, 0.6), (0, 0, 0.05), 35, (1, 0.8, 0.55), 0.2)
    light('AREA', (0.4, 0.5, 0.3), (0, 0, 0.05), 8, (0.6, 0.7, 1), 0.4)
    camera((0.3, -0.42, 0.26), (0, 0, 0.05), lens=55, fstop=2.4)
    render('cay')


def lamp():
    # a mosaic glass lantern from the bazaar, lit, hanging on its chain
    reset((0.01, 0.006, 0.004), 0.3, -1.0)
    backdrop(mat('lampwall', (0.08, 0.04, 0.02), rough=0.8), y=0.8)
    brass = mat('lampbrass', (0.8, 0.55, 0.22), rough=0.3, metal=1.0)
    cols = [(0.9, 0.1, 0.05), (0.1, 0.35, 0.9), (0.95, 0.7, 0.05), (0.1, 0.7, 0.3), (0.7, 0.1, 0.8)]
    glow_m = [mat('tile%d' % i, c, rough=0.1, emit=c, es=6.0) for i, c in enumerate(cols)]
    for ring in range(9):
        z = 0.1 + ring * 0.025
        R = 0.09 * math.sin((ring + 1) / 10 * math.pi) + 0.01
        n = max(6, int(R * 180))
        for k in range(n):
            a = k * 2 * math.pi / n + ring * 0.2
            cube((R * math.cos(a), R * math.sin(a), z), (0.018, 0.004, 0.02), glow_m[(k + ring) % 5], rot=(0, 0, a + math.pi / 2))
    cyl((0, 0, 0.33), 0.03, 0.03, brass); cyl((0, 0, 0.08), 0.02, 0.03, brass)
    cyl((0, 0, 0.55), 0.004, 0.4, brass)
    light('POINT', (0, 0, 0.2), (0, 0, 0), 12, (1, 0.8, 0.5), 0.02)
    bokeh(40, (0, 0.7, 0.2), (3, 0.05, 1.5), (1.0, 0.6, 0.3), 10, 0.03, 0.1, seed=32)
    camera((0.35, -0.55, 0.3), (0, 0, 0.2), lens=60, fstop=2.2)
    render('lamp')


def lokum():
    # rose Turkish delight in a box, dusted with sugar
    reset((0.02, 0.012, 0.012), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), velvet((0.2, 0.02, 0.05)))
    box = mat('lokbox', (0.85, 0.75, 0.55), rough=0.5)
    cube((0, 0, 0.012), (0.26, 0.18, 0.024), box, bevel=0.002)
    pink = mat('rose', (0.9, 0.35, 0.45), rough=0.4, trans=0.25, sss=0.6, bump=(200, 0.15, 'noise'))
    white = mat('powder', (0.97, 0.95, 0.92), rough=1.0, bump=(500, 0.4, 'noise'))
    for ix in range(4):
        for iy in range(3):
            x, y = -0.09 + ix * 0.06, -0.055 + iy * 0.055
            cube((x, y, 0.045), (0.045, 0.045, 0.042), pink, bevel=0.006, rot=(0, 0, 0.1 * ((ix + iy) % 3 - 1)))
            for q in range(14):
                rq = random.Random(ix * 50 + iy * 7 + q)
                sphere((x + rq.uniform(-0.02, 0.02), y + rq.uniform(-0.02, 0.02), 0.066), rq.uniform(0.002, 0.004), white)
    for k in range(30):
        r = random.Random(k)
        sphere((r.uniform(-0.3, 0.3), r.uniform(-0.2, 0.2), 0.0), r.uniform(0.002, 0.006), white, scale=(1, 1, 0.3))
    bokeh(24, (0, 0.8, 0.5), (3, 0.05, 1), (1.0, 0.75, 0.5), 7, 0.03, 0.08, seed=33)
    light('SPOT', (-0.4, -0.4, 0.6), (0, 0, 0.04), 30, (1, 0.85, 0.65), 0.2)
    light('AREA', (0.4, 0.4, 0.4), (0, 0, 0.04), 8, (0.8, 0.8, 1), 0.4)
    camera((0.22, -0.34, 0.3), (0, 0, 0.04), lens=60, fstop=2.8)
    render('lokum')


def telephone():
    # the ivory telephone with a gold dial, the line to London
    reset((0.02, 0.012, 0.008), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), wood(True))
    ivory = mat('ivoryphone', (0.9, 0.86, 0.75), rough=0.2, coat=0.8)
    gold = mat('golddial', (0.9, 0.65, 0.25), rough=0.2, metal=1.0)
    cube((0, 0, 0.035), (0.16, 0.2, 0.07), ivory, bevel=0.02)
    cyl((0, -0.03, 0.074), 0.05, 0.008, gold, rot=(0.35, 0, 0), verts=64)
    for k in range(10):
        a = k * 2 * math.pi / 12 + 0.6
        cyl((0.035 * math.cos(a), -0.03 + 0.035 * math.sin(a) * 0.94, 0.08 + 0.012 * math.sin(a)), 0.006, 0.004, mat('hole%d' % k, (0.1, 0.08, 0.06), rough=0.6), rot=(0.35, 0, 0))
    # the handset across the cradle
    cyl((0, 0.05, 0.11), 0.018, 0.2, ivory, rot=(0, math.pi / 2, 0))
    for d in (-1, 1): sphere((d * 0.1, 0.05, 0.1), 0.03, ivory, scale=(0.8, 1, 0.7))
    # a coiled cord
    for k in range(20): torus((-0.12 - k * 0.006, 0.05 - k * 0.004, 0.02), 0.008, 0.002, ivory, rot=(0, math.pi / 2, 0))
    bokeh(28, (0, 0.8, 0.6), (3, 0.05, 1.2), (1.0, 0.8, 0.5), 8, 0.03, 0.09, seed=34)
    light('SPOT', (-0.4, -0.4, 0.6), (0, 0, 0.05), 30, (1, 0.85, 0.6), 0.2)
    light('AREA', (0.4, 0.4, 0.4), (0, 0, 0.05), 8, (0.6, 0.7, 1), 0.4)
    camera((0.28, -0.4, 0.28), (0, 0, 0.06), lens=55, fstop=2.8)
    render('telephone')


def swan():
    # Maestro Bepi's glass swan: clear glass, an amber beak and a ruby eye, on black marble
    reset((0.015, 0.01, 0.012), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), mat('blackmarble', (0.02, 0.02, 0.025), rough=0.08, coat=1.0, bump=(8, 0.02, 'noise')))
    glass = mat('swanglass', (0.9, 0.95, 1.0), rough=0.02, trans=1.0, ior=1.5)
    sphere((0, 0, 0.05), 0.05, glass, scale=(1.6, 1.0, 0.85))
    # the tail, swept up behind
    for k in range(6): sphere((-0.075 - k * 0.008, 0, 0.06 + k * 0.009), 0.025 - k * 0.003, glass, scale=(1.3, 0.8, 0.6))
    # the neck: an S-curve of overlapping beads, then the head
    for k in range(26):
        u = k / 25
        x = 0.06 + 0.035 * math.sin(u * math.pi * 1.1) - 0.02 * u
        z = 0.07 + u * 0.15
        sphere((x, 0, z), 0.014 - u * 0.004, glass)
    hx, hz = 0.045, 0.225
    sphere((hx, 0, hz), 0.018, glass, scale=(1.4, 0.9, 0.9))
    beak = mat('amberglass', (1.0, 0.45, 0.05), rough=0.05, trans=0.7, ior=1.5)
    sphere((hx + 0.032, 0, hz - 0.004), 0.011, beak, scale=(1.8, 0.7, 0.55))
    ruby = mat('ruby', (0.8, 0.02, 0.04), rough=0.05, trans=0.5, emit=(0.6, 0.0, 0.02), es=0.6)
    for d in (-1, 1): sphere((hx + 0.012, d * 0.013, hz + 0.006), 0.0035, ruby)
    # a little cork in the tail
    sphere((-0.12, 0, 0.11), 0.006, mat('cork', (0.5, 0.33, 0.18), rough=0.9, bump=(300, 0.3, 'noise')), scale=(1, 1, 1.4))
    bokeh(36, (0, 1.4, 0.5), (3, 0.05, 1.2), (1.0, 0.75, 0.45), 5, 0.015, 0.05, seed=35)
    light('SPOT', (-0.5, -0.4, 0.6), (0, 0, 0.1), 40, (1, 0.85, 0.65), 0.2)
    light('AREA', (0.4, 0.5, 0.3), (0, 0, 0.1), 10, (0.6, 0.7, 1), 0.4)
    light('AREA', (-0.3, 0.6, 0.2), (0, 0, 0.1), 6, (1, 0.8, 0.6), 0.3)
    camera((0.32, -0.52, 0.2), (0, 0, 0.11), lens=60, fstop=2.8)
    render('swan')


def mask():
    # a Venetian mask: gold leaf, pearls along the brow, red silk ribbons, on a velvet cushion
    reset((0.02, 0.01, 0.012), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), velvet((0.25, 0.02, 0.05)))
    gold = mat('maskgold', (0.95, 0.7, 0.25), rough=0.25, metal=1.0, bump=(120, 0.08, 'noise'))
    n = 60; v = []; f = []; idx = {}
    def inside(u, w):
        if abs(u) > 1: return False
        top = 0.55 - 0.25 * u * u + 0.12 * math.cos(u * 3.2)
        bot = -0.45 + 0.35 * u * u + (0.22 if abs(u) < 0.14 else 0)
        if not (bot < w < top): return False
        return ((abs(u) - 0.45) / 0.24) ** 2 + ((w - 0.05) / 0.19) ** 2 > 1
    for i in range(n + 1):
        for j in range(n + 1):
            u, w = -1 + 2 * i / n, -1 + 2 * j / n
            idx[(i, j)] = len(v)
            v.append((u * 0.09, -0.045 * math.cos(u * 1.2) - 0.012 * math.cos(w * 1.4), 0.08 + w * 0.05))
    for i in range(n):
        for j in range(n):
            u, w = -1 + 2 * (i + 0.5) / n, -1 + 2 * (j + 0.5) / n
            if inside(u, w): f.append((idx[(i, j)], idx[(i + 1, j)], idx[(i + 1, j + 1)], idx[(i, j + 1)]))
    o = mesh('mask', v, f, gold)
    for pgn in o.data.polygons: pgn.use_smooth = True
    sol = o.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.004
    sub = o.modifiers.new('sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2
    o.rotation_euler = (-0.22, 0, 0.12); o.location = (0, 0, 0.0)
    pearl = mat('pearl', (0.95, 0.92, 0.88), rough=0.15, coat=1.0, sss=0.3)
    for k in range(15):
        u = -0.9 + k * 1.8 / 14
        top = 0.55 - 0.25 * u * u + 0.12 * math.cos(u * 3.2) - 0.04
        p = Vector((u * 0.09, -0.045 * math.cos(u * 1.2) - 0.006, 0.08 + top * 0.05))
        p.rotate(o.rotation_euler); p += o.location
        sphere(tuple(p), 0.0045, pearl)
    silk = mat('ribbon', (0.55, 0.02, 0.04), rough=0.35, sheen=0.6)
    for d in (-1, 1):
        a = Vector((d * 0.088, -0.02, 0.1)); a.rotate(o.rotation_euler)
        b = Vector((d * 0.16, -0.14, 0.004))
        for k in range(90):
            q = a.lerp(b, k / 89); q.z = max(0.004, q.z - 0.03 * math.sin(k / 89 * math.pi))
            sphere(tuple(q), 0.006, silk, scale=(1.6, 1.6, 0.35))
    bokeh(30, (0, 0.9, 0.5), (3, 0.05, 1.2), (1.0, 0.7, 0.4), 8, 0.03, 0.1, seed=36)
    light('SPOT', (-0.3, -0.5, 0.4), (0, 0, 0.08), 40, (1, 0.85, 0.6), 0.2)
    light('AREA', (0.4, -0.3, 0.3), (0, 0, 0.08), 10, (0.8, 0.8, 1), 0.4)
    camera((0.08, -0.46, 0.16), (0, 0, 0.07), lens=60, fstop=3.2)
    render('mask')


def invoice():
    # Bepi's unpaid bill, spiked on a nail in front of the furnace bricks
    reset((0.02, 0.01, 0.006), 0.3, -0.9)
    brick = mat('brick', (0.28, 0.1, 0.05), rough=0.9, bump=(30, 0.4, 'noise'))
    mortar = mat('mortar', (0.25, 0.22, 0.18), rough=1.0)
    cube((0, 0.02, 0), (1.2, 0.01, 1.0), mortar)
    for row in range(14):
        for k in range(8):
            x = -0.5 + k * 0.13 + (row % 2) * 0.065
            cube((x, 0.012, -0.45 + row * 0.066), (0.12, 0.012, 0.058), brick, bevel=0.004)
    iron = mat('nail', (0.3, 0.3, 0.32), rough=0.5, metal=1.0)
    cyl((0, -0.03, 0.18), 0.004, 0.08, iron, rot=(math.pi / 2, 0, 0))
    paper = mat('bill', (0.88, 0.84, 0.74), rough=0.8, bump=(80, 0.05, 'noise'))
    ink = mat('billink', (0.05, 0.04, 0.03), rough=0.8)
    red = mat('stamp', (0.7, 0.03, 0.05), rough=0.6)
    for k, rz in enumerate((0.1, -0.06, 0.02)):
        cube((0.0 + k * 0.006, -0.01 - k * 0.004, 0.05 - k * 0.004), (0.18, 0.001, 0.26), paper if k == 2 else mat('bill%d' % k, (0.8, 0.78, 0.7), rough=0.8), rot=(0, rz, 0))
    R = (math.pi / 2, 0, 0)
    text('FORNACE BEPI', (-0.07, -0.024, 0.14), 0.02, ink, rot=R)
    text('Col. Vasko', (-0.07, -0.024, 0.1), 0.014, ink, rot=R)
    text('1 cigno, cavo', (-0.07, -0.024, 0.075), 0.012, ink, rot=R)
    text('L. 3.000.000', (-0.07, -0.024, 0.05), 0.014, ink, rot=R)
    text('NON PAGATO', (-0.075, -0.025, -0.02), 0.024, red, rot=(math.pi / 2, 0.2, 0))
    light('SPOT', (-0.3, -0.6, 0.3), (0, 0, 0.05), 40, (1, 0.6, 0.3), 0.2)
    light('AREA', (0.4, -0.5, 0.4), (0, 0, 0.05), 6, (0.9, 0.8, 0.7), 0.4)
    camera((0.06, -0.55, 0.1), (0, 0, 0.06), lens=60, fstop=4)
    render('invoice')


def kartei():
    # a drawer of the Stasi card index, pulled out, one card standing up: TEEKANNE
    reset((0.02, 0.02, 0.016), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), mat('lino', (0.25, 0.2, 0.12), rough=0.6))
    oak = wood()
    cube((0, 0, 0.03), (0.16, 0.34, 0.006), oak)                        # floor of the drawer
    for d in (-1, 1): cube((d * 0.08, 0, 0.06), (0.008, 0.34, 0.06), oak)
    cube((0, -0.17, 0.06), (0.17, 0.01, 0.07), oak, bevel=0.002)       # front
    brass = mat('kbrass', (0.8, 0.6, 0.3), rough=0.3, metal=1.0)
    cube((0, -0.178, 0.07), (0.05, 0.006, 0.012), brass, bevel=0.002)
    cube((0, -0.178, 0.085), (0.04, 0.004, 0.02), brass)
    text('T', (-0.006, -0.181, 0.078), 0.014, mat('kink', (0.05, 0.05, 0.05)), rot=(math.pi / 2, 0, 0))
    card = mat('card', (0.9, 0.87, 0.78), rough=0.8, bump=(90, 0.05, 'noise'))
    for k in range(34):
        y = -0.15 + k * 0.009
        cube((0, y, 0.07), (0.148, 0.0008, 0.09 + (0.006 if k % 5 == 0 else 0)), card, rot=(0.05, 0, 0))
    tall = cube((0, -0.02, 0.12), (0.148, 0.001, 0.1), mat('tcard', (0.95, 0.93, 0.85), rough=0.7), rot=(0.25, 0, 0))
    ink = mat('tink', (0.08, 0.06, 0.05), rough=0.8)
    R = (math.pi / 2 + 0.25, 0, 0)
    text('TEEKANNE', (-0.062, -0.03, 0.146), 0.018, ink, rot=R)
    text('Schrank 7 - brit. Kontakt / Vasko', (-0.062, -0.032, 0.132), 0.0075, ink, rot=R)
    cube((0.05, -0.028, 0.16), (0.03, 0.0012, 0.012), mat('tab', (0.7, 0.1, 0.1), rough=0.6), rot=(0.25, 0, 0))
    light('SPOT', (-0.3, -0.5, 0.5), (0, 0, 0.08), 30, (1, 0.95, 0.8), 0.2)
    light('AREA', (0.4, -0.2, 0.4), (0, 0, 0.08), 8, (0.8, 0.9, 1), 0.4)
    camera((0.1, -0.42, 0.34), (0, -0.02, 0.09), lens=55, fstop=3.5)
    render('kartei')


def akte():
    # the TEEKANNE file on a desk: buff folder, GEHEIM stamp, a photograph clipped inside
    reset((0.015, 0.015, 0.012), 0.4, -0.9)
    cube((0, 0, -0.01), (4, 4, 0.02), wood(True))
    buff = mat('buff', (0.75, 0.65, 0.42), rough=0.8, bump=(60, 0.05, 'noise'))
    cube((0, 0, 0.003), (0.23, 0.32, 0.004), buff, rot=(0, 0, 0.08))
    cube((0.01, 0.004, 0.0065), (0.21, 0.3, 0.001), mat('inner', (0.9, 0.88, 0.8), rough=0.8), rot=(0, 0, 0.08))
    ink = mat('aink', (0.05, 0.05, 0.05), rough=0.8)
    red = mat('ared', (0.65, 0.05, 0.06), rough=0.6)
    cs, sn = math.cos(0.08), math.sin(0.08)
    def at(x, y): return (x * cs - y * sn, x * sn + y * cs)
    for (x, y), txt, size, m in [((-0.08, 0.11), 'OPERATIVER VORGANG', 0.013, ink), ((-0.08, 0.08), 'TEEKANNE', 0.024, ink), ((-0.08, 0.05), 'Reg.-Nr. XV/4411/87', 0.009, ink), ((-0.07, -0.12), 'GEHEIM', 0.03, red)]:
        tx, ty = at(x, y); text(txt, (tx, ty, 0.0078), size, m, rot=(0, 0, 0.08))
    # a black-and-white photograph under a paperclip: two men shaking hands
    px, py = at(0.03, -0.02)
    cube((px, py, 0.008), (0.1, 0.07, 0.001), mat('photo', (0.55, 0.55, 0.55), rough=0.3), rot=(0, 0, 0.08))
    for dx in (-0.02, 0.02):
        qx, qy = at(0.03 + dx, -0.02); cube((qx, qy, 0.0088), (0.012, 0.04, 0.0005), mat('fig%d' % int(dx * 100), (0.1, 0.1, 0.1), rough=0.5), rot=(0, 0, 0.08))
    cx, cy = at(0.03, 0.02); torus((cx, cy, 0.009), 0.01, 0.0008, mat('clip', (0.7, 0.7, 0.72), rough=0.3, metal=1.0))
    for dx in (-0.02, 0.02):
        hx, hy = at(0.03 + dx, 0.004); cyl((hx, hy, 0.0088), 0.008, 0.0005, mat('head%d' % int(dx * 100), (0.15, 0.15, 0.15), rough=0.5))
    light('SPOT', (-0.3, -0.4, 0.6), (0, 0, 0.02), 30, (1, 0.93, 0.8), 0.2)
    light('AREA', (0.5, 0.3, 0.4), (0, 0, 0.02), 6, (0.8, 0.9, 1), 0.4)
    camera((0.06, -0.36, 0.42), (0.03, 0.0, 0.0), lens=50, fstop=4)
    render('akte')


ALL = {'chocolates': chocolates, 'cassette': cassette, 'camera': camera_obj, 'cake': cake, 'globe': globe,
       'typewriter': typewriter, 'recorder': recorder, 'newspapers': newspapers, 'piano': piano, 'column': column,
       'teaglass': teaglass, 'samovar': samovar, 'crowbar': crowbar, 'handbag': handbag, 'programme': programme, 'chess': chess, 'handcuffs': handcuffs, 'beer': beer, 'bread': bread, 'jetmodel': jetmodel, 'cay': cay, 'lamp': lamp, 'lokum': lokum, 'telephone': telephone, 'swan': swan, 'mask': mask, 'invoice': invoice, 'kartei': kartei, 'akte': akte}
for name, fn in ALL.items():
    if ONLY and name not in ONLY.split(','): continue
    try:
        fn()
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', name, e, flush=True)
