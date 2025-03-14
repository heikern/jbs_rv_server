import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") playerName: string = "";
  @type("boolean") isReady: boolean = false;
}

export class StoryMetadata extends Schema {
  @type("string") Id: string = "";
  @type("string") Title: string = "";
  @type("string") Description: string = "";
  @type("number") NumberOfPlayers: number = -1;
}

export class GameState extends Schema {
  @type("string") currentHost: string = "";
  @type({ map: Player }) players = new Map<string, Player>();
  @type(StoryMetadata) storyMetadata: StoryMetadata = new StoryMetadata();
  
}
