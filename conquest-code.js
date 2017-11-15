/////////////////////////
///   CONQUEST MODE   ///
/////////////////////////

handlers.sendHighscore = function(args, context){

  if(args == null || args.challengedPlayerId == null || args.seed == null ||
     args.stageId == null || args.score == null || args.displayName == null){
    return {result: "IGNORED", error: "INVALID_PARAMETERS"};
  }

  var challengedPlayerId = args.challengedPlayerId;
  var stageName = "stage";
  stageName = stageName.concat(args.stageId.toString());
  var submittedScore = args.score;

  var getUserDataResult = server.GetUserData({ PlayFabId: challengedPlayerId });
  if(getUserDataResult.Data[stageName] == null){ // no stage data found for this id

    if(currentPlayerId == challengedPlayerId){
      // initialize this stage data

      return handlers.updateStageData( {
        playerId: currentPlayerId,
        ownerPlayerId: challengedPlayerId,
        stageId: args.stageId,
        seed: args.seed,
        score: submittedScore,
        displayName: args.displayName
      }, context);

    }else{
      // cant initialize this stage data
      return {result: "IGNORED", error: "STAGE_NOT_INITIALIZED"};
    }
  }

  var currentHighscore = JSON.parse(getUserDataResult.Data[stageName].Value).highscore;
  var currentSeed = JSON.parse(getUserDataResult.Data[stageName].Value).seed;

  if(args.seed != currentSeed){
    return {result: "IGNORED", error: "INVALID_SEED"};
  }

  if(submittedScore > currentHighscore){
    // dominate territory
    return handlers.updateStageData( {
        playerId: currentPlayerId,
        ownerPlayerId: challengedPlayerId,
        stageId: args.stageId,
        seed: args.seed,
        score: submittedScore,
        displayName: args.displayName
    }, context);
  }else{
    return {result: "IGNORED", error: "SCORE_NOT_BIG_ENOUGH"};
  }


  var response = {
    regionName: getUserDataResult.Data.regionName.Value,
    highscore: currentHighscore
  };
  return {message: response};
}



handlers.updateStageData = function(args, context){

  if(args == null || args.playerId == null || args.ownerPlayerId == null || args.seed == null ||
     args.stageId == null || args.score == null || args.displayName == null){
    return {error: "INVALID_PARAMETERS"};
  }


  var stageName = "stage";
  stageName = stageName.concat(args.stageId.toString());

  // ADD SCORE TO CONQUEST MODE LEADERBOARD
  server.UpdatePlayerStatistics({Statistics: {
    StatisticName: "Conquest Mode",
    Value: 100
  }});

  var stageData = {
    seed: args.seed,
    highscore: args.score,
    ownerId: args.playerId,
    ownerDisplayName: args.displayName
  };
  var requestData = {};
  requestData[stageName] = JSON.stringify(stageData);

  var request = {
    PlayFabId: args.ownerPlayerId,
    Data: requestData,
    Permission: "Public"
  }
  var requestResult = server.UpdateUserData(request);
  return {result: "OK"}
}
