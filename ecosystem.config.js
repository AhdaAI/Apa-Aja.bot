module.exports = {
  apps: [
    {
      name: "Discord-bot",
      script: "index.js",
      env: {
        GOOGLE_APPLICATION_CREDENTIALS: "./GCP_Service_Account.json",
      },
    },
  ],
};
