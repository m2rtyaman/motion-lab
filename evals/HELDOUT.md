# Held-out (private) tasks

`evals/solutions/` is an answer key and is readable by any model working in this repo. For a fair
comparison keep a private task set OUTSIDE the repo and score against it:

    pnpm eval:score --project eval-<task>-<model> --tasks-dir D:/private-evals/tasks
    node scripts/eval-visual.mjs --project <slug> --tasks-dir D:/private-evals/tasks --answers a.json --judge <other-model>

## Make a private task

    <private>/tasks/<id>/TASK.md       the brief the model gets (copy the layout of evals/tasks/*/TASK.md, incl. "Delivery spec")
    <private>/tasks/<id>/rubric.json   same schema as evals/tasks/*/rubric.json (task id == folder name)
    <private>/tasks/VISUAL_RUBRIC.md   optional: `## <id>` sections with `- \`id\` question` lines (see evals/VISUAL_RUBRIC.md)
    <private>/tasks/<id>/solution/     optional: your reference Scene.tsx; it joins the C001 copy check
    <private>/solutions/<id>/Scene.tsx same, if you prefer a sibling folder

Tips: change the numbers, copy and layout of an existing task (new brand, new count, new aspect) so a memorised
public solution does not fit; keep the folder out of git and out of the tested model's working directory;
give the model only TASK.md. Score with the same flags; C001, T014, the browser probe, integrity and judge rules all apply (judges must be listed in evals/judges.json).
