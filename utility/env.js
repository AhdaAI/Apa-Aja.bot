const FS = require("fs");
const PATH = require("path");

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

  checkEnv()
}

const checkEnv = () => {
  const missingEnv = [];
  for (const varName of essentialEnv) {
    const value = process.env[varName];
    if (value && value.trim() !== "") {
      console.log(`[✓] ${varName} loaded.`);
      continue;
    }

    console.error(`[?] Error: ${varName} is missing or empty.`);
    missingEnv.push(varName);
  }

  if (missingEnv > 0) {
    console.log("--- ERROR SOME OF ESSENTIAL ENVIRONMENT IS MISSING ----");
    console.log("[?] Missing environment: ", missingEnv.join(", "));
    process.exit(1);
  }

  console.log("----------- Environment Loaded Successfully -----------");
}

module.exports = {
  loadEnv,
  checkEnv,
};
