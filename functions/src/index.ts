import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createCanvas, Image } from "canvas";
import * as stream from "stream";
import { weponList } from "./splatoon-wepons";
import * as gen from "random-seed";

admin.initializeApp();

// CONST
// const FONT_BOLD = "font/NotoSansCJKjp-Medium.otf";
// const FONT_REGULAR = "font/NotoSansCJKjp-Medium.otf";

function sample<T>(a: Array<T>, r: number) {
  return a[Math.floor(r * a.length)];
}

const renderCanvas = (seed: string) => {
  const rand = gen.create(seed);

  const width = 200;
  const footer = 30;
  const mainHeight = 250;
  const height = mainHeight + footer;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const wepons = Array.from(Array(8)).map(() =>
    sample(weponList, rand.random())
  );

  const fontSize = (mainHeight - 10 * 8) / 8;
  ctx.font = `${fontSize}px Avenir, Osaka, sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "black";

  ctx.beginPath();
  ctx.moveTo(0, mainHeight / 2);
  ctx.lineTo(width, mainHeight / 2);
  ctx.moveTo(0, mainHeight);
  ctx.lineTo(width, mainHeight);
  ctx.closePath();

  ctx.fillText("α", 10, fontSize + 8 - 4);
  ctx.fillText("β", 10, (fontSize + 8) * 5 + 4);
  wepons.forEach((w, i) => {
    if (i < 4) {
      ctx.fillText(`${i + 1}. ${w.name}`, 40, (i + 1) * (fontSize + 8) - 4);
    } else {
      ctx.fillText(`${i - 4}. ${w.name}`, 40, (i + 1) * (fontSize + 8) + 4);
    }
  });
  ctx.font = `${fontSize * 0.6}px Avenir, Osaka, sans-serif`;
  ctx.fillText(seed, 5, mainHeight + fontSize + 5);
  ctx.stroke();
  return canvas;
};

const pad2 = n => `${n}`.padStart(2, "0");
const dstr = () => {
  const d = new Date();
  return `/${d.getFullYear()}${pad2(d.getMonth() + 1)}${d.getDate()}`;
};

exports.buki = functions.https.onRequest(async (req, res) => {
  const seed = /^\/[0-9]{8}\/./.exec(req.path) ? req.path : dstr() + req.path;
  const canvas = renderCanvas(seed);

  // const image = new Image();
  // image.src = canvas.toDataURL();

  res.set("Content-Type", "image/png");
  res.send(canvas.toBuffer());
});
