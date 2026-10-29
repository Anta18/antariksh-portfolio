export type Order = {
  id: number;
  side: "buy" | "sell";
  price: number;
  quantity: number;
};
export type Trade = {
  buyId: number;
  sellId: number;
  price: number;
  quantity: number;
};
export function matchOrder(
  book: Order[],
  incoming: Order,
): { book: Order[]; trades: Trade[] } {
  const working = book.map((o) => ({ ...o }));
  const next = { ...incoming };
  const trades: Trade[] = [];
  const candidates = working
    .filter(
      (o) =>
        o.side !== next.side &&
        (next.side === "buy" ? o.price <= next.price : o.price >= next.price),
    )
    .sort(
      (a, b) =>
        (next.side === "buy" ? a.price - b.price : b.price - a.price) ||
        a.id - b.id,
    );
  for (const order of candidates) {
    if (next.quantity <= 0) break;
    const quantity = Math.min(next.quantity, order.quantity);
    next.quantity -= quantity;
    order.quantity -= quantity;
    trades.push({
      buyId: next.side === "buy" ? next.id : order.id,
      sellId: next.side === "sell" ? next.id : order.id,
      price: order.price,
      quantity,
    });
  }
  const result = working.filter((o) => o.quantity > 0);
  if (next.quantity > 0) result.push(next);
  return { book: result, trades };
}
export type Peer = {
  id: string;
  online: boolean;
  value: string;
  clock: number;
  author: string;
};
export function editPeer(peers: Peer[], id: string, value: string): Peer[] {
  const clock = Math.max(...peers.map((p) => p.clock)) + 1;
  return synchronize(
    peers.map((p) => (p.id === id ? { ...p, value, clock, author: id } : p)),
  );
}
export function synchronize(peers: Peer[]): Peer[] {
  const online = peers.filter((p) => p.online);
  if (!online.length) return peers.map((p) => ({ ...p }));
  const winner = [...online].sort(
    (a, b) => b.clock - a.clock || b.author.localeCompare(a.author),
  )[0];
  return peers.map((p) =>
    p.online
      ? {
          ...p,
          value: winner.value,
          clock: winner.clock,
          author: winner.author,
        }
      : { ...p },
  );
}
export type Packet = {
  seq: number;
  state: "queued" | "sent" | "lost" | "acked";
  attempts: number;
};
export function transmit(packets: Packet[], drop: number | null): Packet[] {
  return packets.map((p) =>
    p.state === "acked"
      ? { ...p }
      : {
          ...p,
          attempts: p.attempts + 1,
          state: p.seq === drop && p.attempts === 0 ? "lost" : "acked",
        },
  );
}
export function deliveredInOrder(packets: Packet[]): number[] {
  const result: number[] = [];
  for (const p of [...packets].sort((a, b) => a.seq - b.seq)) {
    if (p.state !== "acked") break;
    result.push(p.seq);
  }
  return result;
}
export function createSignal(amplitude: number, window: number) {
  let equity = 100;
  let peak = 100;
  return Array.from({ length: 72 }, (_, i) => {
    const signal =
      Math.sin(i / window) * amplitude + Math.cos(i * 0.67) * amplitude * 0.32;
    equity += signal * 0.18 + 0.08;
    peak = Math.max(peak, equity);
    return { signal, equity, drawdown: ((equity - peak) / peak) * 100 };
  });
}
