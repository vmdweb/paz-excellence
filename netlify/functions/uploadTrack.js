const cloudinary = require("cloudinary").v2;
const multiparty = require("multiparty");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const form = new multiparty.Form();

  try {
    const data = await new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Pegando arquivos do form
    const coverFile = data.files.cover?.[0];
    const audioFile = data.files.audio?.[0];

    if (!coverFile || !audioFile) {
      return { statusCode: 400, body: "Cover or Audio file missing" };
    }

    // Upload cover
    const coverResult = await cloudinary.uploader.upload(coverFile.path, {
      upload_preset: "covers_unsigned"
    });

    // Upload audio
    const audioResult = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video", // áudio deve ser "video" para Cloudinary
      upload_preset: "audio_unsigned"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        coverUrl: coverResult.secure_url,
        audioUrl: audioResult.secure_url
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
