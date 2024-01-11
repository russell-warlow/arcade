import { Howl, Howler } from "howler";

let sfx = {
  clearlines: new Howl({
    src: "/sounds/clearlines.mp3",
  }),
  freeze: new Howl({
    src: "/sounds/freeze.mp3",
  }),
  game: new Howl({
    src: "/sounds/game.mp3",
    loop: true,
  }),
  gameover: new Howl({
    src: "/sounds/gameover.mp3",
  }),
  harddrop: new Howl({
    src: "/sounds/harddrop.mp3",
  }),
  levelup: new Howl({
    src: "/sounds/levelup.mp3",
  }),
  rotate: new Howl({
    src: "/sounds/rotate.mp3",
  }),
};

export default sfx;
