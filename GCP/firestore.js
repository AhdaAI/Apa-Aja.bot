const { Firestore, Timestamp } = require("@google-cloud/firestore");
const path = require("path");

const collectionName = "guilds";

const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  databaseId: process.env.GOOGLE_DATABASE,
});

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
    console.log(`[ ] New guild configured for ${guildId}`);
  } catch (error) {
    console.error(`[?] Error saving guild config for ${guildId}: `, error);
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
    console.error(`Error when checking for guild ${guildId}: `, error);
    throw error;
  }
}

// ----- Get Guild Config -----
/**
 * Retrieves a guild's configuration.
 * @param {string} guildId The Discord Guild ID.
 * @returns {Promise<object|null>} The configuration object or null if not found.
 */
async function getGuildConfig(guildId) {
  try {
    const doc = await db.collection(collectionName).doc(guildId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data();
  } catch (error) {
    console.error(`[?] Error getting guild config for ${guildId}: `, error);
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
    console.error(`[?] Error updating guild config for ${guildId}: `, error);
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
    console.error(`Error deleting guild config for ${guildId}:`, error);
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
    console.error(`Error adding role to guild ${guildId}:`, error);
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
    console.error(`Error removing role from guild ${guildId}:`, error);
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
    console.error(`Error updating subscription for guild ${guildId}:`, error);
    throw error;
  }
}

module.exports = {
  setGuildConfig,
  getGuildConfig,
  updateGuildConfig,
  deleteGuildConfig,
  addGuildRole,
  removeGuildRole,
  updateSubscriptionStatus,
  checkGuildConfig,
};
