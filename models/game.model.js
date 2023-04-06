const sequelize = require("./db.js");
const { DataTypes } = require("sequelize");

const Game = sequelize.define("game_data", {
  game_id: {
    type: DataTypes.INTEGER,
  },
  home_team_id: {
    type: DataTypes.INTEGER,
  },
  home_team_name: {
    type: DataTypes.STRING,
  },
  away_team_id: {
    type: DataTypes.INTEGER,
  },
  away_team_name: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM,
    values: [
      "upcoming",
      "in_progress",
      "final",
      "scheduled",
      "postponed",
      "canceled",
      "suspended",
    ],
  },
  start_time: {
    type: DataTypes.DATE,
  },
  end_time: {
    type: DataTypes.DATE,
  },
});

// Sync the model with the database
sequelize
  .sync()
  .then(() => {
    console.log("Game Model synced successfully.");
  })
  .catch((err) => {
    console.error("Unable to sync model:", err);
  });

module.exports = Game;
