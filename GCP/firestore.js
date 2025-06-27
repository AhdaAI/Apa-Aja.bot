const { Firestore, Timestamp } = require("@google-cloud/firestore");
const path = require("path");
const fs = require("fs").promises;

const logger = require("../utility/logger");

const collectionName = "guilds";

const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  databaseId: process.env.GOOGLE_DATABASE,
});

/**
 * @typedef {object} DefaultDatabaseConfig
 * @property {string} id - The unique identifier for the database configuration.
 * @property {string} title - The title of the project or configuration.
 * @property {DefaultRoleConfig} roles - An array of role objects, each with 'name' (string) and 'id' (number).
 * @property {object} subscription - Subscription details.
 * @property {boolean} subscription.epic - Indicates if Epic Games subscription is enabled.
 * @property {boolean} subscription.steam - Indicates if Steam subscription is enabled.
 * @property {string} webhook - The webhook URL, or an empty string if not configured.
 * @property {Date} lastUpdated
 */
/**
 * @typedef {object} DefaultRoleConfig
 * @property {string} id
 * @property {string} name
 */
/**
 * Fetch default configuration from a JSON file.
 * @returns {Promise<DefaultDatabaseConfig|undefined>}
 */
async function loadDefaultConfig() {
  try {
    const databaseConfigPath = path.join(
      __dirname,
      "../.gcloud/database_default.json"
    ); // The location of database need to be validated using env

    const data = await fs.readFile(databaseConfigPath, "utf8");
    // Parse the JSON data
    /** @type {DefaultDatabaseConfig} */
    const parsedConfig = JSON.parse(data);
    return parsedConfig;
  } catch (error) {
    logger.warn(error);
  }
}

// ----- Guild Config -----
/**
 * Saves or updates a guild's configuration.
 * Uses the guild's ID as the document ID.
 * @param {string} guildId The Discord Guild ID.
 * @param {object} configData The configuration data object.
 * @returns {Promise<void>}
 */
async function setGuildConfig(guildId, configData) {
  try {
    const guildRef = db.collection(collectionName).doc(guildId);
    await guildRef.set(
      {
        id: guildId,
        ...configData,
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    logger.error(`[?] Error saving guild config for ${guildId}: `, error);
    throw error;
  }
}

// ----- Check Guild Config Exists -----
/**
 *
 * @param {string} guildId
 * @returns {Promise<boolean|null>}
 */
async function checkGuildConfig(guildId) {
  try {
    const doc = await db.collection(collectionName).doc(guildId).get();

    if (!doc.exists) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error(`Error when checking for guild ${guildId}: `, error);
    throw error;
  }
}

// ----- Get Guild Config -----
/**
 * Retrieves a guild's configuration.
 * @param {string} guildId The Discord Guild ID.
 * @returns {Promise<DefaultDatabaseConfig|null>} The configuration object or null if not found.
 */
async function getGuildConfig(guildId) {
  try {
    const doc = await db.collection(collectionName).doc(guildId).get();

    if (!doc.exists) {
      return null;
    }

    /**@type {DefaultDatabaseConfig} */
    return doc.data();
  } catch (error) {
    logger.error(`[?] Error getting guild config for ${guildId}: `, error);
    throw error;
  }
}

// ----- Update Guild Config -----
/**
 * Updates specific fields of a guild's configuration.
 * @param {string} guildId The Discord Guild ID.
 * @param {object} updates An object containing fields to update (e.g., { "title": "New Title" }).
 * @returns {Promise<void>}
 */
async function updateGuildConfig(guildId, updates) {
  try {
    const guildRef = db.collection(collectionName).doc(guildId);
    await guildRef.update({
      ...updates,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    logger.error(`[?] Error updating guild config for ${guildId}: `, error);
    throw error;
  }
}

// ----- Delete Guild Config -----
/**
 * Deletes a guild's configuration.
 * @param {string} guildId The Discord Guild ID.
 * @returns {Promise<void>}
 */
async function deleteGuildConfig(guildId) {
  try {
    await db.collection(collectionName).doc(guildId).delete();
  } catch (error) {
    logger.error(`Error deleting guild config for ${guildId}:`, error);
    throw error;
  }
}

// ===== Specific Operations =====
// ----- Add Guild Role -----
/**
 * Adds a role to a guild's configuration.
 * @param {string} guildId The Discord Guild ID.
 * @param {object} role The role object { name: string, id: string }.
 * @returns {Promise<void>}
 */
async function addGuildRole(guildId, role) {
  try {
    const guildRef = db.collection(collectionName).doc(guildId);
    await guildRef.update({
      roles: Firestore.FieldValue.arrayUnion(role), // Atomically adds to array
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    logger.error(`Error adding role to guild ${guildId}:`, error);
    throw error;
  }
}

// ----- Remove Guild Role -----
/**
 * Removes a role from a guild's configuration.
 * @param {string} guildId The Discord Guild ID.
 * @param {object} role The role object { name: string, id: string } to remove.
 * @returns {Promise<void>}
 */
async function removeGuildRole(guildId, role) {
  try {
    const guildRef = db.collection(collectionName).doc(guildId);
    await guildRef.update({
      roles: Firestore.FieldValue.arrayRemove(role), // Atomically removes from array
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    logger.error(`Error removing role from guild ${guildId}:`, error);
    throw error;
  }
}

// ----- Update Subscription Status -----
/**
 * Updates a specific subscription type for a guild.
 * @param {string} guildId The Discord Guild ID.
 * @param {'epic'|'steam'} subscriptionType The subscription type (e.g., 'epic').
 * @param {boolean} status The new status (true/false).
 * @returns {Promise<void>}
 */
async function updateSubscriptionStatus(guildId, subscriptionType, status) {
  try {
    const guildRef = db.collection(collectionName).doc(guildId);
    await guildRef.update({
      [`subscription.${subscriptionType}`]: status, // Use dot notation for nested fields
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    logger.error(`Error updating subscription for guild ${guildId}:`, error);
    throw error;
  }
}

module.exports = {
  loadDefaultConfig,
  setGuildConfig,
  getGuildConfig,
  updateGuildConfig,
  deleteGuildConfig,
  addGuildRole,
  removeGuildRole,
  updateSubscriptionStatus,
  checkGuildConfig,
};
