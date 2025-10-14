const { Module } = require("../lib/plugins");
const config = require("../config");
const { getTheme } = require("../Themes/themes");
const theme = getTheme();

// ==================== EXTENDED OWNER MENU ====================

Module({
  command: "myprivacy",
  package: "owner",
  description: "Manage WhatsApp privacy settings",
})(async (message, match) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    if (!match) {
      const help = `
╭━━━「 *PRIVACY SETTINGS* 」━━━┈⊷
┃
┃ *Available Commands:*
┃
┃ • .myprivacy status - Manage status privacy
┃ • .myprivacy profile - Manage profile photo privacy
┃ • .myprivacy about - Manage about privacy
┃ • .myprivacy online - Manage last seen privacy
┃ • .myprivacy groupadd - Manage group add privacy
┃ • .myprivacy calladd - Manage call add privacy
┃ • .myprivacy view - View all privacy settings
┃
┃ *Privacy Options:*
┃ • all - Everyone
┃ • contacts - My contacts
┃ • contact_blacklist - My contacts except
┃ • none - Nobody
┃
┃ *Example:*
┃ .myprivacy status contacts
┃ .myprivacy profile none
┃
╰━━━━━━━━━━━━━━━━━━━┈⊷
      `.trim();
      return message.send(help);
    }

    const [setting, value] = match.split(" ");

    if (setting === "view") {
      try {
        const privacy = await message.conn.fetchPrivacySettings();

        const privacyMap = {
          all: "Everyone",
          contacts: "My Contacts",
          contact_blacklist: "My Contacts Except",
          none: "Nobody",
        };

        const info = `
╭━━━「 *CURRENT PRIVACY* 」━━━┈⊷
┃
┃ *Last Seen:* ${privacyMap[privacy.lastSeen] || "Unknown"}
┃ *Profile Photo:* ${privacyMap[privacy.profile] || "Unknown"}
┃ *Status:* ${privacyMap[privacy.status] || "Unknown"}
┃ *About:* ${privacyMap[privacy.about] || "Unknown"}
┃ *Group Add:* ${privacyMap[privacy.groupAdd] || "Unknown"}
┃ *Read Receipts:* ${privacy.readReceipts ? "Enabled" : "Disabled"}
┃
╰━━━━━━━━━━━━━━━━━━━┈⊷
        `.trim();

        return message.send(info);
      } catch (error) {
        return message.send("❌ _Failed to fetch privacy settings_");
      }
    }

    if (!value) {
      return message.send(
        `_Provide privacy value for ${setting}_\n\nOptions: all, contacts, contact_blacklist, none`
      );
    }

    const validOptions = ["all", "contacts", "contact_blacklist", "none"];
    if (!validOptions.includes(value)) {
      return message.send(
        "❌ _Invalid privacy option. Use: all, contacts, contact_blacklist, or none_"
      );
    }

    let settingKey;
    switch (setting.toLowerCase()) {
      case "status":
        settingKey = "status";
        break;
      case "profile":
        settingKey = "profile";
        break;
      case "about":
        settingKey = "about";
        break;
      case "online":
      case "lastseen":
        settingKey = "online";
        break;
      case "groupadd":
        settingKey = "groupAdd";
        break;
      case "calladd":
        settingKey = "callAdd";
        break;
      default:
        return message.send(
          "❌ _Invalid setting. Check .myprivacy for available options_"
        );
    }

    await message.conn.updatePrivacySettings(settingKey, value);
    await message.send(`✅ *${setting}* privacy updated to: *${value}*`);
  } catch (error) {
    console.error("MyPrivacy command error:", error);
    await message.send("❌ _Failed to update privacy settings_");
  }
});

Module({
  command: "getpp",
  package: "owner",
  description: "Get user profile picture in full quality",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0];

    if (!jid) {
      return message.send(
        "_Reply to a user or mention them_\n\nExample: .getpp @user"
      );
    }

    await message.react("⏳");

    try {
      // Try to get high quality profile picture
      const ppUrl = await message.conn.profilePictureUrl(jid, "image");

      if (!ppUrl) {
        await message.react("❌");
        return message.send("_User has no profile picture_");
      }

      await message.send({
        image: { url: ppUrl },
        caption: `*Profile Picture*\n\n*User:* @${
          jid.split("@")[0]
        }\n*Quality:* High Resolution`,
        mentions: [jid],
      });

      await message.react("✅");
    } catch (error) {
      await message.react("❌");
      await message.send(
        "_Failed to fetch profile picture. User may have privacy settings enabled_"
      );
    }
  } catch (error) {
    console.error("GetPP command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to get profile picture_");
  }
});

