# Visual rubric (for a vision model or a person)

The structural score (`pnpm eval:score`) reads timelines and source. It cannot see the picture, so it cannot tell a bouncing
ball from a ball that jumps in place, or a closing frame with a headline from one without. This rubric closes that gap.

**Inputs:** `out/<slug>/visual-audit-grid.png` (contact sheet, left to right, top to bottom = time) and, when a detail is unclear,
the single frames in `out/<slug>/vision/frames/` (`f<frame>.png`). Create them with `pnpm render:contact-sheet --project <slug>`.
Also the brief: `evals/tasks/<task>/TASK.md`.

**How to answer:** every question is yes/no and must be answerable from the images. Answer `true` only when you can point at the
frames that show it. When in doubt, or when the images do not show it, answer `false`. Do not give credit for intent in code.

Scoring (`scripts/eval-visual.mjs`): task questions are 70 points, generic questions 30 points, split evenly inside each block.
Unanswered questions count as `false`. This is a separate "Visual /100" number; it is never added to the structural score.

Question format: ``- `id` question`` (the ids are what `--answers` uses).

## generic
- `generic.legible` Is every piece of text clearly legible at phone size (looks 18 px or larger on a 1080 px short side, good contrast, not blurred in the closing frames)?
- `generic.safe-zone` Is all important content inside the safe zone (nothing touching the frame edge; for 9:16 nothing in the top ~250 px or bottom ~300 px)?
- `generic.focal-point` Does each frame have one clear focal point, so you know where to look?
- `generic.no-empty` Are all frames populated (no blank or near-empty frame except an intentional first frame or a deliberate pause)?
- `generic.no-overlap` Is every text and element free of unintended overlap or clipping (nothing cut by the frame, nothing covering other text)?
- `generic.final-still` Is the last frame a clean, finished composition, identical to the frame just before it (stillness, nothing half-animated)?

## bouncing-ball
- `bouncing-ball.travels` Does the ball move from the left part of the frame to the right part across the sheet (it is NOT in the same place in the first and last frames)?
- `bouncing-ball.arcs` Does the ball's path look like a chain of arcs, with a distinct apex between each contact with the floor?
- `bouncing-ball.decay` Is each bounce visibly lower than the one before?
- `bouncing-ball.squash` Is the ball visibly flattened (wider than tall) at or just after at least one floor contact?
- `bouncing-ball.floor` Is a floor line visible and does the ball touch it at each contact (it does not sink through or hover above it)?
- `bouncing-ball.rest` Does the ball end at rest on the floor in the last frames?
- `bouncing-ball.soft` Does the ball read as a soft, round, rubbery ball (circular when not squashed, not a box or ellipse at rest)?

## anticipation-jump
- `anticipation-jump.crouch` In a frame before the jump, is the character visibly compressed or dipped lower than at rest (the wind-up)?
- `anticipation-jump.stretch` During the jump, is the character visibly stretched (taller than at rest) while moving up?
- `anticipation-jump.target` Is a marked target spot visible above the character, and does the character end on it?
- `anticipation-jump.landing` Is there visible landing compression or settling after the character arrives (it does not just stop)?
- `anticipation-jump.ground` Is a ground line visible with the character standing on it before the jump?
- `anticipation-jump.calm-end` Is the character calm and still in the final frames?

## character-walk-react
- `character-walk-react.character` Does the character look like a figure (head, body, two legs and arms as separate shapes)?
- `character-walk-react.walk-poses` Do the frames during the walk show different leg poses (legs apart, then together, then apart), not one pose sliding?
- `character-walk-react.travel` Does the character move clearly from the left toward the middle of the frame?
- `character-walk-react.object` Is the thing it notices visible on the ground ahead of it, before the reaction?
- `character-walk-react.pause` Is there a stretch of frames where the character has stopped and is turned or leaning toward the object before it reacts?
- `character-walk-react.reaction` Does a frame after the pause show a clear surprised pose (head tilted back or body recoiled, with the "!" or similar mark)?
- `character-walk-react.calm-end` Is the final frame calm, with the character and the object both visible?

## product-ui-feature
- `product-ui-feature.window` Is the app UI inside a believable window or app shell (title bar or frame), not floating in empty space?
- `product-ui-feature.before` Do early frames show an unsorted inbox of saved links?
- `product-ui-feature.click` Is the "Sort into collections" button visible and is there a visible click (cursor on it, pressed or highlighted)?
- `product-ui-feature.after` Do later frames show the links grouped under Design, Reading list, Recipes and Nature?
- `product-ui-feature.headline-final` Does the final frame show the headline "Saves that sort themselves", readable?
- `product-ui-feature.cta-final` Does the final frame show the call to action "Try Tidemark free" as a clear button or line?
- `product-ui-feature.no-fake-data` Is the UI free of invented server telemetry or fake metrics (no ops/sec, latency, uptime numbers)?
- `product-ui-feature.hierarchy` In the final frame, are headline, button and brand mark arranged with a clear order and spacing (not crowded or stacked on each other)?

## logo-sting
- `logo-sting.mark` Is a simple mark made of basic shapes visible next to the name?
- `logo-sting.name` Does the final frame show the name "Halcyon" large and clear?
- `logo-sting.tagline` Does the final frame show the tagline "Calm software." clearly smaller than the name and below or beside it?
- `logo-sting.lockup` Do mark, name and tagline form one balanced lockup, centred or deliberately aligned?
- `logo-sting.quiet` Does the sequence feel calm (no flashy effects, no extra slogans)?
- `logo-sting.build` Do the early frames show the mark appearing before the full lockup (it builds, it does not just appear)?

