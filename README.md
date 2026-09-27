# Operation Nightglass

A cinematic point-and-click spy adventure set in 1987: a tribute to the Delphine adventures of the early 90s.
It ships one chapter a month, and every chapter ends on a cliffhanger.

| Chapter | Where | Page |
| --- | --- | --- |
| One | Vienna: a colonel's birthday gala, a wall safe and a rooftop escape | `dist/chapter1.html` |
| Two | Karvograd: a night train, a snowbound station and a run along the roof of the Iron Arrow | `dist/chapter2.html` |

## Play

Open a chapter page in any modern browser (double-click works, no server needed). Press **F** for full screen.

- **Left-click**: walk, talk, pick up, use
- **Right-click**: examine
- **Inventory**: move the mouse to the bottom edge; click an item to select it, then click something in the scene to use it
- **Esc**: menu · **M**: mute · **F**: full screen
- Action sequences: **A/D** or **←/→** to run, **Space** to jump, stop running to crouch

On phones and tablets: **tap** to walk and act, **press and hold** to examine, the **bag** button (top right) opens the
inventory and the **eye** button shows everything you can use. In the action sequences, hold the arrow buttons and
tap **JUMP**. Held upright, the game lays itself sideways to fill the screen, so it plays in landscape even inside
portrait-locked apps.

## Build

Everything is drawn and synthesised in code: no image or sound files. The dialogue is pre-recorded
with the free, open-source [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) voice model (Apache-2.0)
and embedded in the page, so it sounds the same everywhere and works offline. The close-up photographs of
objects are rendered with Blender from procedural models (`tools/photos.py`).

To re-record a chapter's dialogue after changing it:

```
python3 tools/extract-lines.py 2                                  # every spoken line -> tools/lines-ch2.json
node tools/record-voices.js 2 <kokoro-model-dir> <ffmpeg>         # records them into src/js/ch2/voicelines.js
```

To re-render photos and embed a chapter's set:

```
python3 tools/photos.py photos-final 96 teaglass,samovar          # Blender, via the bpy module
node tools/embed-photos.js 2 photos-final teaglass,samovar,...    # -> src/js/ch2/photos.js
```

```
node build.js      # every chapter -> dist/chapter<N>.html (standalone) and dist/chapter<N>.artifact.html
node build.js 2    # just chapter two
```

## Source layout

The engine is shared; each chapter brings its own story, art, voices and photos.

| File | What it does |
| --- | --- |
| `src/js/util.js` | Math, colour, painting primitives, painterly brush filter, rain and snow |
| `src/js/audio.js` | WebAudio synth: generative noir score, sound effects |
| `src/js/soundscape.js` | Layered city, rain, café and weather ambience |
| `src/js/voice.js` | Plays the recorded dialogue, ducking music under speech |
| `src/js/figures.js` | Procedural, animated characters and their costumes |
| `src/js/portraits.js` | Close-up talking portraits with lip sync |
| `src/js/engine.js` | Loop, input, walking, speech, choices, inventory, keypad, save |
| `src/js/paint.js` | Shared painting helpers and the Vienna backgrounds |
| `src/js/main.js` | Title screen, story pages, boot |
| `src/js/ch<N>/chapter.js` | The chapter's title card, intro, ending and save slot |
| `src/js/ch<N>/story.js` | Items, scenes, hotspots, dialogue, puzzles |
| `src/js/ch<N>/action-*.js` | The chapter's action sequence |
| `src/js/ch2/paint.js`, `ch2/sound.js` | Karvograd's backgrounds, music and sounds |
| `src/js/ch<N>/voicelines.js`, `photos.js` | Generated: recorded lines and rendered photos |

Add `#debug` to the URL to see walk areas and hotspots.
