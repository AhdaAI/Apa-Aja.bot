const FS = require("fs");
const PATH = require("path");
const { getSecret } = require("../GCP/secret_manager");

const essentialEnv = ["DISCORD_TOKEN", "CLIENT_ID"];

const loadEnv = () => {
  let envFileName;
  if (process.env.NODE_ENV === "production") {
    console.log("=======================================================");
    console.log("--------------- ENVIRONMENT: PRODUCTION ---------------");
    console.log("=======================================================");
    envFileName = "../.env.production";
  } else {
    console.log("=======================================================");
    console.log("-------------- ENVIRONMENT: DEVELOPMENT ---------------");
    console.log("=======================================================");
    envFileName = "../.env.development";
    essentialEnv.push("GUILD_ID");
  }

  let envFilePath = PATH.join(__dirname, envFileName);
  if (!FS.existsSync(envFilePath)) {
    console.error(
      `[!] Environment file ${envFileName} not found at ${envFilePath}`
    );
    console.log(
      "[?] Please create the file with the required environment variables."
    );
    process.exit(1);
  }

  try {
    const envFile = FS.readFileSync(envFilePath, "utf8");
    const envLines = envFile.split("\n");
    envLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, value] = trimmedLine.split("=");
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.error(`[?] Error reading .env.* file: ${error.message}`);
    process.exit(1);
  }

  checkEnv();
};

const checkEnv = () => {
  const missingEnv = [];
  for (const varName of essentialEnv) {
    const value = process.env[varName];
    if (value && value.trim() !== "") {
      console.log(`[✓] ${varName} loaded.`);
      continue;
    }

    const secretManager = gcpEnv(varName);
    if (secretManager) {
      console.log(`[✓] ${varName} loaded.`);
      continue;
    }

    console.error(`[?] Error: ${varName} is missing or empty.`);
    missingEnv.push(varName);
  }

  if (missingEnv > 0) {
    console.log("--- ERROR: SOME OF ESSENTIAL ENVIRONMENT IS MISSING ---");
    console.log("[?] Missing environment: ", missingEnv.join(", "));
    process.exit(1);
  }

  console.log("----------- Environment Loaded Successfully -----------");
};

const gcpEnv = async (varName) => {
  // Check for GCP variable
  const gcpVariable = [
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_CLOUD_PROJECT",
  ];
  for (const variable of gcpVariable) {
    if (!process.env[variable]) {
      console.log(`[!] ${variable} is missing or empty.`);
    }
  }

  // Check for service account file location
  const serviceAccountPath = PATH.join(
    __dirname,
    `../${process.env.GOOGLE_APPLICATION_CREDENTIALS}`
  );
  if (!FS.existsSync(serviceAccountPath)) {
    console.error("[!] Error: Failed to locate service account file.");
    console.log("------ Please add missing service account file. -------");
    console.log("=======================================================");
    process.exit(1);
  }

  const secret = await getSecret(varName);
  if (!secret) {
    console.log(
      "[!] Error: Failed to fetch missing environment from GCP Secret Manager"
    );
    return false;
  }

  process.env[varName] = secret;
  return true;
};

module.exports = {
  loadEnv,
  checkEnv,
  gcpEnv,
};
