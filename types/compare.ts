export interface MatchingFace {
  confidence: number;
}

export interface ComparisonResultType {
  similarity: number;
  matchingFaces: MatchingFace[];
}
