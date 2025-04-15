import { createServer } from "http";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";
import express from "express";
import { Server } from "colyseus";
import appConfig from "./app.config";
import admin from "./firebase/firestore_admin";

const app = express();

const basicAuthMiddleware = basicAuth({
    users: {admin: "admin"},
    challenge: true,
})

// 🖥️ Add monitor panel *after* Express app is configured
app.use("/colyseus", basicAuthMiddleware, monitor());

appConfig.initializeExpress(app);

const httpServer = createServer(app);

// Manually instantiate the Colyseus server with keep-alive settings
const gameServer = new Server({
  server: httpServer,
  pingInterval: 30000, // Ping every 30 seconds
//   pingTimeout: 60000   // Disconnect if no pong is received in 60 seconds
});

appConfig.initializeGameServer(gameServer);

if (appConfig.beforeListen) {
  appConfig.beforeListen();
}

const port = process.env.PORT || 2567;
httpServer.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
