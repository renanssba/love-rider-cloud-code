/////////////////////////
///   CONQUEST MODE   ///
/////////////////////////

handlers.sendHighscore = function(args, context){

  if(args == null || args.challengedPlayerId == null || args.seed == null ||
     args.stageId == null || args.score == null){
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
      handlers.addScoreToConquestMode({playerId: currentPlayerId, score: 100}, context);
      return handlers.updateStageData( {
        playerId: currentPlayerId,
        ownerPlayerId: challengedPlayerId,
        stageId: args.stageId,
        seed: args.seed,
        score: submittedScore
      }, context);

    }else{
      // cant initialize this stage data
      return {result: "IGNORED", error: "STAGE_NOT_INITIALIZED"};
    }
  }

  var currentHighscore = JSON.parse(getUserDataResult.Data[stageName].Value).highscore;
  var currentSeed = JSON.parse(getUserDataResult.Data[stageName].Value).seed;
  var currentOwnerOfStage = JSON.parse(getUserDataResult.Data[stageName].Value).ownerId;
//  var currentOwnerName = JSON.parse(getUserDataResult.Data[stageName].Value).ownerDisplayName;

  if(args.seed != currentSeed){
    return {result: "IGNORED", error: "INVALID_SEED"};
  }

  if(submittedScore > currentHighscore){
    // dominate territory
    var contestantId;

    if(currentOwnerOfStage != currentPlayerId){
      handlers.addScoreToConquestMode({playerId: currentPlayerId, score: 110}, context);
      handlers.addScoreToConquestMode({playerId: currentOwnerOfStage, score: -100}, context);
      contestantId = challengedPlayerId;
    }else{
      contestantId = JSON.parse(getUserDataResult.Data[stageName].Value).contestantId;
    }

/*    server.SendPushNotification({
      Recipient: targetId,
      Subject: "Você foi desafiado",
      Package: {
        Message: "${currentOwnerName} conquistou seu território! Duele para recuperá-lo!",
      }
    });*/


    return handlers.updateStageData( {
        playerId: currentPlayerId,
        ownerPlayerId: challengedPlayerId,
        stageId: args.stageId,
        seed: args.seed,
        score: submittedScore,
        contestantId: contestantId,
        lastUpdated: new Date()
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
     args.stageId == null || args.score == null){
    return {error: "INVALID_PARAMETERS"};
  }

  var stageName = "stage";
  stageName = stageName.concat(args.stageId.toString());

  var stageData = {
    seed: args.seed,
    highscore: args.score,
    ownerId: args.playerId
  };
  if(args.lastUpdated != null){
    stageData.lastUpdated = args.lastUpdated;
  }
  if(args.contestantId != null){
    stageData.contestantId = args.contestantId;
  }

  var requestData = {};
  requestData[stageName] = JSON.stringify(stageData);

  var request = {
    PlayFabId: args.ownerPlayerId,
    Data: requestData,
    Permission: "Public"
  }
  var requestResult = server.UpdateUserData(request);
  return requestResult;
}



handlers.addScoreToConquestMode = function(args, context){

  if(args == null || args.playerId == null || args.score == null){
    return {error: "INVALID_PARAMETERS"};
  }

  var requestResult = server.UpdatePlayerStatistics({
    PlayFabId: args.playerId,
    Statistics: [{
      StatisticName: "Conquest Mode",
      Value: args.score
  }]});

  return requestResult;
}


handlers.getConquestTargets = function(args, context){
  var response = server.GetLeaderboardAroundUser({
    PlayFabId: currentPlayerId,
    StatisticName: "Conquest Mode",
    MaxResultsCount: 6
  });

  var i, playerIndex;
  for(i=0; i<response.Leaderboard.length; i++){
    if(response.Leaderboard[i].PlayFabId == currentPlayerId){
      playerIndex = i;
      break;
    }
  }
  response.Leaderboard.splice(playerIndex, 1);

  return response;
}


handlers.getConquestDataForPlayer = function(args, context){
  if(args == null || args.PlayFabId == null || args.DisplayName == null){
    return {error: "INVALID_PARAMETERS"};
  }

  var response = server.GetUserData({
    PlayFabId: args.PlayFabId
  });

  /// Set displayName for the stages data
  for(i=0; i<5; i++){
    var stageName = "stage";
    stageName = stageName.concat(i.toString());
    if(response.Data[stageName] != null){
      var newStageData = JSON.parse(response.Data[stageName].Value);
      if(newStageData.ownerId == args.PlayFabId){
        newStageData.ownerDisplayName = args.DisplayName;
        response.Data[stageName].Value = JSON.stringify(newStageData);
      } else {
        newStageData.ownerDisplayName = server.GetPlayerProfile({PlayFabId: newStageData.ownerId}).PlayerProfile.DisplayName;
        response.Data[stageName].Value = JSON.stringify(newStageData);
      }

      if(newStageData.lastUpdated != null){
        var passed_time = Date.hoursBetween(new Date(newStageData.lastUpdated), new Date());
        if(passed_time >= 24){
          response.Data[stageName].Value.Resolve = handlers.resolveDispute({
             PlayFabId: args.PlayFabId,
             stageId: i,
             stageData: newStageData,
             stageName: stageName
           }, context);
        }
        else {
          response.Data[stageName].Resolve = "passed hours: ".concat(passed_time.toString());
        }
      }
    }
  }

  return response;
}


handlers.resolveDispute = function(args, context){
  if(args == null || args.PlayFabId == null || args.stageId == null ||
     args.stageData == null || args.stageName == null){
    return {error: "INVALID_PARAMETERS"};
  }
  var originalOwnerId = args.PlayFabId;


  var response = {
    status: "resolved",
    winner: args.stageData.ownerId
  });


  if(args.stageData.ownerId == originalOwnerId){
    handlers.addScoreToConquestMode({playerId: args.stageData.ownerId, score: 20}, context);
    // Add one Defender Token item
    return handlers.updateStageData( {
      playerId: args.PlayFabId,
      ownerPlayerId: challengedPlayerId,
      stageId: args.stageId,
      seed: args.seed,
      score: submittedScore
    }, context);
  } else {
    handlers.addScoreToConquestMode({playerId: args.stageData.ownerId, score: 100}, context);
    // Add one Invader Token item
    server.UpdateUserData({
      PlayFabId: args.PlayFabId,
      KeysToRemove: new Array(args.stageName),
      Permission: "Public"
    });
    // cleans the stage itself
  }

  return response;
}
