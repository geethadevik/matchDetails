const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertPlayerDetailsObjectToResponse = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDetailsObjectToResponse = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const convertPlayerMatchScoreToObjectResponse = (dbObject) => {
  return {
    playerMatchId: dbObject.player_match_id,
    playerId: dbObject.player_id,
    matchId: dbObject.match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
    *
    FROM
    player_details;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertMatchDetailsObjectToResponse(eachPlayer)
    )
  );
});

app.get("/players/:playerId", async (request, Response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
    * 
    FROM 
    player_details
    WHERE
    player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertPlayerDetailsObjectToResponse(player_details));
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerNameQuery = `
    UPDATE
       player_details
     SET
       player_name = '${playerName}'
      WHERE
        player_id = ${playerId};`;
  await database.run(updatePlayerNameQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId", async (request, Response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
    * 
    FROM 
    match_details
    WHERE
    match_id = ${matchId};`;
  const match = await database.get(getMatchQuery);
  response.send(convertMatchDetailsObjectToResponse(match_details));
});

app.get("/players/:playerId/matches", async (request, Response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT
    * 
    FROM 
    player_match_score
    WHERE
    player_id = ${playerId};`;
  const playerMatches = await database.all(getPlayerMatchesQuery);
  response.send(
    playerMatches.map((eachMatch) =>
      convertMatchDetailsObjectToResponse(eachMatch)
    )
  );
});


app.get("/matches/:matchId/players", async (request, Response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
    SELECT
    * 
    FROM 
    player_match_score
    WHERE
    match_id = ${matchId};`;
  const matchPlayers = await database.get(getMatchPlayersQuery);
  response.send(convertPlayerDetailsObjectToResponse(matchPlayers);
    
});


app.get("/players/:playerId/playerScore/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreQuery = `
    SELECT
      playerName,
      SUM(score),
      SUM(fours),
      SUM(sixes)
      
    FROM
      player_match_score
    WHERE
      player_id=${playerId};`;
  const playerScore = await database.get(getPlayerScoreQuery);
  response.send({
    playerName: player_name,
    totalScore: playerScore["SUM(score)"],
    totalFours: playerScore["SUM(fours)"],
    totalSixes: playerScore["SUM(sixes)"]
  });
});
