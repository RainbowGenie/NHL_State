const axios = require("axios");
const connection = require("./models/db.js");
const mysql = require("mysql");
const moment = require("moment");
const Game = require("./models/game.model.js");
const Player = require("./models/player.model.js");

axios
  // .get("https://statsapi.web.nhl.com/api/v1/schedule")
  .get("https://statsapi.web.nhl.com/api/v1/schedule?date=2023-04-03")
  .then((response) => {
    const games = response.data.dates[0].games;

    games.forEach((game) => {
      const gameStatus = game.status.abstractGameState;
      const gameId = game.gamePk;

      if (gameStatus === "Live") {
        // Start ingestion process for live game
        ingestLiveGame(gameId);
      } else if (gameStatus === "Final") {
        // Reload data for finished game
        reloadGameData(gameId);
      }
    });
  })
  .catch((error) => {
    console.log(error);
  });

function ingestLiveGame(gameId) {
  axios
    .get(`https://statsapi.web.nhl.com/api/v1/game/${gameId}/feed/live`)
    .then((response) => {
      const liveData = response.data;
      for (const playerId in liveData.liveData.boxscore.teams.home.players) {
        const playerData =
          liveData.liveData.boxscore.teams.home.players[playerId];
        ingestPlayerData(
          playerData,
          gameId,
          liveData.liveData.boxscore.teams.home.team,
          liveData.gameData
        );
      }
      for (const playerId in liveData.liveData.boxscore.teams.away.players) {
        const playerData =
          liveData.liveData.boxscore.teams.away.players[playerId];
        ingestPlayerData(
          playerData,
          gameId,
          liveData.liveData.boxscore.teams.away.team,
          liveData.gameData
        );
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function reloadGameData(gameId) {
  axios
    .get(`https://statsapi.web.nhl.com/api/v1/game/${gameId}/feed/live`)
    .then((response) => {
      const liveData = response.data;
      console.log("gameId", gameId);
      // Delete old game data from database
      connection.query(
        `DELETE FROM game_data WHERE game_id = ${gameId}`,
        (err) => {
          if (err) throw err;

          // Get game data from NHL API
          try {
            Game.findOne(gameId, (err, data) => {
              if (err) {
                if (err.kind === "not_found") {
                  const newGame = new Game({
                    game_id: gameId,
                    home_team_id: liveData.gameData.teams.home.id,
                    home_team_name: liveData.gameData.teams.home.name,
                    away_team_id: liveData.gameData.teams.away.id,
                    away_team_name: liveData.gameData.teams.away.name,
                    status: liveData.gameData.status.statusCode,
                    start_time: liveData.gameData.datetime.dateTime,
                    end_time: liveData.gameData.datetime.endDateTime,
                  });
                  Game.create(newGame, (err, data) => {});
                }
              }
            });
          } catch (error) {
            console.error(error);
          }
          for (const playerId in liveData.liveData.boxscore.teams.home
            .players) {
            const playerData =
              liveData.liveData.boxscore.teams.home.players[playerId];
            reloadPlayerData(
              playerData,
              gameId,
              liveData.liveData.boxscore.teams.home.team,
              liveData.gameData
            );
          }
          for (const playerId in liveData.liveData.boxscore.teams.away
            .players) {
            const playerData =
              liveData.liveData.boxscore.teams.away.players[playerId];
            reloadPlayerData(
              playerData,
              gameId,
              liveData.liveData.boxscore.teams.away.team,
              liveData.gameData
            );
          }
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
}
async function ingestPlayerData(playerData, gameId, teamData, gameData) {
  const newPlayer = new Player({
    game_id: gameId,
    player_id: playerData.person.id,
    player_name: playerData.person.fullName,
    team_id: teamData.id,
    team_name: teamData.name,
    age: gameData.players[`ID${playerData.person.id}`].currentAge,
    number: playerData.jerseyNumber,
    position: playerData.position.abbreviation,
    assists:
      playerData.position.abbreviation === "N/A" ||
      playerData.position.abbreviation === "G"
        ? 0
        : playerData.stats.skaterStats.assists,
    goals:
      playerData.position.abbreviation === "N/A" ||
      playerData.position.abbreviation === "G"
        ? 0
        : playerData.stats.skaterStats.goals,
    hits:
      playerData.position.abbreviation === "N/A" ||
      playerData.position.abbreviation === "G"
        ? 0
        : playerData.stats.skaterStats.hits,
    penalty_minutes:
      playerData.position.abbreviation === "N/A" ||
      playerData.position.abbreviation === "G"
        ? 0
        : playerData.stats.skaterStats.penaltyMinutes,
    opponent_team_id:
      teamData.id === gameData.teams.away.id
        ? gameData.teams.home.id
        : gameData.teams.away.id,
    opponent_team_name:
      teamData.id === gameData.teams.away.id
        ? gameData.teams.home.name
        : gameData.teams.away.name,
  });
  Player.create(newPlayer, (err, data) => {});
}
async function reloadPlayerData(playerData, gameId, teamData, gameData) {
  try {
    try {
      Player.findOne(playerData.person.id, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            const newPlayer = new Player({
              game_id: gameId,
              player_id: playerData.person.id,
              player_name: playerData.person.fullName,
              team_id: teamData.id,
              team_name: teamData.name,
              age: gameData.players[`ID${playerData.person.id}`].currentAge,
              number: playerData.jerseyNumber,
              position: playerData.position.abbreviation,
              assists:
                playerData.position.abbreviation === "N/A" ||
                playerData.position.abbreviation === "G"
                  ? 0
                  : playerData.stats.skaterStats.assists,
              goals:
                playerData.position.abbreviation === "N/A" ||
                playerData.position.abbreviation === "G"
                  ? 0
                  : playerData.stats.skaterStats.goals,
              hits:
                playerData.position.abbreviation === "N/A" ||
                playerData.position.abbreviation === "G"
                  ? 0
                  : playerData.stats.skaterStats.hits,
              penalty_minutes:
                playerData.position.abbreviation === "N/A" ||
                playerData.position.abbreviation === "G"
                  ? 0
                  : playerData.stats.skaterStats.penaltyMinutes,
              opponent_team_id:
                teamData.id === gameData.teams.away.id
                  ? gameData.teams.home.id
                  : gameData.teams.away.id,
              opponent_team_name:
                teamData.id === gameData.teams.away.id
                  ? gameData.teams.home.name
                  : gameData.teams.away.name,
            });
            Player.create(newPlayer, (err, data) => {});
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(`Error reloading player data for game ${gameId}:`, error);
  }
}
