Titanium.include('/imports.js');

Titanium.UI.setBackgroundColor('#fff');

/* GLOBAL STORAGE */
var landmarks, currentLandmark, currentLandmarkVisitId, estimateTargets, currentEstimateTargetIndex;

/* USER AUTHORIZATION */
if (!CurrentUser.signedIn()) {
  Windows.signIn();
}
else {
  Windows.main();
}