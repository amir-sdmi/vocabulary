import {
  MemoryGraph,
  MemoryGraphCluster,
  MemoryGraphEdge,
  MemoryGraphNode,
  ReviewErrorType,
  VocabEntry,
} from "@/app/features/vocabulary/types";
import { getPracticeAttempts } from "@/app/lib/practice";
import { getVocabularies } from "@/app/lib/vocabulary";

function nodeId(type: MemoryGraphNode["type"], label: string): string {
  return `${type}:${label.toLowerCase()}`;
}

function edgeId(type: MemoryGraphEdge["type"], a: string, b: string): string {
  const [from, to] = [a, b].sort((x, y) => x.localeCompare(y));
  return `${type}:${from}:${to}`;
}

function addNode(
  map: Map<string, MemoryGraphNode>,
  node: Omit<MemoryGraphNode, "weight"> & { weight?: number },
) {
  const existing = map.get(node.id);
  if (existing) {
    existing.weight += node.weight ?? 1;
    return;
  }
  map.set(node.id, { ...node, weight: node.weight ?? 1 });
}

function addEdge(
  map: Map<string, MemoryGraphEdge>,
  edge: Omit<MemoryGraphEdge, "id" | "weight"> & { weight?: number },
) {
  const id = edgeId(edge.type, edge.from, edge.to);
  const existing = map.get(id);
  if (existing) {
    existing.weight += edge.weight ?? 1;
    return;
  }
  map.set(id, { id, ...edge, weight: edge.weight ?? 1 });
}

function termNode(entry: VocabEntry): MemoryGraphNode {
  return {
    id: nodeId("term", entry.term),
    type: "term",
    label: entry.term,
    weight: 1 + entry.useCount * 0.1 + (entry.lapses > 0 ? entry.lapses * 0.2 : 0),
    vocabId: entry.id,
  };
}

function addLexicalEdges(edgeMap: Map<string, MemoryGraphEdge>, source: VocabEntry) {
  const sourceId = nodeId("term", source.term);
  for (const coll of source.collocations) {
    const collId = nodeId("collocation", coll);
    addEdge(edgeMap, { from: sourceId, to: collId, type: "collocates_with", weight: 1 });
  }
  for (const syn of source.synonyms) {
    const synId = nodeId("term", syn);
    addEdge(edgeMap, { from: sourceId, to: synId, type: "synonym_of", weight: 1 });
  }
  for (const ant of source.antonyms) {
    const antId = nodeId("term", ant);
    addEdge(edgeMap, { from: sourceId, to: antId, type: "antonym_of", weight: 1 });
  }
  for (const family of [
    source.wordFamily.noun,
    source.wordFamily.verb,
    source.wordFamily.adjective,
    source.wordFamily.adverb,
  ]) {
    if (!family) continue;
    const familyId = nodeId("term", family);
    addEdge(edgeMap, { from: sourceId, to: familyId, type: "family_of", weight: 1 });
  }
}

function buildClusters(nodes: MemoryGraphNode[], edges: MemoryGraphEdge[]): MemoryGraphCluster[] {
  const clusters: MemoryGraphCluster[] = [];
  const edgeByTerm = new Map<string, MemoryGraphEdge[]>();
  for (const edge of edges) {
    if (!edgeByTerm.has(edge.from)) edgeByTerm.set(edge.from, []);
    if (!edgeByTerm.has(edge.to)) edgeByTerm.set(edge.to, []);
    edgeByTerm.get(edge.from)!.push(edge);
    edgeByTerm.get(edge.to)!.push(edge);
  }
  const termNodes = nodes.filter((n) => n.type === "term").sort((a, b) => b.weight - a.weight);
  for (const term of termNodes.slice(0, 5)) {
    const related = edgeByTerm
      .get(term.id)
      ?.sort((a, b) => b.weight - a.weight)
      .slice(0, 4)
      .map((e) => (e.from === term.id ? e.to : e.from)) ?? [];
    if (related.length === 0) continue;
    clusters.push({
      id: `cluster:${term.id}`,
      label: `Context around "${term.label}"`,
      nodeIds: [term.id, ...related],
      score: Math.round((related.length + term.weight) * 10) / 10,
      reason: "High connectivity with collocations, relations, or repeated practice patterns.",
    });
  }
  return clusters;
}

