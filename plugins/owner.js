const { Module } = require("../lib/plugins");
const config = require("../config");
const { getTheme } = require("../Themes/themes");
const theme = getTheme();
Module({
  command: "left",
  package: "owner",
  description: "",
})(async (message) => {
  await message.loadGroupInfo(message.from);
  if (!message.isGroup) return message.send(theme.isGroup);
  if (!message.isfromMe) return message.send(theme.isfromMe);
  const sudo = (process.env.SUDO || "").split(",");
  const sender = message.sender.split("@")[0];
  if (!message.fromMe && !sudo.includes(sender)) return;
  return message.conn.groupLeave(message.from);
});

// ==================== UTILITY MENU ====================

Module({
  command: "sticker",
  package: "utility",
  description: "Convert image/video to sticker",
})(async (message, match) => {
  try {
    if (
      message.type !== "imageMessage" &&
      message.type !== "videoMessage" &&
      !message.quoted?.type?.includes("image") &&
      !message.quoted?.type?.includes("video")
    ) {
      return message.send("_Reply to an image or video (max 10 seconds)_");
    }

    await message.react("⏳");

    const buffer =
      message.type === "imageMessage" || message.type === "videoMessage"
        ? await message.download()
        : await message.quoted.download();

    await message.send({ sticker: buffer });
    await message.react("✅");
  } catch (error) {
    console.error("Sticker command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to create sticker_");
  }
});

Module({
  command: "toimage",
  package: "utility",
  description: "Convert sticker to image",
})(async (message) => {
  try {
    if (
      message.type !== "stickerMessage" &&
      message.quoted?.type !== "stickerMessage"
    ) {
      return message.send("_Reply to a sticker_");
    }

    await message.react("⏳");

    const buffer =
      message.type === "stickerMessage"
        ? await message.download()
        : await message.quoted.download();

    await message.send({ image: buffer, caption: "_Converted to image_" });
    await message.react("✅");
  } catch (error) {
    console.error("ToImage command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to convert sticker_");
  }
});

Module({
  command: "steal",
  package: "utility",
  description: "Steal sticker and add custom pack info",
})(async (message, match) => {
  try {
    if (
      message.type !== "stickerMessage" &&
      message.quoted?.type !== "stickerMessage"
    ) {
      return message.send("_Reply to a sticker_");
    }

    await message.react("⏳");

    const buffer =
      message.type === "stickerMessage"
        ? await message.download()
        : await message.quoted.download();

    const [packname, author] = match
      ? match.split("|")
      : [config.STICKER_PACKNAME || "Bot", config.STICKER_AUTHOR || "User"];

    await message.send({
      sticker: buffer,
      packname: packname.trim(),
      author: author?.trim() || "",
    });
    await message.react("✅");
  } catch (error) {
    console.error("Steal command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to steal sticker_");
  }
});

Module({
  command: "take",
  package: "utility",
  description: "Take sticker with custom name",
})(async (message, match) => {
  try {
    if (
      message.type !== "stickerMessage" &&
      message.quoted?.type !== "stickerMessage"
    ) {
      return message.send("_Reply to a sticker_");
    }

    if (!match)
      return message.send(
        "_Provide pack name and author_\n\nExample: .take PackName | Author"
      );

    await message.react("⏳");

    const buffer =
      message.type === "stickerMessage"
        ? await message.download()
        : await message.quoted.download();

    const [packname, author] = match.split("|");

    await message.send({
      sticker: buffer,
      packname: packname?.trim() || "Bot",
      author: author?.trim() || "User",
    });
    await message.react("✅");
  } catch (error) {
    console.error("Take command error:", error);
    await message.react("❌");
    await message.send("❌ _Failed to create sticker_");
  }
});

Module({
  command: "photo",
  package: "utility",
  description: "Get profile picture",
})(async (message) => {
  try {
    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0] ||
      message.sender;

    const url = await message.profilePictureUrl(jid);
    if (!url) return message.send("_User has no profile picture_");

    await message.send({
      image: { url },
      caption: `*Profile picture of @${jid.split("@")[0]}*`,
      mentions: [jid],
    });
  } catch (error) {
    console.error("Photo command error:", error);
    await message.send("❌ _Failed to fetch profile picture_");
  }
});

