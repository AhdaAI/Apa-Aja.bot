const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
require("dotenv").config();

// Create a Secret Manager client
const client = new SecretManagerServiceClient({
  projectId: process.env.PROJECTID,
});

async function accessSecret(secretName) {
  console.log(`[ GCP ] Looking for secret: ${secretName}`);
  try {
    // Construct the resource name of the secret version
    const [version] = await client.accessSecretVersion({
      name: `projects/${process.env.PROJECTID}/secrets/${secretName}/versions/latest`,
    });

    // Extract the payload
    const payload = version.payload.data.toString("utf8");
    return payload;
  } catch (error) {
    console.error("Error accessing secret: ", error);
  }
}

module.exports = { accessSecret };
