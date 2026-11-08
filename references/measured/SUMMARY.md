# Measured reference summary

Derived from **33 clips** (of 38 local previews; 5 dropped as screen-recorded tech demos or off-topic) in the
third-party catalog described in README.md. Stats are median [p25-p75]; times in seconds, frames@60 in parentheses.
Method: `scripts/measure-reference.mjs`. Counts: kinetic/editorial 10, UI/product 5, stings 4, character 9, camera/spatial 5.
UI (n=5, 7 events) and stings (n=4) are small samples: indicative only.

## Per-category statistics

| metric | kinetic_editorial (n=10) | ui_product (n=5) | brand_sting (n=4) | character (n=9) | spatial_other (n=5) | all (n=33) |
|---|---|---|---|---|---|---|
| interior shot length s | 1.98 (119f) [0.51-2.74] n=18 | n/a | 0.47 (28f) [0.18-1.74] n=18 | 0.50 (30f) [0.46-1.00] n=9 | n/a | 0.62 (38f) [0.46-2.38] n=45 |
| motion-onset spacing ("beat") s | 1.58 (95f) [0.67-2.92] n=21 | 3.65 (219f) [3.55-3.74] n=2 | 1.12 (67f) [0.90-1.66] n=15 | 0.83 (50f) [0.38-1.88] n=29 | 0.63 (38f) [0.63-0.63] n=1 | 1.15 (69f) [0.58-2.26] n=68 |
| cuts per 10 s * | 2.5 [0.2-3.9] n=10 | 0.0 [0.0-0.0] n=5 | 4.2 [3.1-6.1] n=4 | 0.0 [0.0-0.0] n=9 | 0.0 [0.0-0.0] n=5 | 0.0 [0.0-3.3] n=33 |
| mid-clip hold length s | 0.46 (27f) [0.34-0.97] n=26 | 0.42 (25f) [0.38-0.75] n=5 | 0.46 (28f) [0.26-0.65] n=6 | 0.38 (22f) [0.29-0.69] n=11 | 0.65 (39f) [0.31-1.30] n=10 | 0.46 (27f) [0.29-0.97] n=58 |
| final hold s (only clips that end still) | 0.38 (22f) [0.31-0.44] n=2 | 1.33 (80f) [1.33-1.33] n=1 | 1.79 (108f) [1.79-1.79] n=1 | n/a | 8.00 (480f) [8.00-8.00] n=1 | 1.33 (80f) [0.50-1.79] n=5 |
| motion-event duration s | 0.29 (18f) [0.23-1.21] n=31 | 2.67 (160f) [0.90-3.08] n=7 | 0.43 (26f) [0.19-0.75] n=19 | 0.42 (25f) [0.23-0.92] n=39 | 2.38 (142f) [0.62-5.50] n=5 | 0.50 (30f) [0.25-1.25] n=101 |
| onset->peak s | 0.21 (12f) [0.10-0.35] n=31 | 0.50 (30f) [0.33-1.35] n=7 | 0.15 (9f) [0.08-0.38] n=19 | 0.21 (12f) [0.08-0.46] n=39 | 0.46 (27f) [0.21-2.79] n=5 | 0.21 (12f) [0.08-0.46] n=101 |
| peak->rest s | 0.21 (12f) [0.15-0.60] n=31 | 1.00 (60f) [0.71-1.77] n=7 | 0.17 (10f) [0.12-0.53] n=19 | 0.21 (12f) [0.15-0.44] n=39 | 2.08 (125f) [0.21-2.21] n=5 | 0.25 (15f) [0.13-0.58] n=101 |
| asymmetry (rest/onset) | 1.3 [1.0-1.9] n=31 | 1.6 [1.0-3.1] n=7 | 1.7 [0.7-3.0] n=19 | 1.0 [0.7-2.0] n=39 | 0.6 [0.6-1.0] n=5 | 1.3 [0.7-2.0] n=101 |
| event peak speed px/f (regional) | 8.3 [1.4-20.6] n=31 | 12.7 [8.0-30.3] n=7 | 26.1 [5.1-76.6] n=19 | 5.0 [0.4-16.6] n=39 | 9.2 [0.7-14.3] n=5 | 9.2 [1.8-22.8] n=101 |
| video p95 speed px/f (regional) | 10.8 [5.5-20.7] n=10 | 9.6 [6.5-10.9] n=5 | 19.3 [13.1-41.4] n=4 | 12.6 [6.2-18.1] n=9 | 0.6 [0.3-4.0] n=5 | 10.1 [4.5-18.1] n=33 |
| video p95 speed px/f (global) | 4.5 [1.5-8.0] n=10 | 5.3 [4.1-7.5] n=5 | 10.6 [4.5-24.4] n=4 | 2.5 [2.0-7.0] n=9 | 0.3 [0.1-2.9] n=5 | 4.1 [1.4-7.5] n=33 |
| % frames near-still | 3.7 [0.1-40.0] n=10 | 14.6 [0.0-16.0] n=5 | 11.8 [5.5-24.1] n=4 | 2.6 [0.7-15.6] n=9 | 6.3 [0.0-70.0] n=5 | 6.3 [0.0-33.8] n=33 |

