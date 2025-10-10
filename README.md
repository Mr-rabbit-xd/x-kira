<img src="https://files.catbox.moe/lq7nwm.jpg" alt="Garfield Bot" width="300"/>

# WhatsApp Bot

> A powerful and feature-rich WhatsApp bot built with Baileys library

## Quick Setup

### 1. Get Your Session ID

> Get session id

[![Scan QR Code](https://img.shields.io/badge/Scan-QR%20Code-25D366?style=for-the-badge&logo=whatsapp)](https://pair.garfielx.qzz.io/)

### 2. Environment Variables

```bash
SESSION_ID=session_id_here
PREFIX=/
LANG=en
SUDO=×××××××××
OWNER_NUMBER=××××××,××××××,×××××
WORKTYPE=private/public
THEME=Garfield
```

### 3. Start Bot Using PM2

**Start the bot:**

```bash
pm2 start . --name garfield --attach --time
```

**Stop the bot:**

```bash
pm2 stop garfield
```

## Configure

| Variable       | Description          | Default    | Required |
| -------------- | -------------------- | ---------- | -------- |
| `SESSION_ID`   | Session ID           | -          | ✅       |
| `PREFIX`       | cmd prefix           | `.`        | ❌       |
| `SUDO`         | Admin nums           | -          | ❌       |
| `OWNER_NUMBER` | Owner nums           | -          | ❌       |
| `WORKTYPE`     | (`private`/`public`) | `private`  | ❌       |
| `THEME`        | appearance theme     | `Garfield` | ❌       |

## Available Themes

- **Garfield** (Default)
- **X Astral**
- **WhatsApp Bot**

> Change themes by setting the `THEME` environment variable

## Deploy on

> Get koyeb api key

### Koyeb Deployment

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?name=garfield&type=git&repository=naxordeve%2Fwhatsapp-bot&branch=master&builder=dockerfile&instance_type=free&instances_min=0&autoscaling_sleep_idle_delay=3600&env%5BPREFIX%5D=.&env%5BSESSION_ID%5D=garfield%7E9fgeB7X8&env%5BSUDO%5D=%2B27686881509&env%5BTHEME%5D=Garfield&ports=3000%3Bhttp%3B%2F&hc_protocol%5B3000%5D=tcp&hc_grace_period%5B3000%5D=5&hc_interval%5B3000%5D=30&hc_restart_limit%5B3000%5D=3&hc_timeout%5B3000%5D=5&hc_path%5B3000%5D=%2F&hc_method%5B3000%5D=get)

### Replit

1. Fork this repository to your Replit account
2. Add environment variables in the Secrets tab
3. Click the Run button to start your bot

### Render

> Get render api key

[![Render](./lib/deploy-render.svg)](https://render.com/deploy?repo=https://github.com/naxordeve/whatsapp-bot)

### Panel

> Create server

[![Panel](./lib/deploy-panel.svg)](https://control.katabump.com/)

## Monitoring

### UptimeBot

Keep your bot online 24/7 with [UptimeRobot](https://uptimerobot.com)

## Development

### Local Setup

```bash
# Clone the repository
git clone https://github.com/naxordeve/whatsapp-bot.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the bot
npm start
```

### Plugins

Create custom plugins in the `plugins/` directory. Check existing plugins for examples.

[![Join our WhatsApp](https://img.shields.io/badge/💬%20Join%20WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/KLd7DIw1OV56wj4BRw0oE9)

**Arigato**

---

<div align="center">

**Made with ❤️**

[![GitHub stars](https://img.shields.io/github/stars/naxordeve/whatsapp-bot?style=social)](https://github.com/naxordeve/whatsapp-bot)
[![GitHub forks](https://img.shields.io/github/forks/naxordeve/whatsapp-bot?style=social)](https://github.com/naxordeve/whatsapp-bot)

</div>

Message Object Properties
message.raw // Original raw message object from Baileys
message.conn // Connection object (Baileys socket)
message.key // Message key object
message.id // Message ID
message.from // Chat JID (where message came from)
message.fromMe // Boolean - true if message is from bot
message.sender // Sender JID (who sent the message)
message.isGroup // Boolean - true if message is from a group
message.pushName // Sender's push name (display name)
message.type // Message type (conversation, imageMessage, videoMessage, etc.)
message.body // Extracted text content from message
message.content // Raw message content
message.quoted // Quoted/replied message object (or null)
message.mentions // Array of mentioned JIDs
Group Properties (after loadGroupInfo())
message.groupMetadata // Full group metadata object
message.groupParticipants // Array of all group participants
message.groupAdmins // Array of admin JIDs
message.groupOwner // Group owner JID
message.joinApprovalMode // Boolean - join approval enabled
message.memberAddMode // Boolean - member add mode
message.announce // Boolean - group is muted (only admins can send)
message.restrict // Boolean - restrict mode enabled
message.isAdmin // Boolean - is sender an admin
message.isBotAdmin // Boolean - is bot an admin
Message Methods
// Basic messaging
message.send(payload, options) // Send message
message.sendreply(payload, options) // Send reply to message
message.react(emoji) // React to message
message.sendFromUrl(url, opts) // Download and send from URL
message.download() // Download message media

// Group management
message.loadGroupInfo() // Load group information
message.muteGroup() // Mute group (only admins can send)
message.unmuteGroup() // Unmute group
message.setSubject(text) // Set group subject/name
message.setDescription(text) // Set group description
message.addParticipant(jid) // Add participant to group
message.removeParticipant(jid) // Remove participant from group
message.promoteParticipant(jid) // Promote to admin
message.demoteParticipant(jid) // Demote from admin
message.leaveGroup() // Bot leaves the group
message.inviteCode() // Get group invite code
message.revokeInvite() // Revoke group invite link
message.getInviteInfo(code) // Get info about invite code
message.joinViaInvite(code) // Join group via invite code
message.getJoinRequests() // Get pending join requests
message.updateJoinRequests(jids, action) // Approve/reject join requests
message.setMemberAddMode(enable) // Enable/disable member add mode
message.getParticipants() // Get all participants
message.isParticipant(jid) // Check if JID is participant

// User management
message.fetchStatus(jid) // Get user status
message.profilePictureUrl(jid) // Get profile picture URL
message.blockUser(jid) // Block user
message.unblockUser(jid) // Unblock user
message.setPp(jid, buf) // Set profile picture
Quoted Message Properties (if exists)
message.quoted.type // Type of quoted message
message.quoted.msg // Quoted message content
message.quoted.body // Text body of quoted message
message.quoted.fromMe // Boolean - is quoted message from bot
message.quoted.participant // Who sent the quoted message
message.quoted.id // Quoted message ID
message.quoted.key // Quoted message key
message.quoted.download() // Download quoted message media
Connection Object Methods (message.conn)
// Send messages
message.conn.sendMessage(jid, content, options)

// Group operations
message.conn.groupMetadata(jid)
message.conn.groupCreate(subject, participants)
message.conn.groupLeave(jid)
message.conn.groupUpdateSubject(jid, subject)
message.conn.groupUpdateDescription(jid, description)
message.conn.groupParticipantsUpdate(jid, participants, action)
message.conn.groupSettingUpdate(jid, setting)
message.conn.groupInviteCode(jid)
message.conn.groupRevokeInvite(jid)
message.conn.groupAcceptInvite(code)
message.conn.groupGetInviteInfo(code)
message.conn.groupRequestParticipantsList(jid)
message.conn.groupRequestParticipantsUpdate(jid, participants, action)

// User operations
message.conn.updateProfilePicture(jid, content)
message.conn.removeProfilePicture(jid)
message.conn.updateProfileStatus(status)
message.conn.updateProfileName(name)
message.conn.updateBlockStatus(jid, action)
message.conn.fetchStatus(jid)
message.conn.profilePictureUrl(jid, type)
message.conn.onWhatsApp(jid)
message.conn.fetchPrivacySettings(checkOnline)

// Presence
message.conn.sendPresenceUpdate(type, jid)
message.conn.presenceSubscribe(jid)

// Other
message.conn.readMessages(keys)
message.conn.sendReceipt(jid, participant, messageIds, type)
message.conn.getBusinessProfile(jid)
message.conn.query(node)
message.conn.chatModify(modification, jid)
Message Key Object Properties
message.key.remoteJid // Chat JID
message.key.fromMe // Boolean - from bot
message.key.id // Message ID
message.key.participant // Participant JID (in groups)
Usage Examples
// Access properties
console.log(message.sender); // "1234567890@s.whatsapp.net"
console.log(message.body); // "!ping"
console.log(message.isGroup); // true
console.log(message.pushName); // "John Doe"
