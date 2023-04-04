const sql = require("./db.js");

// constructor
const Game = function (game) {
  this.game_id = game.game_id;
  this.home_team_id = game.home_team_id;
  this.home_team_name = game.home_team_name;
  this.away_team_id = game.away_team_id;
  this.away_team_name = game.away_team_name;
  this.status = game.status;
  this.start_time = game.start_time;
  this.end_time = game.end_time;
};

Game.create = (newGame, result) => {
  sql.query("INSERT INTO game_data SET ?", newGame, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
  });
};
Game.findOne = (id, result) => {
  sql.query(`SELECT * FROM game_data WHERE game_id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found game data: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Game with the id
    result({ kind: "not_found" }, null);
  });
};

module.exports = Game;
