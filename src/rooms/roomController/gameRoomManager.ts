import { Room, Client } from "colyseus";
import { Player } from "../schema/MyRoomState";
import { firestoreDb } from "../../firebase/firestore_admin";

export async function fetchGameMetaData(storyId:string) {
  if (!storyId || typeof storyId !== "string" || storyId.trim() === "") {
    throw new Error("Provided storyId must be a non-empty string.");
  }
  try {
    const snapshot = firestoreDb.collection("stories2").doc(storyId);
    const doc = await snapshot.get();
    if (!doc.exists) {
      console.log("No such document!");
      return null;
    }

    return doc.data();

  } catch (error) {
    console.log("Error getting document:", error);
    return null;
  }
}

export async function fetchPlayerRoles(this:Room){
  const storyId = this.state.storyMetadata.Id;
  if (!storyId || typeof storyId !== "string" || storyId.trim() === "") {
    throw new Error("Provided storyId must be a non-empty string.");
  }
  try {
    const snapshot = firestoreDb.collection("stories2").doc(storyId);
    const docs = await snapshot.get();
    if (docs.empty) {
      console.log("No scripts found!");
      return null;
    }
    const storyData = docs.data();
    const playerRoles = Object.keys(storyData.roles || {});

    return playerRoles

  } catch (error) {
    console.log("Error getting document:", error);
    return null;
  }

}

export async function fetchPlayerScripts(this:Room) {
  const storyId = this.state.storyMetadata.Id;
  if (!storyId || typeof storyId !== "string" || storyId.trim() === "") {
    throw new Error("Provided storyId must be a non-empty string.");
  }
  try {
    const snapshot = firestoreDb.collection("stories2").doc(storyId);
    const docs = await snapshot.get();
    if (docs.empty) {
      console.log("No scripts found!");
      return null;
    }
    const data = docs.data();
    const playerScripts = Object.keys(data.player_scripts || {});

    return playerScripts

  } catch (error) {
    console.log("Error getting document:", error);
    return null;
  }
}

export function setStoryMetadata(this: Room, firebaseStoryMetadata: any) {
  if (firebaseStoryMetadata) {
    this.state.storyMetadata.Id = firebaseStoryMetadata.id;
    this.state.storyMetadata.Title = firebaseStoryMetadata.title;
    this.state.storyMetadata.Description = firebaseStoryMetadata.description;
    this.state.storyMetadata.NumberOfPlayers = firebaseStoryMetadata.number_of_players;
  }
}

function generateRandom4LetterWord(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let word = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      word += letters[randomIndex];
    }
    return word;
}

// Fisher–Yates shuffle to randomize the roles array
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function setCurrentHost(this: Room, playerToken: string) {
  this.state.currentHostToken = playerToken;
}

export function addNewPlayer(this: Room, 
                              client: Client, 
                              playerToken: string) {

    const newPlayer = new Player();
    newPlayer.playerToken = playerToken;
    newPlayer.playerName = "";
    newPlayer.sessionId = client.sessionId;
    newPlayer.playerRoleId = "";
    newPlayer.isReady = false;
    newPlayer.isConnected = true;

  this.state.playersByToken.set(playerToken, newPlayer);
}

export async function setRandomRole(this: Room,  playerToken: string) {
  console.log("entered setRandomRole function");
  console.log("this.state.currentHost", this.state.currentHost);
  console.log("playerToken", playerToken);
  if (this.state.currentHostToken === playerToken){
    const playerRoles = await fetchPlayerRoles.call(this);
    const shuffledPlayerRoles = shuffle(playerRoles);
    if (shuffledPlayerRoles.length === this.state.storyMetadata.NumberOfPlayers) {
      let i = 0;
      this.state.playersByToken.forEach((player: any) => {
        player.playerRoleId = shuffledPlayerRoles[i];
        i++;
        console.log(`player ${player.playerToken} assigned role ${player.playerRoleId}`);
      })
      console.log("Player roles have been randomized.");

    } else {
      console.error("Number of player roles does not match the number of players in the game.");
    }

  }
}