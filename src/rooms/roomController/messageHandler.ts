import { Room, Client } from "colyseus";
import { setRandomRole } from "./gameRoomManager";

export function registerMessageHandlers(room: Room<any>){

  room.onMessage("setColyPlayerName", (client: Client, data:{playerName: string, playerToken: string}) => {
    const { playerName, playerToken } = data;
    console.log("setColyPlayerName command received", data)
    const player = room.state.playersByToken.get(playerToken)
    
    if (player){
      player.playerName = playerName
    } else {
      console.warn(`Player with playerToken ${playerToken} not found.`);
    }
  })

  room.onMessage("setColyNumPlayers", (client: Client, data:{numPlayers: number}) => {
    console.log("setColyNumPlayers command received", data)
    room.state.storyMetadata.NumberOfPlayers = data.numPlayers
  })

  room.onMessage("setRandomizeRoles", (client: Client, data:{playerToken: string}) => {
    console.log("setRandomizeRoles command received")
    const { playerToken } = data
    setRandomRole.call(room, playerToken)
  })

  room.onMessage("setPlayerIsReady", (client: Client, data:{isReady: boolean, playerToken: string}) => {
    console.log("setPlayerIsReady command received")
    const { isReady, playerToken } = data
    const player = room.state.playersByToken.get(playerToken)

    if (player){
      player.isReady = isReady
    } else {
      console.warn(`Player with playerToken ${playerToken} not found.`);
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