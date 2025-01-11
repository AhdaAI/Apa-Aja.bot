const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { fprint } = require("./utils/basic")
require("dotenv").config();

const header = "GCP"
fprint(header, `Project ID: ${process.env.PROJECTID}`)
// Create a Secret Manager client
const client = new SecretManagerServiceClient({
  projectId: process.env.PROJECTID,
});

async function accessSecret(secretName) {
  fprint(header, `Looking for secret: ${secretName}`)
  // console.log(`[ GCP ] Looking for secret: ${secretName}`);
  try {
    // Construct the resource name of the secret version
    const [version] = await client.accessSecretVersion({
      name: `projects/${process.env.PROJECTID}/secrets/${secretName}/versions/latest`,
    });

    // Extract the payload
    const payload = version.payload.data.toString("utf8");
    return payload;
  } catch (error) {
    console.error("[ GCP ] Error accessing secret: ", error);
    process.exit(1)
  }
}

module.exports = { accessSecret };
