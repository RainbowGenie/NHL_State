const nhl = require("statsapi-nhl");
const axios = require("axios");
const Game = require("./models/game.model.js");
const Player = require("./models/player.model.js");

let previousSchedule = null;

// Poll the NHL Stats API at a regular interval to get real-time schedule data
setInterval(() => {
  nhl.Schedule.get()
    .then((schedule) => {
      if (JSON.stringify(schedule) !== JSON.stringify(previousSchedule)) {
        console.log("Schedule has changed:", schedule);
        previousSchedule = schedule;
        const games = schedule[0].games;

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
      } else {
        console.log("Schedule has not changed:");
      }
    })
    .catch((error) => {
      console.error("Error retrieving schedule:", error);
    });
}, 5000); // Poll every 5 seconds

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
      const statusData = [
        "",
        "upcoming",
        "in_progress",
        "final",
        "scheduled",
        "postponed",
        "canceled",
        "suspended",
      ];
      // Delete old game data from database
      Game.destroy({
        where: {
          game_id: gameId,
        },
      })
        .then(() => {
          console.log("Game Data deleted successfully");
          try {
            Game.findOne({
              where: {
                game_id: gameId,
              },
            })
              .then((result) => {
                if (result === null) {
                  Game.create({
                    game_id: gameId,
                    home_team_id: liveData.gameData.teams.home.id,
                    home_team_name: liveData.gameData.teams.home.name,
                    away_team_id: liveData.gameData.teams.away.id,
                    away_team_name: liveData.gameData.teams.away.name,
                    status: statusData[liveData.gameData.status.statusCode],
                    start_time: liveData.gameData.datetime.dateTime,
                    end_time: liveData.gameData.datetime.endDateTime,
                  })
                    .then((result) => {
                      console.log(`Created Game Data: ${result.game_id}`);
                    })
                    .catch((error) => {
                      console.error("Error creating Game");
                    });
                }
              })
              .catch((error) => {
                console.error("Error finding Game");
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
        })
        .catch((error) => {
          console.error(`Error deleting user: ${error}`);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}
async function ingestPlayerData(playerData, gameId, teamData, gameData) {
  Player.create({
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
  })
    .then((result) => {
      console.log(
        `Created Player Data: ${result.player_id} ${result.player_name}`
      );
    })
    .catch((error) => {
      console.error("Error Creating Player");
    });
}
async function reloadPlayerData(playerData, gameId, teamData, gameData) {
  try {
    Player.findOne({
      where: {
        player_id: playerData.person.id,
      },
    })
      .then((result) => {
        if (result === null) {
          Player.create({
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
          })
            .then((result) => {
              console.log(
                `Created Player Data: ${result.player_id} ${result.player_name}`
              );
            })
            .catch((error) => {
              console.error("Error Creating Player");
            });
        }
      })
      .catch((error) => {
        console.error("Error Finding Player");
      });
  } catch (error) {
    console.error(error);
  }
}
