/////////////////////////
///   CONQUEST MODE   ///
/////////////////////////

handlers.sendHighscore = function(args, context){
  
  if(args == null || args.challengedPlayerId == null ||
     args.stageId == null || args.score == null || args.displayName == null){
    return {error: "INVALID_PARAMETERS"};
  }
  
  var challengedPlayerId = args.challengedPlayerId;
  var stageName = "";
  stageName.concat("stage", args.stageId.toString());
  var submittedScore = args.score;
  
  var getUserDataResult = server.GetUserData({ PlayFabId: challengedPlayerId });
  if(getUserDataResult.Data[stageName] == null){ // no stage data found for this id
    
    /// TODO: initialize the data when I own the region
    if(currentPlayerId == challengedPlayerId){
      
      var stageData = {
        highscore: submittedScore,
        ownerId: currentPlayerId,
        ownerDisplayName: args.displayName
      }
      
      var request = {
        PlayFabId: challengedPlayerId,
        Data: {[stageName]: "STAGE DATA"},
        Permission: "Public"
      }
      var requestResult = server.UpdateUserData(request);
      return {result: "SUCCESS"}
      
    }else{
      return {error: "STAGE_NOT_INITIALIZED"};
    }
  }
  
  var currentHighscore = getUserDataResult.Data[stageName].Value.highscore;
  
  var response = {
    //regionName: getUserDataResult.Data.regionName.Value,
    highscore: currentHighscore
  };
  return{message: response};
}

