/**
 * ContentGraph Intermediate Representation (RFC-06).
 *
 * Structured sequence graph consumed by frame-composers to sequence
 * multi-frame video presentations, with topological dependency sorting.
 */

export type NodeKind = 'entity' | 'data' | 'text';

export interface BaseNode {
  id: string;
  kind: NodeKind;
  label?: string;
  frameIntent?: string;
  durationSec?: number;
}

export interface EntityNode extends BaseNode {
  kind: 'entity';
  props: Record<string, unknown>;
}

export interface DataNode extends BaseNode {
  kind: 'data';
  data: unknown;
}

export interface TextNode extends BaseNode {
  kind: 'text';
  text: string;
}

export type Node = EntityNode | DataNode | TextNode;

export type EdgeKind = 'sequence' | 'contrast' | 'dependency';

export interface Edge {
  from: string;
  to: string;
  kind: EdgeKind;
  reason?: string;
}

export interface ContentGraph {
  schemaVersion: 1;
  intent:
    | 'single-frame'
    | 'explainer'
    | 'data-viz'
    | 'promo'
    | 'comparison'
    | 'other';
  synopsis?: string;
  nodes: Node[];
  edges: Edge[];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface GraphValidationError {
  code:
    | 'duplicate-node-id'
    | 'edge-from-unknown-node'
    | 'edge-to-unknown-node'
    | 'self-edge'
    | 'cycle'
    | 'empty-graph'
    | 'invalid-kind';
  message: string;
  ref?: string;
}

export interface GraphValidationResult {
  ok: boolean;
  errors: GraphValidationError[];
  warnings: GraphValidationError[];
}

export function validateContentGraph(graph: ContentGraph): GraphValidationResult {
  const errors: GraphValidationError[] = [];
  const warnings: GraphValidationError[] = [];

  if (!graph.nodes || graph.nodes.length === 0) {
    errors.push({ code: 'empty-graph', message: 'Graph has no nodes' });
    return { ok: false, errors, warnings };
  }

  const ids = new Set<string>();
  for (const n of graph.nodes) {
    if (ids.has(n.id)) {
      errors.push({
        code: 'duplicate-node-id',
        message: `Duplicate node id "${n.id}"`,
        ref: n.id,
      });
    }
    ids.add(n.id);
    const kind = (n as { kind: string }).kind;
    if (kind !== 'entity' && kind !== 'data' && kind !== 'text') {
      errors.push({
        code: 'invalid-kind',
        message: `Node "${(n as { id: string }).id}" has unknown kind "${kind}"`,
        ref: (n as { id: string }).id,
      });
    }
  }

  for (const e of graph.edges) {
    if (e.from === e.to) {
      errors.push({
        code: 'self-edge',
        message: `Edge ${e.from} → ${e.to} is a self-edge`,
        ref: `${e.from}->${e.to}`,
      });
    }
    if (!ids.has(e.from)) {
      errors.push({
        code: 'edge-from-unknown-node',
        message: `Edge from unknown node "${e.from}"`,
        ref: `${e.from}->${e.to}`,
      });
    }
    if (!ids.has(e.to)) {
      errors.push({
        code: 'edge-to-unknown-node',
        message: `Edge to unknown node "${e.to}"`,
        ref: `${e.from}->${e.to}`,
      });
    }
  }

  // Cycle detection on dependency edges
  const cycleNode = findDependencyCycle(graph);
  if (cycleNode) {
    errors.push({
      code: 'cycle',
      message: `Dependency cycle detected involving node "${cycleNode}"`,
      ref: cycleNode,
    });
  }

  return { ok: errors.length === 0, errors, warnings };
}

// ---------------------------------------------------------------------------
// Topo sort
// ---------------------------------------------------------------------------

export function topoSortNodes(graph: ContentGraph): string[] {
  const indeg = new Map<string, number>();
  const deps = new Map<string, string[]>();
  const nodeOrder = new Map<string, number>();
  graph.nodes.forEach((n, i) => {
    indeg.set(n.id, 0);
    deps.set(n.id, []);
    nodeOrder.set(n.id, i);
  });
  for (const e of graph.edges) {
    if (e.kind !== 'dependency') continue;
    if (!indeg.has(e.from) || !indeg.has(e.to)) continue;
    deps.get(e.from)!.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  }

  const seqAfter = new Map<string, Set<string>>();
  for (const e of graph.edges) {
    if (e.kind !== 'sequence') continue;
    if (!indeg.has(e.from) || !indeg.has(e.to)) continue;
    if (!seqAfter.has(e.from)) seqAfter.set(e.from, new Set());
    seqAfter.get(e.from)!.add(e.to);
  }

  const ready: string[] = [];
  for (const [id, d] of indeg) if (d === 0) ready.push(id);
  ready.sort((a, b) => (nodeOrder.get(a) ?? 0) - (nodeOrder.get(b) ?? 0));

  const out: string[] = [];
  while (ready.length > 0) {
    let pickIdx = 0;
    for (let i = 0; i < ready.length; i++) {
      const cand = ready[i]!;
      const blockedBySequence = ready.some(
        (other) => other !== cand && seqAfter.get(other)?.has(cand),
      );
      if (!blockedBySequence) {
        pickIdx = i;
        break;
      }
    }
    const next = ready.splice(pickIdx, 1)[0]!;
    out.push(next);
    for (const succ of deps.get(next) ?? []) {
      indeg.set(succ, (indeg.get(succ) ?? 1) - 1);
      if (indeg.get(succ) === 0) {
        const ord = nodeOrder.get(succ) ?? 0;
        let insertAt = ready.length;
        for (let i = 0; i < ready.length; i++) {
          if ((nodeOrder.get(ready[i]!) ?? 0) > ord) {
            insertAt = i;
            break;
          }
        }
        ready.splice(insertAt, 0, succ);
      }
    }
  }

  if (out.length !== graph.nodes.length) {
    throw new Error(
      `topoSortNodes: cycle detected (sorted ${out.length} of ${graph.nodes.length} nodes)`,
    );
  }
  return out;
}

function findDependencyCycle(graph: ContentGraph): string | null {
  const adj = new Map<string, string[]>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) {
    if (e.kind !== 'dependency') continue;
    if (!adj.has(e.from) || !adj.has(e.to)) continue;
    adj.get(e.from)!.push(e.to);
  }
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map<string, number>();
  for (const id of adj.keys()) color.set(id, WHITE);
  const stack: { id: string; iter: Iterator<string> }[] = [];
  for (const start of adj.keys()) {
    if (color.get(start) !== WHITE) continue;
    color.set(start, GRAY);
    stack.push({ id: start, iter: adj.get(start)![Symbol.iterator]() });
    while (stack.length > 0) {
      const top = stack[stack.length - 1]!;
      const next = top.iter.next();
      if (next.done) {
        color.set(top.id, BLACK);
        stack.pop();
      } else {
        const c = color.get(next.value);
        if (c === GRAY) return next.value;
        if (c === WHITE) {
          color.set(next.value, GRAY);
          stack.push({ id: next.value, iter: adj.get(next.value)![Symbol.iterator]() });
        }
      }
    }
  }
  return null;
}

export function getNode(graph: ContentGraph, id: string): Node | undefined {
  return graph.nodes.find((n) => n.id === id);
}

export const DEFAULT_FRAME_DURATION_SEC = 3;

export function totalDurationSec(graph: ContentGraph): number {
  const order = topoSortNodes(graph);
  let total = 0;
  for (const id of order) {
    const n = getNode(graph, id);
    total += n?.durationSec ?? DEFAULT_FRAME_DURATION_SEC;
  }
  return total;
}
