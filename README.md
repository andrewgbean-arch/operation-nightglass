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

On phones and tablets: **tap** to walk and act, **press and hold** to examine, the **bag** button (top right) opens the
inventory and the **eye** button shows everything you can use. On the rooftop, hold the arrow buttons and tap **JUMP**.
Held upright, the game lays itself sideways to fill the screen, so it plays in landscape even inside portrait-locked apps.

## Build

Everything is drawn and synthesised in code: no image or sound files. The dialogue is pre-recorded
with the free, open-source [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) voice model (Apache-2.0)
and embedded in the page, so it sounds the same everywhere and works offline.

To re-record after changing dialogue:

```
python3 tools/extract-lines.py                       # collects every spoken line into tools/lines.json
node tools/record-voices.js <kokoro-model-dir> <ffmpeg>   # records them into src/js/voicelines.js
```

```
node build.js   # bundles src/ into dist/index.html (standalone) and dist/artifact.html
```

## Source layout

| File | What it does |
| --- | --- |
| `src/js/util.js` | Math, colour, painting primitives, painterly brush filter, rain |
| `src/js/audio.js` | WebAudio synth: generative noir score, sound effects |
| `src/js/soundscape.js` | Layered city, rain, café and weather ambience |
| `src/js/voice.js` | Plays the recorded dialogue, ducking music under speech |
| `src/js/voicelines.js` | Generated: every recorded line as embedded MP3 |
| `src/js/figures.js` | Procedural, animated characters |
| `src/js/engine.js` | Loop, input, walking, speech, choices, inventory, save |
| `src/js/paint.js` | The painted scene backgrounds |
| `src/js/story.js` | Items, scenes, hotspots, dialogue, puzzles |
| `src/js/rooftop.js` | The rooftop action sequence |
| `src/js/main.js` | Title screen, intro/outro, boot |

Add `#debug` to the URL to see walk areas and hotspots.
