const fs = require("fs");
const path = require("path");

function loadEnv() {
  // Checking for env file name
  let fileName;
  if (fs.existsSync(path.resolve(".env"))) {
    console.log("Found '.env'");
    fileName = ".env";
  } else {
    console.log("Trying '.env.dev'");
    fileName = ".env.dev";
  }

  const envPath = path.resolve(fileName);
  if (!fs.existsSync(envPath)) return false;

  const envContent = fs.readFileSync(envPath, "utf-8");

  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=").map((part) => part.trim());
    if (key && value && !process.env[key]) {
      console.log(`Found ${key} …`);
      process.env[key] = value;
    }
  });

  return true;
}

function registerEnv(key, value) {
  console.log(`Registering ${key} …`);
  process.env[key] = value;
}

module.exports = {
  loadEnv,
  registerEnv,
};
