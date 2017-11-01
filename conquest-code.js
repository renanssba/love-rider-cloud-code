/////////////////////////
///   CONQUEST MODE   ///
/////////////////////////

handlers.sendHighscore = function(args, context){
  
  if(args == null || args.challengedPlayerId == null ||
     args.stageId == null || args.score == null || args.displayName == null){
    return {error: "INVALID_PARAMETERS"};
  }
  
  if(context == null || context.playerProfile == null || context.playerProfile.DisplayName == null){
    return {error: "CONTEXT_UNAVAILABLE_IN_THIS_CALL"};
  }
  
  
  var challengedPlayerId = args.challengedPlayerId;
  var stageName = "stage".concat( args.stageId.toString() );
  var submittedScore = args.score;
  
  var getUserDataResult = server.GetUserData({ PlayFabId: challengedPlayerId });
  if(getUserDataResult.Data[stageName] == null){ // no stage data found for this id
    
    /// TODO: initialize the data when I own the region
    if(currentPlayerId != challengedPlayerId){
      
      var stageData = {
        [stageName]: stageName,
        highscore: submittedScore,
        ownerId: currentPlayerId,
        ownerDisplayName: "DISPLAY NAME"
      }
      
      var request = {
        Data: stageData,
        Permission: Public
      }
      
      requestResult = server.UpdateUserData(request);
      return {result: "SUCCESS"}
      
    }else{
      return {error: "STAGE_NOT_INITIALIZED"};
    }
  }
  
  var currentHighscore = getUserDataResult.Data[stageName].Value.highscore;
  
  var response = {
    regionName: getUserDataResult.Data.regionName.Value,
    highscore: currentHighscore
  };
  return{message: response};
}

