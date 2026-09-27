# Operation Nightglass

A cinematic point-and-click spy adventure set in Vienna, 1987: a tribute to the Delphine adventures of the early 90s.
This is the playable demo (chapter one).

## Play

Open `dist/index.html` in any modern browser (double-click works, no server needed). Press **F** for full screen.

- **Left-click**: walk, talk, pick up, use
- **Right-click**: examine
- **Inventory**: move the mouse to the bottom edge; click an item to select it, then click something in the scene to use it
- **Esc**: menu · **M**: mute · **F**: full screen
- Rooftop sequence: **A/D** or **←/→** to run, **Space** to jump

## Build

Everything is drawn and synthesised in code: no image or sound files.

```
node build.js   # bundles src/ into dist/index.html (standalone) and dist/artifact.html
```

## Source layout

| File | What it does |
| --- | --- |
| `src/js/util.js` | Math, colour, painting primitives, painterly brush filter, rain |
| `src/js/audio.js` | WebAudio synth: generative noir score, ambience, sound effects |
| `src/js/figures.js` | Procedural, animated characters |
| `src/js/engine.js` | Loop, input, walking, speech, choices, inventory, save |
| `src/js/paint.js` | The painted scene backgrounds |
| `src/js/story.js` | Items, scenes, hotspots, dialogue, puzzles |
| `src/js/rooftop.js` | The rooftop action sequence |
| `src/js/main.js` | Title screen, intro/outro, boot |

Add `#debug` to the URL to see walk areas and hotspots.
