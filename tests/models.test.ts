import test from "node:test";
import assert from "node:assert/strict";
import {
  matchOrder,
  editPeer,
  synchronize,
  transmit,
  deliveredInOrder,
  createSignal,
} from "../src/lib/models.ts";
import type { Order, Peer, Packet } from "../src/lib/models.ts";
test("price-time priority, partial fills, and resting execution price", () => {
  const book: Order[] = [
    { id: 2, side: "sell", price: 101, quantity: 5 },
    { id: 1, side: "sell", price: 101, quantity: 3 },
    { id: 3, side: "sell", price: 102, quantity: 4 },
  ];
  const before = structuredClone(book);
  const r = matchOrder(book, { id: 4, side: "buy", price: 102, quantity: 10 });
  assert.deepEqual(
    r.trades.map((t) => [t.sellId, t.price, t.quantity]),
    [
      [1, 101, 3],
      [2, 101, 5],
      [3, 102, 2],
    ],
  );
  assert.equal(r.book[0].quantity, 2);
  assert.deepEqual(book, before);
});
test("noncrossing orders rest, crossing sells use highest bid first", () => {
  const book: Order[] = [
    { id: 1, side: "buy", price: 99, quantity: 3 },
    { id: 2, side: "buy", price: 100, quantity: 2 },
  ];
  assert.equal(
    matchOrder(book, { id: 3, side: "sell", price: 101, quantity: 1 }).trades
      .length,
    0,
  );
  const r = matchOrder(book, { id: 3, side: "sell", price: 99, quantity: 4 });
  assert.deepEqual(
    r.trades.map((t) => [t.buyId, t.quantity]),
    [
      [2, 2],
      [1, 2],
    ],
  );
  assert.equal(r.book[0].quantity, 1);
});
test("partitioned peers retain old state and converge after rejoining", () => {
  const peers: Peer[] = ["A", "B", "C"].map((id) => ({
    id,
    online: id !== "C",
    value: "Hello",
    clock: 0,
    author: "A",
  }));
  const updated = editPeer(peers, "A", "New");
  assert.equal(updated[1].value, "New");
  assert.equal(updated[2].value, "Hello");
  const joined = synchronize(updated.map((p) => ({ ...p, online: true })));
  assert.ok(joined.every((p) => p.value === "New" && p.clock === 1));
  assert.equal(peers[0].value, "Hello");
});
test("concurrent register versions resolve deterministically", () => {
  const a: Peer = { id: "A", online: true, value: "a", clock: 2, author: "A" };
  const b: Peer = { id: "B", online: true, value: "b", clock: 2, author: "B" };
  assert.deepEqual(
    synchronize([a, b]).map((p) => p.value),
    ["b", "b"],
  );
  assert.deepEqual(
    synchronize([b, a]).map((p) => p.value),
    ["b", "b"],
  );
});
test("later acknowledged packets wait behind a gap; retransmission delivers in order", () => {
  const packets: Packet[] = Array.from({ length: 6 }, (_, i) => ({
    seq: i + 1,
    state: "queued",
    attempts: 0,
  }));
  const first = transmit(packets, 3);
  assert.deepEqual(deliveredInOrder(first), [1, 2]);
  assert.equal(first[2].state, "lost");
  const recovered = transmit(first, null);
  assert.deepEqual(deliveredInOrder(recovered), [1, 2, 3, 4, 5, 6]);
  assert.equal(recovered[2].attempts, 2);
  assert.equal(recovered[0].attempts, 1);
  assert.ok(packets.every((p) => p.attempts === 0));
});
test("signal controls produce finite deterministic curves and nonpositive drawdown", () => {
  const a = createSignal(5, 5);
  assert.deepEqual(a, createSignal(5, 5));
  assert.notDeepEqual(a, createSignal(10, 2));
  assert.ok(a.every((p) => Number.isFinite(p.equity) && p.drawdown <= 0));
});