## stat-counter
- `stat-counter.counts` Do the frames show the number growing (a smaller number early, 48,200 at the end)?
- `stat-counter.final-number` Is the final number "48,200" large and the most prominent element?
- `stat-counter.label` Does the final frame show the label "riders this month" under or next to the number?
- `stat-counter.brand` Does the final frame show "Harbor Line"?
- `stat-counter.no-jitter` Do the digits stay in the same horizontal positions while counting (no sideways jumping)?
- `stat-counter.safe-zone` Is the number inside the vertical safe zone (not under the top bar or bottom caption area)?
- `stat-counter.hierarchy` Is the order of importance clear: number first, label second, brand third?

## kinetic-manifesto
- `kinetic-manifesto.one-line` In every frame, does one line own the screen (no two full lines competing)?
- `kinetic-manifesto.order` Do the lines appear in the order "Less noise." then "More signal." then "Say it once."?
- `kinetic-manifesto.size` Is the type huge and easy to read on a phone?
- `kinetic-manifesto.final` Is "Say it once." fully visible and still in the final frames?
- `kinetic-manifesto.no-decoration` Is the piece typography only (no photos, icons or logo)?
- `kinetic-manifesto.safe-zone` Is all text inside the vertical safe zone of a phone feed?

## list-reveal
- `list-reveal.title` Does a frame show the title "How we work"?
- `list-reveal.all-five` Does the final frame show all five steps (Listen, Sketch, Prototype, Animate, Ship) in order?
- `list-reveal.order` Do the steps appear one after another in that order, not all at once?
- `list-reveal.hero` Is "Animate" visibly emphasised in the final frame (bigger, brighter, highlighted or scaled)?
- `list-reveal.alignment` Are the five steps aligned and evenly spaced?
- `list-reveal.readable` Is every step readable in the final frame (no overlap, no clipping)?

## Compare (only with `--compare`)

`node scripts/eval-visual.mjs --compare ...` also renders the task's reference solution (`evals/solutions/<task>`) and asks a judge to hold the candidate's contact sheet next to the reference's. Each question below is answered `true` when the candidate is at least as good as the reference on that point, `false` when it is worse or you cannot tell. The answers JSON must repeat both hashes (`imageHash` of the candidate, `referenceHash` of the reference). The result is shown as "vs reference" next to the Visual score; it is advisory, like the rest of the visual score.

## compare
- `compare.layout` Is the layout of the candidate at least as clear as the reference (one focal point, clear grouping, even spacing, nothing crowded or floating)?
- `compare.type` Is the type scale of the candidate at least as good as the reference (hierarchy is obvious, sizes read on a phone, no micro text)?
- `compare.motion` Is the motion in the candidate at least as readable as the reference (the contact sheet shows distinct stages, each frame different in a meaningful way)?
- `compare.polish` Is the candidate at least as polished as the reference (colour contrast, alignment, no stray or half-finished elements, a clean last frame)?

## compare-bouncing-ball
- `bouncing-ball.cmp-layout` Is the layout of ball, floor and trail at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `bouncing-ball.cmp-type` Is the type scale for the ball and its squash at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `bouncing-ball.cmp-motion` Is the motion shown for the arcs and the decay of the bounces at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `bouncing-ball.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

## compare-anticipation-jump
- `anticipation-jump.cmp-layout` Is the layout of character, ground and target at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `anticipation-jump.cmp-type` Is the type scale for the character poses (crouch, stretch, landing) at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `anticipation-jump.cmp-motion` Is the motion shown for the wind-up, jump and landing at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `anticipation-jump.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

## compare-character-walk-react
- `character-walk-react.cmp-layout` Is the layout of figure, ground and object at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `character-walk-react.cmp-type` Is the type scale for the figure and the reaction mark at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `character-walk-react.cmp-motion` Is the motion shown for the walk, pause and surprised reaction at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `character-walk-react.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

## compare-product-ui-feature
- `product-ui-feature.cmp-layout` Is the layout of window, headline, button and collections at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `product-ui-feature.cmp-type` Is the type scale for the UI text, the headline and the call to action at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `product-ui-feature.cmp-motion` Is the motion shown for the click and the sorted result at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `product-ui-feature.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

## compare-logo-sting
- `logo-sting.cmp-layout` Is the layout of mark, name and tagline lockup at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `logo-sting.cmp-type` Is the type scale for the name against the tagline at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `logo-sting.cmp-motion` Is the motion shown for the build of the mark into the lockup at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `logo-sting.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

## compare-stat-counter
- `stat-counter.cmp-layout` Is the layout of number, label and brand at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `stat-counter.cmp-type` Is the type scale for the big number against the label and brand at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `stat-counter.cmp-motion` Is the motion shown for the count-up and the settle at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `stat-counter.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

## compare-kinetic-manifesto
- `kinetic-manifesto.cmp-layout` Is the layout of one line at a time on screen at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `kinetic-manifesto.cmp-type` Is the type scale for the huge type at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `kinetic-manifesto.cmp-motion` Is the motion shown for how each line takes over from the last at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `kinetic-manifesto.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

## compare-list-reveal
- `list-reveal.cmp-layout` Is the layout of title and the five steps at least as clear as in the reference (one focal point, clear grouping, even spacing, nothing crowded)?
- `list-reveal.cmp-type` Is the type scale for the title against the step text at least as good as in the reference (obvious hierarchy, sizes that read on a phone)?
- `list-reveal.cmp-motion` Is the motion shown for how the steps arrive and how Animate is emphasised at least as readable on the contact sheet as in the reference (distinct stages, each frame different in a meaningful way)?
- `list-reveal.cmp-polish` Is the candidate at least as polished as the reference (contrast, alignment, no stray elements, a clean still last frame)?

