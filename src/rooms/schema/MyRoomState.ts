import { Schema, type, MapSchema } from "@colyseus/schema";

enum GameStateEnum {
  default = "default",
  StorySelection = "StorySelection",
  Lobby = "Lobby",
  InGame = "InGame",
  GameOver = "GameOver",
};

export class Player extends Schema {
  @type("string") playerName: string = "";
  @type("string") playerRole: string = "";
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
  @type("string") gameState: GameStateEnum = GameStateEnum.StorySelection;
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(StoryMetadata) storyMetadata: StoryMetadata = new StoryMetadata();
}
