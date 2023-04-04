const sql = require("./db.js");

// constructor
const Player = function (player) {
  this.game_id = player.game_id;
  this.player_id = player.player_id;
  this.player_name = player.player_name;
  this.team_id = player.team_id;
  this.team_name = player.team_name;
  this.age = player.age;
  this.number = player.number;
  this.position = player.position;
  this.assists = player.assists;
  this.goals = player.goals;
  this.hits = player.hits;
  this.penalty_minutes = player.penalty_minutes;
  this.opponent_team_id = player.opponent_team_id;
  this.opponent_team_name = player.opponent_team_name;
};

Player.create = (newPlayer, result) => {
  sql.query("INSERT INTO player_stats SET ?", newPlayer, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
  });
};
Player.findOne = (id, result) => {
  sql.query(
    `SELECT * FROM player_stats WHERE player_id = ${id}`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        result({ kind: "found" }, null);
      }

      // not found Player with the id
      result({ kind: "not_found" }, null);
    }
  );
};

module.exports = Player;