Module({
  command: "vv",
  package: "owner",
  description: "View once media (view and download)",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    if (!message.quoted) {
      return message.send("_Reply to a view once message_");
    }

    const quotedType = message.quoted.type;

    if (
      quotedType !== "viewOnceMessage" &&
      quotedType !== "viewOnceMessageV2"
    ) {
      return message.send("_Reply to a view once photo or video_");
    }

    await message.react("⏳");

    try {
      const media = message.quoted.msg?.message;
      const mediaType = Object.keys(media || {})[0];

      if (!media || !mediaType) {
        await message.react("❌");
        return message.send("❌ _Could not extract view once media_");
      }

      const content = media[mediaType];
      const buffer = await message.quoted.download();

      if (mediaType.includes("image")) {
        await message.send({
          image: buffer,
          caption: `*📸 View Once Image*\n\n_Successfully retrieved!_`,
        });
      } else if (mediaType.includes("video")) {
        await message.send({
          video: buffer,
          caption: `*🎥 View Once Video*\n\n_Successfully retrieved!_`,
        });
      } else {
        await message.react("❌");
        return message.send("❌ _Unsupported view once media type_");
      }

      await message.react("✅");
    } catch (error) {
      console.error("VV inner error:", error);
      await message.react("❌");
      await message.send("❌ _Failed to retrieve view once media_");
    }
  } catch (error) {
    console.error("VV command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to process view once message_");
  }
});

// ==================== HIDDEN OWNER MENU (Advanced Commands) ====================

Module({
  command: "getsession",
  package: "hidden",
  description: "Get session file (DANGEROUS - Hidden)",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    await message.send("_Preparing session file..._");

    const fs = require("fs");
    const path = require("path");
    const archiver = require("archiver");

    // Create zip of auth folder
    const output = fs.createWriteStream("session.zip");
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory("./auth", false);
    await archive.finalize();

    output.on("close", async () => {
      await message.send({
        document: fs.readFileSync("session.zip"),
        mimetype: "application/zip",
        fileName: `session_${Date.now()}.zip`,
        caption:
          "⚠️ *SESSION FILE*\n\n_Keep this safe! Anyone with this can access your WhatsApp!_",
      });

      // Delete zip file after sending
      fs.unlinkSync("session.zip");
    });
  } catch (error) {
    console.error("GetSession command error:", error);
    await message.send("❌ _Failed to get session file_");
  }
});

Module({
  command: "eval",
  package: "hidden",
  description: "Execute JavaScript code (DANGEROUS - Hidden)",
})(async (message, match) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);
    if (!match) return message.send("_Provide code to evaluate_");

    await message.react("⏳");

    try {
      let result = await eval(`(async () => { ${match} })()`);

      if (typeof result === "object") {
        result = JSON.stringify(result, null, 2);
      }

      await message.send(`*📟 Eval Result*\n\n\`\`\`${result}\`\`\``);
      await message.react("✅");
    } catch (evalError) {
      await message.send(`*❌ Eval Error*\n\n\`\`\`${evalError.message}\`\`\``);
      await message.react("❌");
    }
  } catch (error) {
    console.error("Eval command error:", error);
    await message.send("❌ _Failed to evaluate code_");
  }
});

Module({
  command: "exec",
  package: "hidden",
  description: "Execute shell command (DANGEROUS - Hidden)",
})(async (message, match) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);
    if (!match) return message.send("_Provide command to execute_");

    await message.react("⏳");

    const { exec } = require("child_process");

    exec(match, async (error, stdout, stderr) => {
      if (error) {
        await message.send(
          `*❌ Execution Error*\n\n\`\`\`${error.message}\`\`\``
        );
        await message.react("❌");
        return;
      }

      const output = stdout || stderr || "_No output_";

      if (output.length > 4000) {
        await message.send({
          document: Buffer.from(output),
          mimetype: "text/plain",
          fileName: "output.txt",
        });
      } else {
        await message.send(`*💻 Command Output*\n\n\`\`\`${output}\`\`\``);
      }

      await message.react("✅");
    });
  } catch (error) {
    console.error("Exec command error:", error);
    await message.send("❌ _Failed to execute command_");
  }
});

Module({
  command: "spy",
  package: "hidden",
  description: "Spy on user messages (auto-forward)",
})(async (message, match) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0];

    if (!jid) {
      return message.send(
        "_Tag or reply to a user to spy_\n\n" +
          "*Commands:*\n" +
          ".spy @user - Start spying\n" +
          ".spy stop @user - Stop spying\n" +
          ".spy list - List all spied users"
      );
    }

    // Note: Requires database to store spy list
    await message.send(
      "_Spy feature requires database implementation to store spy list_"
    );
  } catch (error) {
    console.error("Spy command error:", error);
    await message.send("❌ _Failed to setup spy_");
  }
});

Module({
  command: "antiview",
  package: "hidden",
  description: "Auto-save all view once messages",
})(async (message, match) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const action = match?.toLowerCase();

    if (!action || !["on", "off", "status"].includes(action)) {
      return message.send(
        "*Anti-View Once*\n\n" +
          "Automatically save all view once messages\n\n" +
          "*Commands:*\n" +
          ".antiview on - Enable\n" +
          ".antiview off - Disable\n" +
          ".antiview status - Check status"
      );
    }

    // Note: Requires global state management
    await message.send(
      "_Anti-view feature requires global state implementation_"
    );
  } catch (error) {
    console.error("Antiview command error:", error);
    await message.send("❌ _Failed to toggle anti-view_");
  }
});

