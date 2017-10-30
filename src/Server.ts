import "dotenv/config";
import * as restify from "restify";
import * as builder from "botbuilder";
import LilouBot from "./LilouBot";

const bot = new LilouBot();

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Listen for messages from users 
server.post('/api/messages', bot.connector.listen());