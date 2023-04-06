const assert = require("assert");
const Player = require("./models/player.model.js");
const Game = require("./models/game.model.js");

// Test that live games are ingested
describe("ingestLiveGame", () => {
  it("should ingest player data for live game", () => {
    // Check that player data was ingested
    Player.findOne({ where: { player_id: 8474602 } }).then((result) => {
      assert.equal(result.player_name, "Justin Schultz");
      assert.equal(result.team_name, "Seattle Kraken");
      assert.equal(result.assists, 2);
      assert.equal(result.goals, 0);
    });
    Player.findOne({ where: { player_id: 8475768 } }).then((result) => {
      assert.equal(result.player_name, "Jaden Schwartz");
      assert.equal(result.team_name, "Seattle Kraken");
      assert.equal(result.assists, 0);
      assert.equal(result.goals, 0);
    });
  });
});

describe("reloadGameData", () => {
  it("should ingest game data", () => {
    // Check that player data was ingested
    Game.findOne({ where: { game_id: 2022021228 } }).then((result) => {
      assert.equal(result.home_team_name, "Seattle Kraken");
      assert.equal(result.away_team_name, "Arizona Coyotes");
    });
  });
});
