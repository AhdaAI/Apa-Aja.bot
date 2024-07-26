FROM node:22-slim

ARG Token=InsertYourToken
ARG ClientID=YourClientID
ARG GuildID

ENV Token=${Token}
ENV ClientID=${ClientID}
ENV GuildID=${GuildID}