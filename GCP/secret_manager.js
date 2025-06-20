const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${secretName}/versions/latest`;
  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString("utf8");
    return payload;
  } catch (error) {
    console.error(`[!] Error accessing secret ${secretName}:`, error);
    throw error;
  }
}

module.exports = {
  getSecret,
};