function buildRecommendations(input: {
  vocab: VocabEntry[];
  clusters: MemoryGraphCluster[];
}): MemoryGraph["recommendations"] {
  const trouble = input.vocab
    .filter((v) => v.status === "trouble" || v.lapses >= 2)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 4);
  const recs: MemoryGraph["recommendations"] = [];
  if (trouble.length > 0) {
    recs.push({
      title: "Repair your weakest chain",
      description: "Run weak-area mode with these words and produce one sentence for each.",
      focusTerms: trouble.map((x) => x.term),
      reason: "Repeated lapses indicate unstable retrieval paths.",
    });
  }
  const stale = input.vocab
    .filter((v) => (v.lastUsedAt ?? 0) < Date.now() - 3 * 24 * 60 * 60 * 1000 && v.status !== "new")
    .slice(0, 4);
  if (stale.length > 0) {
    recs.push({
      title: "Use-it-today refresh",
      description: "Practice active usage for stale words to keep them production-ready.",
      focusTerms: stale.map((x) => x.term),
      reason: "Terms not used recently are likely to decay.",
    });
  }
  if (input.clusters.length > 0) {
    const top = input.clusters[0];
    const focusTerms = top.nodeIds
      .filter((id) => id.startsWith("term:"))
      .map((id) => id.replace(/^term:/, ""))
      .slice(0, 5);
    recs.push({
      title: "Deepen one semantic cluster",
      description: "Pick one connected cluster and write a short paragraph using 3-5 linked terms.",
      focusTerms,
      reason: top.reason,
    });
  }
  return recs.slice(0, 3);
}

export async function buildMemoryGraph(userId: string): Promise<MemoryGraph> {
  const [vocab, attempts] = await Promise.all([getVocabularies(userId), getPracticeAttempts(userId)]);
  const nodeMap = new Map<string, MemoryGraphNode>();
  const edgeMap = new Map<string, MemoryGraphEdge>();

  for (const entry of vocab) {
    addNode(nodeMap, termNode(entry));
    for (const tag of entry.tags) {
      const id = nodeId("tag", tag);
      addNode(nodeMap, { id, type: "tag", label: `#${tag}` });
      addEdge(edgeMap, {
        from: nodeId("term", entry.term),
        to: id,
        type: "tag_of",
      });
    }
    for (const coll of entry.collocations) {
      const id = nodeId("collocation", coll);
      addNode(nodeMap, { id, type: "collocation", label: coll });
    }
    for (const rel of [...entry.synonyms, ...entry.antonyms]) {
      const relId = nodeId("term", rel);
      addNode(nodeMap, { id: relId, type: "term", label: rel });
    }
    for (const family of [
      entry.wordFamily.noun,
      entry.wordFamily.verb,
      entry.wordFamily.adjective,
      entry.wordFamily.adverb,
    ]) {
      if (!family) continue;
      const familyId = nodeId("term", family);
      addNode(nodeMap, { id: familyId, type: "term", label: family });
    }
    addLexicalEdges(edgeMap, entry);
  }

  const attemptsByVocab = new Map<string, ReviewErrorType[]>();
  for (const attempt of attempts.slice(0, 500)) {
    if (!attemptsByVocab.has(attempt.vocabId)) attemptsByVocab.set(attempt.vocabId, []);
    attemptsByVocab.get(attempt.vocabId)!.push(...attempt.errors);
  }

  const vocabById = new Map(vocab.map((v) => [v.id, v]));
  for (const [vocabId, errors] of attemptsByVocab) {
    const v = vocabById.get(vocabId);
    if (!v) continue;
    const termId = nodeId("term", v.term);
    const freq = new Map<ReviewErrorType, number>();
    for (const e of errors) freq.set(e, (freq.get(e) ?? 0) + 1);
    for (const [error, count] of freq.entries()) {
      const errorId = nodeId("error", error);
      addNode(nodeMap, { id: errorId, type: "error", label: error, weight: count / 2 });
      addEdge(edgeMap, {
        from: termId,
        to: errorId,
        type: "shares_error",
        weight: count,
      });
    }
  }

  const recentTerms = attempts
    .slice(0, 50)
    .map((a) => vocabById.get(a.vocabId)?.term)
    .filter(Boolean) as string[];
  for (let i = 0; i < recentTerms.length - 1; i += 1) {
    const a = nodeId("term", recentTerms[i]);
    const b = nodeId("term", recentTerms[i + 1]);
    if (a === b) continue;
    addEdge(edgeMap, { from: a, to: b, type: "co_practiced", weight: 0.5 });
  }

  const nodes = Array.from(nodeMap.values()).sort((a, b) => b.weight - a.weight);
  const edges = Array.from(edgeMap.values()).sort((a, b) => b.weight - a.weight);
  const clusters = buildClusters(nodes, edges);
  const recommendations = buildRecommendations({ vocab, clusters });

  return {
    builtAt: Date.now(),
    nodes: nodes.slice(0, 180),
    edges: edges.slice(0, 360),
    clusters,
    recommendations,
  };
}
