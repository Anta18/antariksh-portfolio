import type { Order, Packet } from "./models";
export type SceneState = {
  book?: Order[];
  isolated?: boolean;
  packets?: Packet[];
  amplitude?: number;
  window?: number;
};
