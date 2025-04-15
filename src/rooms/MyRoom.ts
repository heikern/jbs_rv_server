import { Room, Client, AuthContext } from "colyseus";
import { GameState, StoryMetadata, Player } from "./schema/MyRoomState";
import { setCurrentHost, 
         addNewPlayer, 
         fetchGameMetaData,
         setStoryMetadata,
         setRandomRole } from "./roomController/gameRoomManager";
import { registerMessageHandlers } from "./roomController/messageHandler";

import jwt from 'jsonwebtoken';
const SECRET_KEY = 'your-very-secure-key';


// Option 2: JWT Token
function generateJWTToken(payload: any) {
  // Set expiration and other claims as needed:
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '5h' });
}

export class MyRoom extends Room<GameState> {
  maxClients = 4;
  state = new GameState();

  onCreate (options: any) {
    // add any message handlers here
    registerMessageHandlers(this);
  }

  async onAuth(client: Client<any, any>, options: any, context: AuthContext) {
    const { playerToken } = options;
    console.log("playerToken provided:", playerToken);

    if (playerToken){
      try{
        const decode = jwt.verify(playerToken, SECRET_KEY);
        console.log("Decoded token:", decode);

        const player = this.state.playersByToken.get(playerToken);
        if (player) {
          // Rebinding returning player
          player.sessionId = client.sessionId;
          player.isConnected = true;
          return true;
        }
      }catch(err) {
        console.error("Error during authentication:", err);
      }
    } else {
      // create new player token
      const newTokenPayload = {
        tempId: client.sessionId,
        created: Date.now(),
      }
      console.log("New token payload:", newTokenPayload);
      const newPlayerToken = generateJWTToken(newTokenPayload);
      options.playerToken = newPlayerToken;
    }


    // prevent new clients from joining if the game reached capacity
    if (this.state.currentHostToken && this.state.storyMetadata.NumberOfPlayers <= this.clients.length) {
      client.send("error", { message: "Player limit reached" }); // send message back to client
      return Error("Player limit reached");
    }


    if (!this.state.currentHostToken && !this.state.storyMetadata.Id) {
      const storyMetadata = await fetchGameMetaData(options.storyId);
      if (!storyMetadata) {
        return Error("Invalid story id");
      }
      setStoryMetadata.call(this, storyMetadata);
      console.log("this.state.storyMetadata.Title", this.state.storyMetadata.Title);
      return true;
    }

    return true;
    
  }

  onJoin (client: Client, options: any) {
    const { playerToken } = options;

    console.log(`${client.sessionId}  joined with playerToken ${playerToken} at ${Date()}`);

    let player = this.state.playersByToken.get(playerToken);

    if (!player) {
      //  Add the new player to the state
      //  The player is not ready by default
      options.playerName = ""
      addNewPlayer.call(this, client, playerToken);
      console.log("sending token-assigned message to client", playerToken);
      client.send("token-assigned", { token: playerToken });
    }

    if (!this.state.currentHostToken) {
      setCurrentHost.call(this, playerToken);
      console.log(client.sessionId, "joined and is now the host at", Date());
    }else {
      console.log(client.sessionId, "joined!");
    }

  }

  async onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left. Consented: ${consented}`);
    let playerToken: string | undefined;
    this.state.playersByToken.forEach((player, token)=>{
      if (player.sessionId === client.sessionId) {
        playerToken = token;
        player.isConnected = false;
      }
    });

    if (!playerToken) {
      console.error(`Could not find player with connectionId ${client.sessionId}`);
      return;
    }
  
    try {
      if (consented) {
        throw new Error("Consented leave");
      }
  
      console.log("allowing reconnection for client", client.sessionId);
      await this.allowReconnection(client, 3600);
      // client returned! let's re-activate it.
      this.state.playersByToken.get(playerToken).isConnected = true;
      console.log(`${client.sessionId} reconnected.`);

    } catch (e) {
      console.log(`${client.sessionId} failed to reconnect:`, e);
      const player = this.state.playersByToken.get(playerToken);
      if (player){
        player.isConnected = false;
        console.log(`${playerToken} remains in game but is marked as disconnected`);
      }

      // Handle the case where the leaving client is the host
      if (this.state.currentHostToken === playerToken && this.clients.length > 0){
        const randomIndex = Math.floor(Math.random() * this.clients.length);
        const newHost = this.clients[randomIndex];

        // Find the playerToken for this client
        let newHostToken: string | undefined;
        this.state.playersByToken.forEach((player, token) => {
          if (player.sessionId === newHost.sessionId) {
            newHostToken = token;
          }
        });

        if (newHostToken) {
          setCurrentHost.call(this, newHostToken);
          console.log(`New host assigned with token ${newHostToken} at ${Date()}`);
        } else {
          console.error("Could not find playerToken for new host");
        }
      }

    }
  }

  onDispose() {
    console.log("room disposing...");
  }

}