Module({
  command: "clonedp",
  package: "hidden",
  description: "Clone someone's profile picture to bot",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0];

    if (!jid) {
      return message.send(
        "_Reply to or mention a user to clone their profile picture_"
      );
    }

    await message.react("⏳");

    try {
      const ppUrl = await message.conn.profilePictureUrl(jid, "image");

      if (!ppUrl) {
        await message.react("❌");
        return message.send("_User has no profile picture_");
      }

      const axios = require("axios");
      const res = await axios.get(ppUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(res.data);

      await message.setPp(message.conn.user.id, buffer);
      await message.send(
        `✅ _Successfully cloned profile picture from @${jid.split("@")[0]}_`,
        {
          mentions: [jid],
        }
      );
      await message.react("✅");
    } catch (error) {
      await message.react("❌");
      await message.send("❌ _Failed to clone profile picture_");
    }
  } catch (error) {
    console.error("CloneDP command error:", error);
    await message.send("❌ _Failed to clone profile picture_");
  }
});

Module({
  command: "steal",
  package: "hidden",
  description: "Steal user's about/bio",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0];

    if (!jid) {
      return message.send("_Reply to or mention a user to steal their bio_");
    }

    await message.react("⏳");

    try {
      const status = await message.fetchStatus(jid);

      if (!status || !status.status) {
        await message.react("❌");
        return message.send("_User has no bio_");
      }

      await message.conn.updateProfileStatus(status.status);
      await message.send(
        `✅ _Successfully stole bio from @${jid.split("@")[0]}_\n\n` +
          `*Bio:* ${status.status}`,
        { mentions: [jid] }
      );
      await message.react("✅");
    } catch (error) {
      await message.react("❌");
      await message.send("❌ _Failed to steal bio_");
    }
  } catch (error) {
    console.error("Steal command error:", error);
    await message.send("❌ _Failed to steal bio_");
  }
});

Module({
  command: "forward",
  package: "hidden",
  description: "Forward message to multiple chats",
})(async (message, match) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);
    if (!message.quoted) return message.send("_Reply to a message to forward_");
    if (!match)
      return message.send(
        "_Provide JIDs separated by comma_\n\nExample: .forward 1234@s.whatsapp.net,5678@s.whatsapp.net"
      );

    const jids = match.split(",").map((j) => j.trim());
    let success = 0;
    let failed = 0;

    await message.send(`_Forwarding to ${jids.length} chats..._`);

    for (const jid of jids) {
      try {
        await message.conn.sendMessage(jid, { forward: message.quoted.raw });
        success++;
        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay to avoid spam
      } catch {
        failed++;
      }
    }

    await message.send(
      `*📤 Forward Complete*\n\n` +
        `✅ Success: ${success}\n` +
        `❌ Failed: ${failed}`
    );
  } catch (error) {
    console.error("Forward command error:", error);
    await message.send("❌ _Failed to forward message_");
  }
});

Module({
  command: "fakereply",
  package: "hidden",
  description: "Send fake reply message",
})(async (message, match) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);
    if (!match) {
      return message.send(
        "_Send fake reply_\n\n" +
          "*Format:*\n" +
          ".fakereply name|message|reply\n\n" +
          "*Example:*\n" +
          ".fakereply John|Hello|Hi there!"
      );
    }

    const [name, fakeMsg, reply] = match.split("|").map((s) => s.trim());

    if (!name || !fakeMsg || !reply) {
      return message.send(
        "_Invalid format. Use: .fakereply name|message|reply_"
      );
    }

    await message.conn.sendMessage(message.from, {
      text: reply,
      contextInfo: {
        mentionedJid: [],
        externalAdReply: {
          title: name,
          body: fakeMsg,
          thumbnailUrl: "https://i.imgur.com/placeholder.jpg",
          sourceUrl: "",
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    });
  } catch (error) {
    console.error("FakeReply command error:", error);
    await message.send("❌ _Failed to send fake reply_");
  }
});

Module({
  command: "hiddenmenu",
  package: "hidden",
  description: "Display hidden owner commands",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const menu = `
╭━━━「 *🔒 HIDDEN OWNER MENU* 」━━━┈⊷
┃
┃ ⚠️ *DANGEROUS COMMANDS - USE WITH CAUTION*
┃
┃ *Privacy & Profile:*
┃ • .myprivacy - Manage privacy settings
┃ • .getpp - Get high quality profile picture
┃ • .vv - View once media viewer
┃ • .clonedp - Clone user's profile picture
┃ • .steal - Steal user's bio
┃
┃ *Advanced:*
┃ • .getsession - Export session file
┃ • .eval - Execute JavaScript code
┃ • .exec - Execute shell commands
┃ • .spy - Spy on user messages
┃ • .antiview - Auto-save view once
┃
┃ *Message Tools:*
┃ • .forward - Forward to multiple chats
┃ • .fakereply - Send fake reply
┃
┃ ⚠️ *WARNING:* These commands are powerful
┃ and can be dangerous if misused!
┃
╰━━━━━━━━━━━━━━━━━━━┈⊷
    `.trim();

    await message.send(menu);
  } catch (error) {
    console.error("HiddenMenu command error:", error);
    await message.send("❌ _Failed to display hidden menu_");
  }
});
