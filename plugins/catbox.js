const { Module } = require("../lib/plugins");
const config = require("../config");
const { getTheme } = require("../Themes/themes");
const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");
const FormData = require("form-data");
const theme = getTheme();

// ==================== URL UPLOADER PLUGIN ====================

Module({
  command: "url",
  package: "converter",
  description: "Convert media to URL (upload to Catbox)",
})(async (message) => {
  try {
    // Check if there's a quoted message or current message has media
    const quotedMsg = message.quoted || message;
    const mimeType = quotedMsg.content?.mimetype || quotedMsg.type;

    if (!mimeType) {
      return message.send(
        "_Reply to an image, video, audio, or document_\n\n" +
          "*Supported:*\n" +
          "• Images (JPG, PNG, GIF)\n" +
          "• Videos (MP4, MKV)\n" +
          "• Audio (MP3, WAV)\n" +
          "• Documents"
      );
    }

    // Check if it's a supported media type
    const supportedTypes = [
      "imageMessage",
      "videoMessage",
      "audioMessage",
      "documentMessage",
      "stickerMessage",
    ];

    if (!supportedTypes.includes(quotedMsg.type)) {
      return message.send(
        "❌ _Unsupported media type. Reply to image, video, audio, or document_"
      );
    }

    await message.react("⏳");
    await message.send("_Uploading to Catbox... Please wait_");

    try {
      // Download the media
      const mediaBuffer = await quotedMsg.download();

      if (!mediaBuffer || mediaBuffer.length === 0) {
        throw new Error("Failed to download media");
      }

      // Create temporary file
      const tempFilePath = path.join(
        os.tmpdir(),
        `catbox_upload_${Date.now()}`
      );
      fs.writeFileSync(tempFilePath, mediaBuffer);

      // Determine file extension
      let extension = "";
      const mime = quotedMsg.content?.mimetype || "";

      if (mime.includes("image/jpeg") || quotedMsg.type === "imageMessage") {
        extension = ".jpg";
      } else if (mime.includes("image/png")) {
        extension = ".png";
      } else if (mime.includes("image/gif")) {
        extension = ".gif";
      } else if (
        mime.includes("image/webp") ||
        quotedMsg.type === "stickerMessage"
      ) {
        extension = ".webp";
      } else if (
        mime.includes("video/mp4") ||
        quotedMsg.type === "videoMessage"
      ) {
        extension = ".mp4";
      } else if (mime.includes("video/mkv")) {
        extension = ".mkv";
      } else if (
        mime.includes("audio/mpeg") ||
        quotedMsg.type === "audioMessage"
      ) {
        extension = ".mp3";
      } else if (mime.includes("audio/wav")) {
        extension = ".wav";
      } else if (mime.includes("audio/ogg")) {
        extension = ".ogg";
      } else if (quotedMsg.content?.fileName) {
        const originalExt = path.extname(quotedMsg.content.fileName);
        extension = originalExt || ".bin";
      } else {
        extension = ".bin";
      }

      const fileName = `file_${Date.now()}${extension}`;

      // Prepare form data for Catbox
      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), fileName);
      form.append("reqtype", "fileupload");

      // Upload to Catbox
      const response = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
          timeout: 30000, // 30 seconds timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      if (!response.data || response.data.includes("error")) {
        throw new Error("Upload failed: " + (response.data || "Unknown error"));
      }

      const mediaUrl = response.data.trim();

      // Determine media type for display
      let mediaType = "File";
      if (quotedMsg.type === "imageMessage" || mime.includes("image")) {
        mediaType = "Image";
      } else if (quotedMsg.type === "videoMessage" || mime.includes("video")) {
        mediaType = "Video";
      } else if (quotedMsg.type === "audioMessage" || mime.includes("audio")) {
        mediaType = "Audio";
      } else if (quotedMsg.type === "documentMessage") {
        mediaType = "Document";
      } else if (quotedMsg.type === "stickerMessage") {
        mediaType = "Sticker";
      }

      // Format file size
      const fileSize = formatBytes(mediaBuffer.length);

      // Send success message
      const resultMessage = `
╭━━━「 *UPLOAD SUCCESS* 」━━━┈⊷
┃
┃ ✅ *${mediaType} uploaded successfully*
┃
┃ *📊 Details:*
┃ • Type: ${mediaType}
┃ • Size: ${fileSize}
┃ • Format: ${extension.replace(".", "").toUpperCase()}
┃
┃ *🔗 URL:*
┃ ${mediaUrl}
┃
┃ _Link is permanent and can be shared_
┃
╰━━━━━━━━━━━━━━━━━━━┈⊷
      `.trim();

      await message.sendreply(resultMessage);
      await message.react("✅");
    } catch (uploadError) {
      console.error("Upload error:", uploadError);

      let errorMessage = "❌ *Upload Failed*\n\n";

      if (uploadError.code === "ETIMEDOUT") {
        errorMessage += "_Timeout: Catbox server is not responding_\n";
        errorMessage += "_Please try again later or check your connection_";
      } else if (uploadError.code === "ECONNABORTED") {
        errorMessage += "_Connection aborted_\n";
        errorMessage += "_File may be too large or connection issue_";
      } else if (uploadError.response?.status === 413) {
        errorMessage += "_File too large for upload_\n";
        errorMessage += "_Maximum size: 200MB_";
      } else {
        errorMessage += `_${
          uploadError.message || "Unknown error occurred"
        }_\n`;
        errorMessage += "_Please try again later_";
      }

      await message.send(errorMessage);
      await message.react("❌");
    }
  } catch (error) {
    console.error("URL command error:", error);
    await message.react("❌");
    await message.send(
      "❌ _Failed to process media. Make sure you replied to a valid media message_"
    );
  }
});

