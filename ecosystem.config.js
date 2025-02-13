module.exports = {
  apps: [
    {
      name: "Discord-bot",
      script: "index.js",
      watch: true,
      ignore_watch: ["node_modules"],
      env: {
        NODE_ENV: "production",
        GOOGLE_APPLICATION_CREDENTIALS:
          process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
      },
      env_development: {
        NODE_ENV: "development",
        GOOGLE_APPLICATION_CREDENTIALS:
          process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
      },
    },
  ],
};
