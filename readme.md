# Apa-Aja.bot

This is a Discord bot built using Node.js and the Discord.js library. The bot includes various commands and event handlers to manage roles, rules, and other server-related tasks.

## Setup

1. Clone the repository.
2. Install the dependencies using `npm install`.
3. Add your Google Cloud Platform service account credentials to `GCP_Service_Account.json`.
4. Ensure that the necessary secrets are stored in Google Secret Manager:
   - `Discord_Dev_Bot`
   - `Discord_Bot`
5. Ensure that the necessary project id is stored in `.env`.
   - `PROJECTID`
6. Start the bot using `npm start`.

## Commands

### Admin Commands

- **/admin rules**: Add rules to the server.
- **/admin manage**: Manage server data (roles, rules, misc).
- **/admin misc**: Manage miscellaneous attributes (title, description, URL).

### Role Commands

- **/role register**: Add or remove roles from the dropdown menu.
- **/role update**: Update the dropdown menu in a specified channel.

### Ping Command

- **/ping**: Replies with "Pong!".

## Docker

A `dockerfile` is included to build a Docker image for the bot. The Docker image uses Node.js and installs the necessary dependencies.
