const sequelize = require("./db.js");
const { DataTypes } = require("sequelize");

const Player = sequelize.define("player_data", {
  game_id: {
    type: DataTypes.INTEGER,
  },
  player_id: {
    type: DataTypes.INTEGER,
  },
  player_name: {
    type: DataTypes.STRING,
  },
  team_id: {
    type: DataTypes.INTEGER,
  },
  team_name: {
    type: DataTypes.STRING,
  },
  age: {
    type: DataTypes.INTEGER,
  },
  number: {
    type: DataTypes.INTEGER,
  },
  position: {
    type: DataTypes.STRING,
  },
  assists: {
    type: DataTypes.INTEGER,
  },
  goals: {
    type: DataTypes.INTEGER,
  },
  hits: {
    type: DataTypes.INTEGER,
  },
  points: {
    type: DataTypes.INTEGER,
  },
  penalty_minutes: {
    type: DataTypes.INTEGER,
  },
  opponent_team_id: {
    type: DataTypes.INTEGER,
  },
  opponent_team_name: {
    type: DataTypes.STRING,
  },
});

// Sync the model with the database
sequelize
  .sync()
  .then(() => {
    console.log("Player Model synced successfully.");
  })
  .catch((err) => {
    console.error("Unable to sync model:", err);
  });

module.exports = Player;
