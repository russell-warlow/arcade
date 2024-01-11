import { Howl, Howler } from "howler";

let sfx = {
  game: new Howl({
    src: "./sounds/game.mp3",
    loop: true,
  }),
};

export default sfx;
