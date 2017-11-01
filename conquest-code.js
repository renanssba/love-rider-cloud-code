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
  var stageName = "stage".concat( args.stageId.toString() );
  var submittedScore = args.score;
  
  var request = {
    PlayFabId: currentPlayerId
  };
  var getUserDataResult = server.GetUserData(request);
  
  if( getUserDataResult.Data[stageName] == null ){
    return {error: "STAGE_NOT_INITIALIZED"};
  } 
  
  var currentHighscore = getUserDataResult.Data[stageName].Value.highscore;
  
  
  var response = {
    regionName: getUserDataResult.Data[stageName].Value,
    highscore: currentHighscore
  }  
  return{message: response};
}

