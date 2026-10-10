// Written by tools/cast-textures.py.
import jack_glb from './jack.glb';
import jack_body_color from './jack_body_color.jpg';
import jack_body_normal from './jack_body_normal.jpg';
import jack_body_rough from './jack_body_rough.jpg';
import jack_head_color from './jack_head_color.jpg';
import jack_head_normal from './jack_head_normal.jpg';
import jack_head_rough from './jack_head_rough.jpg';
import jack_opacity_color from './jack_opacity.png';
import vendor_glb from './vendor.glb';
import vendor_body_color from './vendor_body_color.jpg';
import vendor_body_normal from './vendor_body_normal.jpg';
import vendor_body_rough from './vendor_body_rough.jpg';
import vendor_head_color from './vendor_head_color.jpg';
import vendor_head_normal from './vendor_head_normal.jpg';
import vendor_head_rough from './vendor_head_rough.jpg';
import vendor_opacity_color from './vendor_opacity.png';
import anim_m from './anim_m.glb';
export const ANIMS = { m: anim_m };
export const CAST = {
  jack: { glb: jack_glb, tex: { 'body_color': jack_body_color, 'body_normal': jack_body_normal, 'body_rough': jack_body_rough, 'head_color': jack_head_color, 'head_normal': jack_head_normal, 'head_rough': jack_head_rough, 'opacity_color': jack_opacity_color } },
  vendor: { glb: vendor_glb, tex: { 'body_color': vendor_body_color, 'body_normal': vendor_body_normal, 'body_rough': vendor_body_rough, 'head_color': vendor_head_color, 'head_normal': vendor_head_normal, 'head_rough': vendor_head_rough, 'opacity_color': vendor_opacity_color } },
};
