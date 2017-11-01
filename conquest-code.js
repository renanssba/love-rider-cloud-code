/////////////////////////
///   CONQUEST MODE   ///
/////////////////////////

handlers.sendHighscore = function(args, context){
  
  if(args && args.challengedPlayerId && args.stageId && args.score){
    log.debug("Valid parameters. Continue execution");
  }else{
    return {error: "INVALID_PARAMETERS"};
  }
  
  
  var challengedPlayerId = args.challengedPlayerId;
  var challengedStageId = args.stageId;
  var submittedScore = args.score;
  
  var request = {
    PlayFabId: currentPlayerId
  };
  var getUserDataResult = server.GetUserData(request);
  log.debug(getUserDataResult.Data.regionName);
  
  var response = {
    regionName: getUserDataResult.Data.regionName
  }  
  return{message: response};
}

