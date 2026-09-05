// Every move flips two cells, preserving even parity. Nine green cells is
// deliberately unreachable: this is the agent playground's impossible puzzle.
export const AGENT_PUZZLE_RING = [0, 1, 2, 5, 8, 7, 6, 3, 4] as const;
export const AGENT_PUZZLE_INITIAL = 0b011101110;

export function pairedTile(tile: number): number {
  const index = AGENT_PUZZLE_RING.indexOf(tile as typeof AGENT_PUZZLE_RING[number]);
  return AGENT_PUZZLE_RING[(index + 1) % AGENT_PUZZLE_RING.length];
}

export function moveAgentPuzzle(board: number, tile: number): number {
  return board ^ (1 << tile) ^ (1 << pairedTile(tile));
}

export function greenTiles(board: number): number {
  return Array.from({ length: 9 }, (_, tile) => (board >> tile) & 1).reduce((sum, on) => sum + on, 0);
}
