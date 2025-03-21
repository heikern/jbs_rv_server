import { Room, Client } from "colyseus";
import { Player } from "../schema/MyRoomState";
import { firestoreDb } from "../../firebase/firestore_admin";

export async function fetchGameMetaData(storyId:string) {
  if (!storyId || typeof storyId !== "string" || storyId.trim() === "") {
    throw new Error("Provided storyId must be a non-empty string.");
  }
  try {
    const snapshot = firestoreDb.collection("stories").doc(storyId);
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

export function setStoryMetadata(this: Room, firebaseStoryMetadata: any) {
  if (firebaseStoryMetadata) {
    console.log("firebaseStoryMetadata", firebaseStoryMetadata);
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

export function setCurrentHost(this: Room, client: Client) {
  this.state.currentHost = client.sessionId;
}

export function addNewPlayer(this: Room, client: Client, playerName: string) {

    const newPlayer = new Player();

  this.state.players.set(client.sessionId, newPlayer);
}