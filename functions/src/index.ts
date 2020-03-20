import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createCanvas, Image } from "canvas";
import * as stream from "stream";
import { weponList } from "./splatoon-wepons";

admin.initializeApp();

// CONST
// const FONT_BOLD = "font/NotoSansCJKjp-Medium.otf";
// const FONT_REGULAR = "font/NotoSansCJKjp-Medium.otf";

function sample<T>(a: Array<T>) {
  return a[Math.floor(Math.random() * a.length)];
}

exports.buki = functions.https.onRequest(async (req, res) => {
  const msg = "いれたい文字";

  // ベースの画像
  const filename = `generated_ogp.png`;

  const width = 200;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const wepons = Array.from(Array(8)).map(() => sample(weponList));

  const fontSize = (height - 10 * 8) / 8;
  ctx.font = `${fontSize}px Avenir, Osaka, sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "black";

  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
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
  ctx.stroke();

  // const image = new Image();
  // image.src = canvas.toDataURL();

  const bucket = admin.storage().bucket();
  const bufferStream = new stream.PassThrough();
  const ab = ctx.getImageData(0, 0, width, height).data.buffer as ArrayBuffer;

  // @ts-ignore
  bufferStream.end(Buffer.from(ab, "base64"));

  const uploadPath = filename;

  const file = bucket.file(filename);

  bufferStream.pipe(
    file.createWriteStream({
      metadata: {
        contentType: "image/png",
        metadata: { custom: "metadata" }
      },
      public: true,
      validation: "md5"
    })
  );

  const STORAGE_ROOT = "https://firebasestorage.googleapis.com/v0/b";
  const bucketName = bucket.name;
  const dlPath = encodeURIComponent(uploadPath);
  const dlURL = `${STORAGE_ROOT}/${bucketName}/o/${dlPath}?alt=media`;

  // return Download URL
  res.send(dlURL);
});