\* cuts = energy spike >4x neighbourhood with frame correlation <0.6 (a full-frame wipe can also trigger it). "Interior shot"
excludes each clip's first/last (truncated) shot. "Beat" = spacing between successive motion-event onsets. Speeds are px/frame at
1080 short-side, 60 fps. Final hold: 28 of 33 clips end in motion; the row covers only the 5 that end still.

## Calibration (recommended values for the harness)

| quantity | recommended | evidence |
|---|---|---|
| beat / micro-beat spacing | 0.8-1.6 s (50-95 f); bounds 0.6-3.0 s | medians 0.83 char, 1.12 sting, 1.58 kinetic |
| shot length where cuts exist | 1.0-2.7 s, never uniform | interior shots 1.98 [0.51-2.74]; stings 0.47 |
| cuts per 10 s | editorial 0-4; stings 3-6; UI/character/camera 0 | 2.5 / 4.2 / 0 / 0 / 0 |
| single motion event | 0.25-0.5 s (15-30 f); hero moves up to ~1.0 s | median 0.29-0.43, p75 0.75-0.92 |
| onset to peak speed | 0.1-0.25 s (6-15 f) | 0.15-0.21 s |
| settle | 1.3-1.7x onset; 2-2.6x only for hero/sting pops | asymmetry 1.3 / 1.6 / 1.7 / 1.0-1.4 |
| hold between actions | 0.3-0.7 s (18-42 f) near-still | mid-clip holds 0.38-0.46 [0.29-0.97] |
| max comfortable peak speed | <= ~30 px/f UI/editorial/character; impact hits <= ~80 px/f for <= 3 f | event peak p75 17-30; sting 77 |
| sustained speed | 5-15 px/f regional p95; camera 2-6 px/f | video p95 medians 9.6-12.6; global 2.5-5.3 |
| near-still frames | 3-15 % | 3.7 / 14.6 / 11.8 / 2.6 |
| min final hold | keep 1.2 s (72 f) as design rule; data cannot confirm | 5/33 clips end still, 0.4-1.8 s |

Character (n=9): action 0.42 s (25 f) [0.23-0.92]; onset 0.21 / settle 0.21 s (1.4x once sub-0.1 s settles excluded); onset spacing
0.83 s (50 f); holds between actions 0.38 s (22 f); cut-free; regional p95 12.6, global 2.5 px/f. No realistic creatures in sample.

## Mismatches with current tokens/rules

- Event durations match DURATIONS (0.2-0.8 s); `instant 0.12` is below the 41.7 ms clip grain (unverifiable).
- MOTION_MATH "settle 2-3x the approach" (pop 0.18+0.42 = 2.3x) is stronger than measured 1.3x kinetic / 1.0-1.4x character.
- Overshoot (2-10 %) is not measurable at 24 fps: unvalidated.
- Speed ceiling 60-100 px/f (budget up to 100) is looser than references (non-sting p75 ~17-30, stings ~77; matcher saturates ~35 px/f).
- Law 1 "zero cuts" is stricter than editorial references (2.5 cuts/10 s; stings 4.2); UI/character/camera pieces have none.
- Micro-beat 1.0-1.5 s is consistent; wide shot spread supports sigma > 14 f. 1.2 s final hold unconfirmed (excerpted clips).
- Stagger/lead tokens (0.025-0.16 s) are at/below frame grain: not measurable.

## Limits

38 local previews only (catalog lists 245; rest are posters), 480-640 px, 6-10 s excerpts, 24 fps (one 60): 41.7 ms resolution,
truncated final holds. Energy = mean abs gray diff at 192 px; codec noise sets the still floor (0.3, up to 0.5). Speed = 4x3 block
matching, camera and object motion not separated (global = median, regional = 80th percentile), <2 px/f is noise, wipes/dissolves
untracked. Events are energy peaks, not semantic actions. Categories are subjective.
