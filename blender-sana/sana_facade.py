"""
SANA – Building B: main entrance facade (estimated from site photo).
Run inside Blender:  blender --python sana_facade.py
or headless:         python3 sana_facade.py   (with the `bpy` pip module)
All dimensions in meters. They are ESTIMATES until the DWG plan dimensions are applied.
"""
import math
import os
import bpy

# ---------------------------------------------------------------- parameters
P = dict(
    frame_half_w=6.6,      # outer half-width of the arch frame
    frame_shoulder_h=12.5, # height of the outer shoulder
    frame_step_half_w=5.6, # half-width after the step
    frame_step_h=15.5,     # height where the ogee curve starts
    frame_top_h=22.0,      # top of the crown
    frame_depth=1.0,       # thickness of the frame (Y)
    arch_half_w=4.3,       # half-width of the pointed arch opening
    arch_spring_h=12.5,    # where the arch starts curving
    arch_apex_h=19.3,      # apex of the inner arch
    recess_depth=5.0,      # depth from facade to inner wall
    floor_h=5.6,           # first floor beam level
    wing_len=22.0,         # side wing length each side
    wing_h=10.2,
    wing_depth=18.0,
    plinth_h=0.45,
    ceiling_h=13.0,       # soffit of the recess
)

CONCRETE = (0.60, 0.50, 0.38, 1.0)


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, rough=0.85):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    return m


