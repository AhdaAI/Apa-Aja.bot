module.exports = {
  apps: [
    {
      name: "Discord-bot",
      script: "index.js",
      env: {
        GOOGLE_APPLICATION_CREDENTIALS:
          process.env.GOOGLE_APPLICATION_CREDENTIALS,
      },
    },
  ],
};
