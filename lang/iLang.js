const fs = require("fs");
const https = require("https");
const path = require("path");
const config = require("../config.js");
const LANG_FILE_PATH = path.join(__dirname, "lang.json");

/**
 * Download file from URL
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * Update lang.json from GitHub Gist
 */
async function updateLangFile() {
  try {
    // Check if GIST_URL is configured
    if (
      !config.GIST_URL ||
      config.GIST_URL === "" ||
      config.GIST_URL === "YOUR_GIST_URL_HERE"
    ) {
      console.log(
        "[Lang Update] ⚠ GIST_URL not configured, skipping update..."
      );
      return false;
    }

    console.log("[Lang Update] Downloading lang.json from GitHub Gist...");

    // Download the file
    const data = await downloadFile(config.GIST_URL);

    // Validate JSON
    JSON.parse(data); // This will throw if invalid JSON

    // Delete old file if exists
    if (fs.existsSync(LANG_FILE_PATH)) {
      fs.unlinkSync(LANG_FILE_PATH);
      console.log("[Lang Update] Old lang.json deleted");
    }

    // Save new file
    fs.writeFileSync(LANG_FILE_PATH, data, "utf8");
    console.log("[Lang Update] ✓ New lang.json saved successfully!");

    return true;
  } catch (error) {
    console.error("[Lang Update] ✗ Error updating lang.json:", error.message);
    console.log("[Lang Update] Continuing with existing lang.json...");
    return false;
  }
}

/**
 * Load lang.json file
 */
function loadLang() {
  try {
    // Check if file exists
    if (!fs.existsSync(LANG_FILE_PATH)) {
      console.log("[Lang Load] lang.json not found, creating default...");
      createDefaultLang();
    }

    const data = fs.readFileSync(LANG_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[Lang Load] Error loading lang.json:", error.message);
    console.log("[Lang Load] Creating default lang.json...");
    createDefaultLang();

    // Try loading again
    try {
      const data = fs.readFileSync(LANG_FILE_PATH, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("[Lang Load] Failed to create/load default lang.json");
      return getMinimalLang(); // Return minimal object to keep bot running
    }
  }
}

/**
 * Create default lang.json file
 */
function createDefaultLang() {
  const defaultLang = {
    extra: {
      connecting: "Connecting...",
      connected: "Connected!",
      init_session: "[{0}] Initiating new session",
      load_session: "[{0}] Checking session status",
      success_session: "[{0}] Session successfully validated.",
      error_message: "Error occurred: {0}",
    },
    plugins: {
      common: {
        reply_to_message: "Reply to a message",
        not_admin: "I'm not admin.",
        update: "Settings updated successfully!",
      },
      menu: {
        help: "Help menu - Commands available",
      },
      alive: {
        default: "I'm alive!\nUptime: #uptime",
        desc: "Check if bot is alive",
      },
    },
  };

  try {
    fs.writeFileSync(
      LANG_FILE_PATH,
      JSON.stringify(defaultLang, null, 2),
      "utf8"
    );
    console.log("[Lang Load] ✓ Default lang.json created");
  } catch (error) {
    console.error(
      "[Lang Load] Failed to create default lang.json:",
      error.message
    );
  }
}

/**
 * Get minimal lang object (fallback)
 */
function getMinimalLang() {
  return {
    extra: {
      connecting: "Connecting...",
      connected: "Connected!",
      error_message: "Error: {0}",
    },
    plugins: {
      common: {
        reply_to_message: "Reply to a message",
        not_admin: "I'm not admin.",
      },
    },
  };
}

/**
 * Initialize - Update and load lang file
 * Will NOT throw errors, always returns a lang object
 */
async function initializeLang() {
  // Try to update from Gist (will skip if not configured or fails)
  await updateLangFile();

  // Load lang file (will create default if needed)
  const lang = loadLang();

  if (!lang) {
    console.warn("[Lang] Warning: Using minimal fallback lang object");
    return getMinimalLang();
  }

  console.log("[Lang] ✓ Language file loaded successfully!");
  return lang;
}

/**
 * Get a lang value safely with fallback
 */
function getLangValue(lang, path, fallback = "") {
  try {
    const keys = path.split(".");
    let value = lang;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }

    return value || fallback;
  } catch (error) {
    return fallback;
  }
}

// Export functions
module.exports = {
  updateLangFile,
  loadLang,
  initializeLang,
  getLangValue,
};

// If running directly (for testing)
if (require.main === module) {
  initializeLang()
    .then((lang) => {
      console.log("[Lang] Initialization complete!");
      console.log(
        "[Lang] Sample value:",
        lang.plugins?.alive?.default || "N/A"
      );
    })
    .catch((err) => {
      console.error("[Lang] Initialization failed:", err);
    });
}
