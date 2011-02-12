Titanium.include('utils.js');

Titanium.UI.setBackgroundColor('#fff');

/* GLOBAL STORAGE */
var landmarks, currentLandmark, currentLandmarkVisitId, estimateTargets, currentEstimateTargetIndex;

/* GLOBAL NETWORK ACCESS */
var xhr;// = Ti.Network.createHTTPClient();

/* USER AUTHORIZATION */
if (!CurrentUser.signedIn()) {
  Windows.signIn();
}
else {
  Windows.main();
}