// ==================== ALTERNATIVE UPLOADERS ====================

Module({
  command: "telegraph",
  package: "converter",
  description: "Upload image to Telegraph",
})(async (message) => {
  try {
    const quotedMsg = message.quoted || message;

    if (quotedMsg.type !== "imageMessage") {
      return message.send("_Reply to an image_");
    }

    await message.react("⏳");
    await message.send("_Uploading to Telegraph..._");

    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `telegraph_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    const form = new FormData();
    form.append("file", fs.createReadStream(tempFilePath));

    const response = await axios.post("https://telegra.ph/upload", form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(tempFilePath);

    if (response.data && response.data[0]?.src) {
      const imageUrl = "https://telegra.ph" + response.data[0].src;

      await message.sendreply(
        `✅ *Image Uploaded to Telegraph*\n\n` +
          `*URL:* ${imageUrl}\n\n` +
          `_Permanent link, no expiration_`
      );
      await message.react("✅");
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Telegraph command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to upload to Telegraph_");
  }
});

Module({
  command: "imgbb",
  package: "converter",
  description: "Upload image to ImgBB (requires API key)",
})(async (message) => {
  try {
    const IMGBB_API_KEY = config.IMGBB_API_KEY || process.env.IMGBB_API_KEY;

    if (!IMGBB_API_KEY) {
      return message.send(
        "❌ _ImgBB API key not configured_\n\n" +
          "Get free API key from: https://api.imgbb.com/\n" +
          "Add to config: IMGBB_API_KEY"
      );
    }

    const quotedMsg = message.quoted || message;

    if (quotedMsg.type !== "imageMessage") {
      return message.send("_Reply to an image_");
    }

    await message.react("⏳");
    await message.send("_Uploading to ImgBB..._");

    const mediaBuffer = await quotedMsg.download();
    const base64Image = mediaBuffer.toString("base64");

    const form = new FormData();
    form.append("image", base64Image);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    if (response.data?.data?.url) {
      const result = response.data.data;

      await message.sendreply(
        `✅ *Image Uploaded to ImgBB*\n\n` +
          `*Direct URL:* ${result.url}\n` +
          `*Thumbnail:* ${result.thumb?.url || "N/A"}\n` +
          `*Size:* ${formatBytes(result.size)}\n` +
          `*View:* ${result.url_viewer}\n\n` +
          `_Auto-deletes after inactivity_`
      );
      await message.react("✅");
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("ImgBB command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to upload to ImgBB_");
  }
});

Module({
  command: "fileio",
  package: "converter",
  description: "Upload file to File.io (expires after 1 download)",
})(async (message) => {
  try {
    const quotedMsg = message.quoted || message;

    if (
      ![
        "imageMessage",
        "videoMessage",
        "audioMessage",
        "documentMessage",
      ].includes(quotedMsg.type)
    ) {
      return message.send("_Reply to a media file_");
    }

    await message.react("⏳");
    await message.send("_Uploading to File.io..._");

    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `fileio_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    const form = new FormData();
    form.append("file", fs.createReadStream(tempFilePath));

    const response = await axios.post("https://file.io", form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(tempFilePath);

    if (response.data?.link) {
      await message.sendreply(
        `✅ *File Uploaded to File.io*\n\n` +
          `*URL:* ${response.data.link}\n` +
          `*Size:* ${formatBytes(mediaBuffer.length)}\n` +
          `*Expires:* ${response.data.expires}\n\n` +
          `⚠️ *Warning:* Link expires after 1 download!`
      );
      await message.react("✅");
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("FileIO command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to upload to File.io_");
  }
});

// ==================== UTILITY FUNCTION ====================

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