Module({
  command: "getdp",
  package: "utility",
  description: "Get display picture in high quality",
})(async (message) => {
  try {
    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0] ||
      message.sender;

    const url = await message.profilePictureUrl(jid, "image");
    if (!url) return message.send("_User has no profile picture_");

    await message.sendFromUrl(url, {
      caption: `*Profile Picture*\n\n@${jid.split("@")[0]}`,
      mentions: [jid],
    });
  } catch (error) {
    console.error("GetDP command error:", error);
    await message.send("❌ _Failed to fetch display picture_");
  }
});

Module({
  command: "delete",
  package: "utility",
  description: "Delete bot's message",
})(async (message) => {
  try {
    if (!message.quoted)
      return message.send("_Reply to bot's message to delete it_");
    if (!message.quoted.fromMe)
      return message.send("_Can only delete bot's own messages_");

    await message.send({ delete: message.quoted.key });
  } catch (error) {
    console.error("Delete command error:", error);
    await message.send("❌ _Failed to delete message_");
  }
});

Module({
  command: "quoted",
  package: "utility",
  description: "Get quoted message info",
})(async (message) => {
  try {
    if (!message.quoted) return message.send("_Reply to a message_");

    const q = message.quoted;
    const info = `
*📋 Quoted Message Info*

*Type:* ${q.type}
*From:* @${(q.participant || q.sender).split("@")[0]}
*Message ID:* ${q.id}
*Timestamp:* ${new Date(q.key.timestamp || Date.now()).toLocaleString()}

${q.body ? `*Message:*\n${q.body}` : ""}
    `.trim();

    await message.sendreply(info, { mentions: [q.participant || q.sender] });
  } catch (error) {
    console.error("Quoted command error:", error);
    await message.send("❌ _Failed to get quoted info_");
  }
});

Module({
  command: "forward",
  package: "utility",
  description: "Forward quoted message",
})(async (message, match) => {
  try {
    if (!message.quoted) return message.send("_Reply to a message to forward_");
    if (!match)
      return message.send(
        "_Provide number to forward to_\n\nExample: .forward 1234567890"
      );

    const number = match.replace(/[^0-9]/g, "");
    if (!number) return message.send("_Invalid number_");

    const jid = `${number}@s.whatsapp.net`;

    await message.conn.sendMessage(jid, { forward: message.quoted.raw });
    await message.react("✅");
    await message.send(`_Message forwarded to @${number}_`, {
      mentions: [jid],
    });
  } catch (error) {
    console.error("Forward command error:", error);
    await message.send("❌ _Failed to forward message_");
  }
});

