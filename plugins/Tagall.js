const { Module } = require('../lib/plugins');

Module({
    command: 'tagall',
    package: 'group',
    description: 'Tag all group members with custom style'
})(async (m,text) => {
    if (!m.isGroup ) return await m.sendreply("*_This command is for groups_*");
   if (!m.isAdmin || !m.isBotAdmin) return await m.sendreply("*_Only bot owner and group admins can use this command_*");
    try {
      const conn = m.conn;
      const from = m.from;
      const groupMetadata = await conn.groupMetadata(from);
      const participants = groupMetadata.participants;
      const groupName = groupMetadata.subject || "Unknown Group";
      let totalMembers = participants ? participants.length : 0;
      if (totalMembers === 0)
        return m.reply("❌ No members found in this group.");
      const msgText = text?.trim() || "ATTENTION EVERYONE";
      const emojis = [
        "⚡",
        "✨",
        "🎖️",
        "💎",
        "🔱",
        "💗",
        "❤‍🩹",
        "👻",
        "🌟",
        "🪄",
        "🎋",
        "🪼",
        "🍿",
        "👀",
        "👑",
        "🦋",
        "🐋",
        "🌻",
        "🌸",
        "🔥",
        "🍉",
        "🍧",
        "🍨",
        "🍦",
        "🧃",
        "🪀",
        "🎾",
        "🪇",
        "🎲",
        "🎡",
        "🧸",
        "🎀",
        "🎈",
        "🩵",
        "♥️",
        "🚩",
        "🏳️‍🌈",
        "🏖️",
        "🔪",
        "🎏",
        "🫐",
        "🍓",
        "💋",
        "🍄",
        "🎐",
        "🍇",
        "🐍",
        "🪻",
        "🪸",
        "💀",
      ];
      const getEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
      let tagText = `*▢ GROUP : ${groupName}*\n*▢ MEMBERS : ${totalMembers}*\n*▢ MESSAGE : ${msgText}*\n\n*╭┈─「 ɦเ αℓℓ ƒɾเεɳ∂ร 🥰 」┈❍*\n`;
      for (const p of participants) {
        tagText += `*│${getEmoji()} ᩧ𝆺ྀི𝅥* @${p.id.split("@")[0]}\n`;
      }
      tagText += "*╰────────────❍*";
      const mentions = participants.map((p) => p.id);
      await conn.sendMessage(
        from,
        {
          text: tagText,
          mentions,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("tagall error:", err);
      m.reply("❌ An error occurred while tagging members.");
    }
  }
   );


Module({
    command: 'admin',
    package: 'group',
    description: 'Tag all group admins'
})(async (m, text) => {
    if (!m.isGroup) return await m.sendReply("*_This command is for groups_*");
    if (!m.isAdmin || !m.isBotAdmin) return await m.sendReply("*_Only bot owner and group admins can use this command_*");

    try {
        const conn = m.conn;
        const from = m.from;
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const groupName = groupMetadata.subject || "Unknown Group";

        // Filter only admins and super admins
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const totalAdmins = admins.length;

        if (totalAdmins === 0) {
            return await m.sendReply("❌ No admins found in this group.");
        }

        const msgText = text?.trim() || "ATTENTION ADMINS";

        const emojis = [
            "⚡", "✨", "🎖️", "💎", "🔱", "💗", "❤‍🩹", "👻", 
            "🌟", "🪄", "🎋", "🪼", "🍿", "👀", "👑", "🦋", 
            "🐋", "🌻", "🌸", "🔥", "🍉", "🍧", "🍨", "🍦", 
            "🧃", "🪀", "🎾", "🪇", "🎲", "🎡", "🧸", "🎀", 
            "🎈", "🩵", "♥️", "🚩", "🏳️‍🌈", "🏖️", "🔪", "🎏", 
            "🫐", "🍓", "💋", "🍄", "🎐", "🍇", "🐍", "🪻", 
            "🪸", "💀"
        ];

        const getEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

        let tagText = `*▢ GROUP : ${groupName}*\n*▢ ADMINS : ${totalAdmins}*\n*▢ MESSAGE : ${msgText}*\n\n*╭┈─「 αℓℓ α∂ɱเɳร 👑 」┈❍*\n`;

        for (const admin of admins) {
            const role = admin.admin === 'superadmin' ? '🌟' : '👮';
            tagText += `*│${getEmoji()} ${role}* @${admin.id.split("@")[0]}\n`;
        }

        tagText += "*╰────────────❍*";

        const mentions = admins.map((a) => a.id);

        await conn.sendMessage(
            from,
            {
                text: tagText,
                mentions,
            },
            { quoted: m }
        );
    } catch (err) {
        console.error("admin tag error:", err);
        await m.sendReply("❌ An error occurred while tagging admins.");
    }
});