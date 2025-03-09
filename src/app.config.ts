import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { Server } from "colyseus";
import { Application } from "express";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";

export default config({

    initializeGameServer: (gameServer: Server) => {
        // Define your room handlers:
        gameServer.define('my_room', MyRoom);
    },

    initializeExpress: (app: Application) => {
        // Bind your custom express routes here:
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        // Use @colyseus/playground
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        // Use @colyseus/monitor (consider securing this route in production)
        app.use("/monitor", monitor());
    },

    beforeListen: () => {
        // Before gameServer.listen() is called.
    }
});
