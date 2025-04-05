import { Room, Client } from "colyseus";
import { setRandomRole } from "./gameRoomManager";

export function registerMessageHandlers(room: Room<any>){

  room.onMessage("setColyPlayerName", (client: Client, data:{playerName: string}) => {
    console.log("setColyPlayerName command received", data)
    const sessionId = client.sessionId
    const player = room.state.players.get(sessionId)
    if (player){
      player.playerName = data.playerName
      room.state.players.set(sessionId, player)
    } else {
      console.warn(`Player with sessionId ${sessionId} not found.`);
    }
  })

  room.onMessage("setColyNumPlayers", (client: Client, data:{numPlayers: number}) => {
    console.log("setColyNumPlayers command received", data)
    room.state.storyMetadata.NumberOfPlayers = data.numPlayers
  })

  room.onMessage("setRandomizeRoles", (client: Client) => {
    console.log("setRandomizeRoles command received")
    setRandomRole.call(room, client)
  })

  room.onMessage("setPlayerIsReady", (client: Client) => {
    console.log("setPlayerIsReady command received")
    const sessionId = client.sessionId
    const player = room.state.players.get(sessionId)
    if (player){
      player.isReady = true
      room.state.players.set(sessionId, player)
    } else {
      console.warn(`Player with sessionId ${sessionId} not found.`);
    }
  })

  room.onMessage("setStartGame", (client: Client) => {
    console.log("setStartGame command received")
    room.state.gameState = "InGame"
  })

  room.onMessage("setEnterLobby", (client: Client) => {
    console.log("setEnterLobby command received")
    room.state.gameState = "Lobby"
  })

  room.onMessage("setLeaveGame", (client: Client) => {
    console.log("setLeaveGame command received")
    room.state.gameState = "StorySelection"
  })

}