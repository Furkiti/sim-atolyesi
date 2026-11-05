# v10.2 · Hold to speed up peeling

During the tweezers/peel sequence, holding the canvas or the lower hold button runs the existing sequential peel timeline at 4× speed. Release immediately restores 1×. The initial press can start and accelerate the first peel in one gesture. The same primary-pointer gate and capture protect against secondary fingers.

All pieces retain their edge grip, curl and sequence. Gotham's five black pieces take 12.43 seconds normally, or about 3.11 seconds with uninterrupted hold. Çilekli Kedi's seven pink pieces take 17.40 seconds normally, or 4.35 seconds held. The boost applies only to the peel clock. Starting the pour clears held input, so acceleration never carries into pouring or the glitter cascade. The lower button and context text indicate the current speed. Existing keyboard accessibility (Enter/Space toggle) also supports peel acceleration.

Validation: `npm run build`; `npm test` — 90 passing tests. Added checks for the fourfold rate, immediate release, every piece being visited, a single transition to pour, and unchanged pour/collection timing. Browser UI at 390×844 exercised start, acceleration, release, and uninterrupted seven-piece acceleration. All seven indices were observed; the pour began at speed 1 with held input cleared. No browser warnings/errors. Browser sustained holding uses the real keyboard accessibility control; physical touchscreen long-press has not been exercised in this environment.

The user's unfinished follow-up about another change to hold mode remains awaiting clarification; this release implements the fully specified peel speed request.
