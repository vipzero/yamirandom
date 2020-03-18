import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Canvas, Image } from "canvas";
import * as stream from "stream";

admin.initializeApp();

// CONST
// const FONT_BOLD = "font/NotoSansCJKjp-Medium.otf";
// const FONT_REGULAR = "font/NotoSansCJKjp-Medium.otf";

exports.buki = functions.https.onRequest(async (req, res) => {
  const msg = "いれたい文字";

  // ベースの画像
  const filename = `generated_ogp.png`;

  const canvas = new Canvas(200, 300);
  const ctx = canvas.getContext("2d");
  ctx.font = "30px Lato";
  ctx.fillText(msg, 10, 100);
  ctx.stroke();

  // const image = new Image();
  // image.src = canvas.toDataURL();

  const bucket = admin.storage().bucket();
  const bufferStream = new stream.PassThrough();
  const ab = ctx.getImageData(0, 0, 200, 300).data.buffer as ArrayBuffer;

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
