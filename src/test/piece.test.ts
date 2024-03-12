// various mocks and imports to get jest to work
import { TextDecoder, TextEncoder } from "util";
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

import piece from "../scripts/piece";
import { JSDOM } from "jsdom";

// Mock the canvas element and its getContext method
const { window } = new JSDOM("<!DOCTYPE html>");
(global as any).document = window.document;
(global as any).window = window;
HTMLCanvasElement.prototype.getContext = () => {
  return null;
};

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const compareArray = (a: number[][], b: number[][]) => {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      if (a[i][j] !== b[i][j]) {
        return false;
      }
    }
  }
  return true;
};

test("move, x coordinate", () => {
  let p = new piece(ctx, 0);
  p.move(2, 3);
  expect(p.getX()).toBe(3);
});

test("move, y coordinate", () => {
  let p = new piece(ctx, 0);
  p.move(2, 3);
  expect(p.getY()).toBe(2);
});

test("rotate clockwise", () => {
  let p = new piece(ctx, 6);
  let rotated = p.rotateClockwise();
  let result = [
    [0, 7, 7],
    [0, 7, 0],
    [0, 7, 0],
  ];
  expect(compareArray(rotated, result)).toBe(true);
});

test("rotate counterclockwise", () => {
  let p = new piece(ctx, 6);
  let rotated = p.rotateCounterclockwise();
  let result = [
    [0, 7, 0],
    [0, 7, 0],
    [7, 7, 0],
  ];
  expect(compareArray(rotated, result)).toBe(true);
});
