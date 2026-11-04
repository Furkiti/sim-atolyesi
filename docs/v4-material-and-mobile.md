# v4 · Material, peel and mobile performance

The reference videos show three visually different materials: pale yellow protective cutouts, exposed warm brown adhesive, and opaque saturated glitter. v4 separates those layers. Printed outlines remain above the deposited coat. A 5 × 5 stencil cell is one finite simulation packet, rendered as a dense micrograin texture after adhesion. Only actual deposited packets reveal that texture; an empty brush cannot generate paint. Surface packets may roll at most eight paper units into a neighbouring adhesive gap. Completed coats are baked into one canvas texture, with a shader adding sparse animated glints over painted pixels only.

All 480,000 poster pixels belong to exactly one of eleven non-overlapping masks. The additional coats are skin, silver hair/eyes, navy tie, pink flower and red background. Shirt, vest, collars and emblem use gold; the full jacket uses purple. Pour anchors lie inside each mask, toward its upper area. The bottle mouth moves gently while pouring; refills prefer unfinished adhesive. Emission still uses the actual transformed jar mouth.

Cleanup is a single curved bend anchored at the bottom edge. The paper, its thickness, loose grains and heap share the bend. Loose material accelerates toward that edge and falls below it. No short lifetime or opacity fade removes spills: particles are retained to a conservative out-of-view boundary, including across colour transitions. The percentage label and transition readiness share a 99.5% raster-edge tolerance. Advancing seals only those final tiny stencil seams, then performs one cleanup cycle. The next-colour button is available even with automatic advancement enabled.

Sound clips are derived from the user-supplied reference videos: brush from video 1 (0.55–1.80 s), pour from video 2 (6.05–7.35 s). Mono AAC, 24 kHz, gentle endpoint fades and a 450–8500 Hz bandpass. Audio unlocks on the first gesture and can be muted in settings. No microphone or external audio service is used.

## Mobile costs

- Maximum current packets: 30,000 instead of 100,000. Typical initial black dose: 7,989 instead of 45,154, each packet representing a denser physical footprint.
- No persistent 145,000-instance bound-grain mesh. Completed artwork costs one paper texture and glint shader.
- One swept-capsule pass per brush segment instead of scanning every particle at every intermediate substep.
- Fixed precomputed neighbour indices, avoiding per-frame cell-array allocation.
- Heap geometry: 60 × 80 instead of 120 × 160, normals at lower frequency.
- Mobile coarse-pointer DPR capped at 1.4 before render scaling. Shadows default off. Multisample antialiasing disabled on coarse-pointer devices; `preserveDrawingBuffer` disabled, with an explicit synchronous render for saving artwork.
- Existing resolution, shadows, reflection, heap, animated-light and frame-rate controls remain available and do not reset progress.

`node scripts/benchmark.mjs [baseline-module-path]` runs a deterministic CPU-only workload: 180 settle frames plus 80 long brush strokes. On this development Mac, v3 took about 1,957 ms and v4 about 165 ms (approximately 12× lower CPU time). This does not measure a phone, GPU time or end-to-end FPS. Actual Safari/Android performance still needs checking on the user's handset.

Validation covers material conservation, empty-brush behaviour, thin boundaries, full-poster mask partition, every bottle's fan path inside its own target, whole-coat coverage, visible off-card grain retention, bend clearance, first-pointer ownership, duplicate action suppression, settings and frame pacing. Browser QA also checks the 390 × 844 layout, peeling, real-mouth emission, brushing, cleanup, settings and WebGL/audio console errors.


## v4.1 regression fixes

The old UI rounded 99.5–99.99% to 100 while readiness still required exactly 100. A single completion status now drives both. The `devam` query accepts validated stage numbers 1–11, restoring earlier completed coats for recovery links.

A clamped bend divisor compressed the paper into a line when progress approached one but was not exactly one. The deformation now uses a stable sine identity and explicit flat restoration; entering a colour also resets the bend. Tests cover tiny amounts and twelve successive bend cycles.

Newly bound particles and their dense coat now update in the same rendered frame. Heap vertices follow physics every frame with smoothing while normals update every fourth update. Each grain retains its own sparkle seed after instance compaction, avoiding flashes across unrelated grains.


## v4.2 · Spread without rebuilding a solid mound

Reviewed the user's 10.72-second screen recording. The swept loose material behaved like a connected extruded blob, including on protected jacket and face areas. New material count was not increasing, but both the continuous mound envelope and the per-cell height reconstruction made it look as though the heap refilled behind the brush.

A packet now remembers that bristles have swept it. Its thinner packing contributes to granular pressure, but it can never recreate the continuous freshly-poured mound envelope. The latter uses a separate field containing untouched grains only. Empty mound vertices clear immediately. Swept grains fan sideways, lie flatter, lose most residual brush velocity, and settle without increasing height after release. A new pour is the only way to add fresh mound material. The pressed flag survives compaction.

Removed the minimum two-unit displacement per pointer event: tiny movements no longer produce oversized transport. Busy input queues merge adjacent path segments rather than discarding the first material-contact section of a fast sweep.

As explicitly requested, automatic completion now assists the last 5% in Fast mode or 2% in Detailed mode. Upon advancement the remaining target pixels fill before bending, and completed coats bake without gaps. Advancement still waits for the first finger to release. Both percentages and the next button share the same readiness decision.

Regression tests cover no mound regrowth or per-packet height inflation after release, finite material conservation, sideways grain spreading, small pointer movements, compaction, preservation of fast input paths, and both completion tolerances. A browser fixture starting at 96% confirms that the actual game controller seals and advances to colour two without further painting.