Module({
  command: "vcard",
  package: "utility",
  description: "Get contact vcard",
})(async (message) => {
  try {
    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0];
    if (!jid) return message.send("_Tag or reply to a user_");

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${
      message.pushName || "User"
    }\nTEL;type=CELL;type=VOICE;waid=${jid.split("@")[0]}:+${
      jid.split("@")[0]
    }\nEND:VCARD`;

    await message.send({
      contacts: {
        displayName: message.pushName || "User",
        contacts: [{ vcard }],
      },
    });
  } catch (error) {
    console.error("VCard command error:", error);
    await message.send("❌ _Failed to generate vcard_");
  }
});

Module({
  command: "jid",
  package: "info",
  description: "Get JID of user or group",
})(async (message) => {
  try {
    const jid =
      message.quoted?.participant ||
      message.quoted?.sender ||
      message.mentions?.[0] ||
      message.from;

    await message.sendreply(jid);
  } catch (error) {
    console.error("JID command error:", error);
    await message.send("❌ _Failed to get JID_");
  }
});

Module({
  command: "listpc",
  package: "info",
  description: "List all personal chats",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const chats = message.conn.chats
      .all()
      .filter((c) => c.id.endsWith("@s.whatsapp.net"));

    let text = `*Personal Chats (${chats.length})*\n\n`;
    chats.slice(0, 50).forEach((chat, i) => {
      text += `${i + 1}. ${chat.name || chat.id.split("@")[0]}\n`;
    });

    if (chats.length > 50) {
      text += `\n_Showing first 50 of ${chats.length} chats_`;
    }

    await message.send(text);
  } catch (error) {
    console.error("ListPC command error:", error);
    await message.send("❌ _Failed to list chats_");
  }
});

Module({
  command: "listgc",
  package: "info",
  description: "List all group chats",
})(async (message) => {
  try {
    if (!message.fromMe) return message.send(theme.isfromMe);

    const groups = message.conn.chats
      .all()
      .filter((c) => c.id.endsWith("@g.us"));

    let text = `*Group Chats (${groups.length})*\n\n`;
    groups.slice(0, 50).forEach((group, i) => {
      text += `${i + 1}. ${group.name || group.id}\n`;
    });

    if (groups.length > 50) {
      text += `\n_Showing first 50 of ${groups.length} groups_`;
    }

    await message.send(text);
  } catch (error) {
    console.error("ListGC command error:", error);
    await message.send("❌ _Failed to list groups_");
  }
});

// ==================== FUN MENU ====================

Module({
  command: "fact",
  package: "fun",
  description: "Get a random fact",
})(async (message) => {
  try {
    const facts = [
      "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that's still edible!",
      "A group of flamingos is called a 'flamboyance'.",
      "Octopuses have three hearts and blue blood.",
      "Bananas are berries, but strawberries aren't!",
      "The shortest war in history lasted only 38 minutes.",
      "A bolt of lightning is five times hotter than the surface of the sun.",
      "There are more stars in the universe than grains of sand on all Earth's beaches.",
      "Sharks existed before trees on Earth.",
      "A day on Venus is longer than its year.",
      "Wombat poop is cube-shaped!",
    ];

    const fact = facts[Math.floor(Math.random() * facts.length)];
    await message.sendreply(`💡 *Random Fact*\n\n${fact}`);
  } catch (error) {
    console.error("Fact command error:", error);
    await message.send("❌ _Failed to get fact_");
  }
});

Module({
  command: "joke",
  package: "fun",
  description: "Get a random joke",
})(async (message) => {
  try {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "What do you call a fake noodle? An impasta!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What did the ocean say to the beach? Nothing, it just waved!",
      "Why don't skeletons fight each other? They don't have the guts!",
      "What do you call a can opener that doesn't work? A can't opener!",
      "Why did the bicycle fall over? It was two-tired!",
      "What do you call a fish wearing a crown? A king fish!",
    ];

    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    await message.sendreply(`😂 *Random Joke*\n\n${joke}`);
  } catch (error) {
    console.error("Joke command error:", error);
    await message.send("❌ _Failed to get joke_");
  }
});

Module({
  command: "quote",
  package: "fun",
  description: "Get an inspirational quote",
})(async (message) => {
  try {
    const quotes = [
      '"The only way to do great work is to love what you do." - Steve Jobs',
      '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
      '"It is during our darkest moments that we must focus to see the light." - Aristotle',
      '"The only impossible journey is the one you never begin." - Tony Robbins',
      '"Life is 10% what happens to you and 90% how you react to it." - Charles R. Swindoll',
      '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb',
      '"An unexamined life is not worth living." - Socrates',
      "\"Your time is limited, don't waste it living someone else's life.\" - Steve Jobs",
      '"The way to get started is to quit talking and begin doing." - Walt Disney',
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    await message.sendreply(`✨ *Inspirational Quote*\n\n${quote}`);
  } catch (error) {
    console.error("Quote command error:", error);
    await message.send("❌ _Failed to get quote_");
  }
});

Module({
  command: "flip",
  package: "fun",
  description: "Flip a coin",
})(async (message) => {
  try {
    const result = Math.random() < 0.5 ? "🪙 *Heads*" : "🪙 *Tails*";
    await message.sendreply(result);
  } catch (error) {
    console.error("Flip command error:", error);
    await message.send("❌ _Failed to flip coin_");
  }
});

Module({
  command: "roll",
  package: "fun",
  description: "Roll a dice",
})(async (message) => {
  try {
    const roll = Math.floor(Math.random() * 6) + 1;
    const dice = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    await message.sendreply(`🎲 You rolled: ${dice[roll - 1]} *${roll}*`);
  } catch (error) {
    console.error("Roll command error:", error);
    await message.send("❌ _Failed to roll dice_");
  }
});
