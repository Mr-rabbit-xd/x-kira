const { Module } = require('../lib/plugins');

Module({
    command: 'ping',
    package: 'mics',
    description: 'Replies with the bot latency'
})(async (message) => {
    const start = Date.now();
    const emojis = [
        '⛅', '👻', '⛄', '👀', '🪁', '🪃', '🎳', '🎀',
        '🌸', '🌟', '🍥', '🎀', '🍓', '🍡', '💗', '🦋',
        '💫', '💀', '☁️', '🌨️', '🌧️', '🌦️', '🌥️', '⛅',
        '🪹', '⚡', '🌟', '☁️', '🎐', '🏖️', '🎐', '🪺',
        '🌊', '🐚', '🪸', '🍒', '🍇', '🍉', '🌻', '🎢',
        '🚀', '🍫', '💎', '🌋', '🏔️', '⛰️', '🌙', '🪐',
        '🌲', '🍃', '🍂', '🍁', '🪵', '🍄', '🌿', '🐞',
        '🐍', '🕊️', '🕷️', '🕸️', '🎃', '🏟️', '🎡', '🥂',
        '🗿', '⛩️'
      ];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
     
    const sent = await message.send('🏓 Pong...');
    const latency = Date.now() - start;
    await message.send(`*${emoji}➥𝔓͓✻͢͞ᥢ𝔤͛ ${latency} 𝖒ˢ*`, { edit: sent.key });
});