def profile_solid(name, outer, holes, depth, y0, material):
    """Extrude a 2D (x,z) outline with holes along +Y starting at y0."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = depth / 2
    for loop in [outer] + holes:
        sp = cu.splines.new("POLY")
        sp.points.add(len(loop) - 1)
        for p, (x, z) in zip(sp.points, loop):
            p.co = (x, z, 0, 1)
        sp.use_cyclic_u = True
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    ob.rotation_euler = (math.radians(90), 0, 0)
    ob.location = (0, y0 + depth / 2, 0)
    ob.data.materials.append(material)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    ob.select_set(False)
    # curve rotated 90° on X maps curve-Y to world-Z and extrude to world -Y; fix facing
    return ob


def box(name, x0, x1, y0, y1, z0, z1, material):
    bpy.ops.mesh.primitive_cube_add(size=1)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (x1 - x0, y1 - y0, z1 - z0)
    ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(material)
    return ob


def rect(x0, z0, x1, z1):
    return [(x0, z0), (x1, z0), (x1, z1), (x0, z1)]


def pointed_arch(hw, spring, apex, n=24):
    """Two-centred pointed arch from (-hw,0) up to apex and down to (hw,0)."""
    # radius so that circle centred on (c,spring) passes (−hw,spring) and (0,apex)
    rise = apex - spring
    c = (rise ** 2 - hw ** 2) / (2 * hw)  # centre x of left arc (positive -> right)
    r = hw + c
    pts = [(hw, 0.0), (hw, spring)]
    # right arc (centre at -c), from angle 0 to apex
    a_end = math.atan2(rise, c)
    for i in range(1, n + 1):
        a = a_end * i / n
        pts.append((-c + r * math.cos(a), spring + r * math.sin(a)))
    pts[-1] = (0.0, apex)
    left = [(-x, z) for x, z in reversed(pts[:-1])]
    return pts + left


def frame_outline():
    hw, sh = P["frame_half_w"], P["frame_shoulder_h"]
    shw, sth, top = P["frame_step_half_w"], P["frame_step_h"], P["frame_top_h"]
    right = [(hw, 0.0), (hw, sh), (shw + 0.35, sh + 0.25), (shw, sh + 0.9), (shw, sth)]
    # ogee crown: concave flare then convex dome to the top
    n = 28
    for i in range(1, n + 1):
        t = i / n
        x = shw * (1 - t) ** 0.9 * (1 - 0.15 * math.sin(math.pi * t))
        z = sth + (top - sth) * math.sin(t * math.pi / 2) ** 0.8
        # pull the upper part into a round bulb
        if t > 0.55:
            u = (t - 0.55) / 0.45
            x = (shw * 0.55) * math.cos(u * math.pi / 2)
            z = sth + (top - sth) * (0.62 + 0.38 * math.sin(u * math.pi / 2))
        right.append((x, z))
    right[-1] = (0.0, top)
    left = [(-x, z) for x, z in reversed(right[:-1])]
    return right + left


def build():
    clear()
    concrete = mat("Concrete", CONCRETE)
    dark = mat("Interior_Dark", (0.12, 0.11, 0.10, 1.0))
    ground_m = mat("Ground", (0.70, 0.67, 0.62, 1.0), 0.95)
    glass = mat("Opening_Shadow", (0.05, 0.05, 0.06, 1.0), 0.3)

    hw, ah = P["frame_half_w"], P["arch_half_w"]
    rd, fd = P["recess_depth"], P["frame_depth"]

    # 1) Arch frame with pointed opening
    arch = pointed_arch(ah, P["arch_spring_h"], P["arch_apex_h"])
    arch_hole = [(x, max(z, P["plinth_h"] * 0) - 0.0) for x, z in arch]
    arch_hole[0] = (ah, -0.01)
    arch_hole[-1] = (-ah, -0.01)
    profile_solid("Arch_Frame", frame_outline()[::-1], [arch_hole], fd, -fd, concrete)

    # 2) Arch reveal (the thick soffit going into the recess) – side walls + ceiling
    box("Recess_Wall_L", -ah - 0.4, -ah, 0, rd, 0, P["arch_spring_h"] + 1.0, concrete)
    box("Recess_Wall_R", ah, ah + 0.4, 0, rd, 0, P["arch_spring_h"] + 1.0, concrete)
    box("Recess_Ceiling", -ah - 0.4, ah + 0.4, 0, rd, P["ceiling_h"], P["ceiling_h"] + 0.6, concrete)
    # vault infill above ceiling inside arch
    profile_solid("Arch_Reveal",
                  pointed_arch(ah + 0.01, P["ceiling_h"], P["arch_apex_h"] + 0.3)[1:-1],
                  [], rd * 0.25, 0, concrete)

    # 3) Inner facade: two storeys, 3 bays (narrow – wide – narrow)
    fh = P["floor_h"]
    col_w = 0.85
    xs = [-ah, -ah + 0.9, -2.5, -2.5 + col_w, 2.5 - col_w, 2.5, ah - 0.9, ah]
    holes = []
    for z0, z1 in [(0.35, fh - 0.4), (fh + 0.5, P["ceiling_h"] - 0.8)]:
        holes.append(rect(xs[1] + 0.15, z0, xs[2], z1))
        holes.append(rect(xs[3], z0, xs[4], z1))
        holes.append(rect(xs[5], z0, xs[6] - 0.15, z1))
    profile_solid("Inner_Facade", rect(-ah, 0, ah, P["ceiling_h"]), holes, 0.6, rd - 3.2, concrete)
    # dark interior box behind openings
    box("Interior", -ah, ah, rd - 2.6, rd + 6, 0, P["ceiling_h"], dark)
    box("Interior_Slab", -ah, ah, rd - 2.6, rd + 6, fh - 0.4, fh + 0.5, concrete)

    # 4) Side wings (two-storey blocks with window recesses)
    wl, wh, wd = P["wing_len"], P["wing_h"], P["wing_depth"]
    for s in (-1, 1):
        x0, x1 = sorted((s * hw, s * (hw + wl)))
        wing_holes = []
        for k in range(4):
            cx = s * (hw + 4.0 + k * 5.0)
            wing_holes.append(rect(cx - 1.0, 4.2, cx + 1.0, 8.2))
        profile_solid(f"Wing_{'L' if s < 0 else 'R'}", rect(x0, 0, x1, wh), wing_holes, 0.6, -0.6, concrete)
        box(f"Wing_Body_{'L' if s < 0 else 'R'}", x0, x1, 0.0, wd, 0, wh - 0.01, concrete)
        # pilaster next to frame
        px = s * (hw + 0.6)
        box(f"Pilaster_{'L' if s < 0 else 'R'}", px - 0.6, px + 0.6, -1.5, 0.0, 0, 14.0, concrete)

    # 5) Entrance plinth + ground
    box("Plinth", -ah, ah, -0.2, rd - 2.6, 0, P["plinth_h"], concrete)
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
    bpy.context.active_object.name = "Ground"
    bpy.context.active_object.data.materials.append(ground_m)

    # 6) Lighting, sky, camera
    world = bpy.data.worlds.new("Sky")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    sky = nt.nodes.new("ShaderNodeTexSky")
    for attr, val in (("sky_type", "NISHITA"), ("sun_elevation", math.radians(55))):
        try:
            setattr(sky, attr, val)
        except Exception:
            pass
    nt.links.new(sky.outputs[0], nt.nodes["Background"].inputs[0])
    nt.nodes["Background"].inputs[1].default_value = 0.25

    sun = bpy.data.lights.new("Sun", "SUN")
    sun.energy = 3.0
    sun.angle = math.radians(1.5)
    so = bpy.data.objects.new("Sun", sun)
    bpy.context.collection.objects.link(so)
    so.rotation_euler = (math.radians(40), math.radians(15), math.radians(200))

    cam = bpy.data.cameras.new("Camera")
    cam.lens = 15
    co = bpy.data.objects.new("Camera", cam)
    bpy.context.collection.objects.link(co)
    co.location = (3.5, -17.0, 1.6)
    target = bpy.data.objects.new("CamTarget", None)
    bpy.context.collection.objects.link(target)
    target.location = (0, 0, 11.5)
    tc = co.constraints.new("TRACK_TO")
    tc.target = target
    bpy.context.scene.camera = co

    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 64
    sc.cycles.use_denoising = True
    sc.render.resolution_x = 1080
    sc.render.resolution_y = 1350
    sc.view_settings.exposure = -1.0
    sc.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in sc.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"


if __name__ == "__main__":
    build()
    out = os.environ.get("SANA_OUT", os.path.dirname(os.path.abspath(__file__)))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, "sana_facade.blend"))
    if os.environ.get("SANA_RENDER", "1") == "1":
        bpy.context.scene.render.filepath = os.path.join(out, "sana_facade_render.png")
        bpy.ops.render.render(write_still=True)
