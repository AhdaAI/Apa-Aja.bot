const { Firestore, Timestamp } = require("@google-cloud/firestore");
const path = require("path");

const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

// ----- Guild Config -----
async function setGuildConfig(guildId, configData) {
  try {
    const guildRef = db.collection('guild').doc(guildId)
    await guildRef.set({
      id: guildId,
      ...configData,
      lastUpdated: Timestamp.now()
    }, {merge: true})
    console.log(`[ ] New guild configured for ${guildId}`)
  } catch (error) {
    console.error(`[?] Error saving guild config for ${guildId}: `, error)
  }
}

module.exports = {
  initializeFirestore,
};
