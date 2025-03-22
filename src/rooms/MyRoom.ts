import { Room, Client, AuthContext } from "colyseus";
import { GameState, StoryMetadata } from "./schema/MyRoomState";
import { setCurrentHost, 
         addNewPlayer, 
         fetchGameMetaData,
         setStoryMetadata } from "./messageHandlers/messageHandler";


export class MyRoom extends Room<GameState> {
  maxClients = 4;
  state = new GameState();

  onCreate (options: any) {
    // add any message handlers here
    this.onMessage("setColyPlayerName", (client: Client, data:{playerName: string}) => {
      console.log("setColyPlayerName command received", data)
      const sessionId = client.sessionId
      const player = this.state.players.get(sessionId)
      if (player){
        player.playerName = data.playerName
        this.state.players.set(sessionId, player)
      } else {
        console.warn(`Player with sessionId ${sessionId} not found.`);
      }
    })

    this.onMessage("setColyNumPlayers", (client: Client, data:{numPlayers: number}) => {
      console.log("setColyNumPlayers command received", data)
      this.state.storyMetadata.NumberOfPlayers = data.numPlayers
    })
  }

  async onAuth(client: Client<any, any>, options: any, context: AuthContext) {
    const isReconnection = this.state.players.has(client.sessionId);
    if (isReconnection) {
      console.log(client.sessionId, "rejoined!");
    }

    if (this.state.currentHost && this.state.storyMetadata.NumberOfPlayers <= this.clients.length) {
      client.send("error", { message: "Player limit reached" }); // send message back to client
      return Error("Player limit reached");
    }

    if (!this.state.currentHost && !this.state.storyMetadata.Id) {
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

    //  Add the new player to the state
    //  The player is not ready by default
    addNewPlayer.call(this, client, options.playerName);
    
    //  Set the current host if there is no current host
    if (!this.state.currentHost) {
      setCurrentHost.call(this, client);
      console.log(client.sessionId, "joined and is now the host!");
    }else {
      console.log(client.sessionId, "joined!");
    }

  }

  async onLeave (client: Client, consented: boolean) {
    if (consented){
      this.state.players.delete(client.sessionId);
    } else {
      try {
        await this.allowReconnection(client, 10000);
      } catch (e) {
        this.state.players.delete(client.sessionId);
      }
    }
    

    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room disposing...");
  }

  // onMessage(client: any, message: any) {
  //   // handle message
  // }
}
