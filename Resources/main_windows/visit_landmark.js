Titanium.include('../utils.js');

Titanium.UI.setBackgroundColor('#fff');

var win = Titanium.UI.currentWindow;

var label = Titanium.UI.createLabel({
  text: 'You are currently at: ' + Titanium.App.currentLandmark.name,
  top: 10,
  left: 10,
  right: 10,
  width: 300,
  textAlign: 'center',
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
});
win.add(label);

var startEstimatesButton = Ti.UI.createButton({
  title: "I am ready to estimate directions and distances.",
  top:110,
	width:300,
	height:70,
	borderRadius:1,
	font:{fontFamily:'Arial',fontSize:18}
});
win.add(startEstimatesButton);
startEstimatesButton.addEventListener('click', function(event) {
  /* ASSEMBLE ESTIMATE TARGETS */
  estimateTargets = [];
  for (var i = 0, j = Ti.App.landmarks.length; i < j; i++) {
    if (Ti.App.landmarks[i].landmark.id == Ti.App.currentLandmark.id) {
      continue;
    }
    estimateTargets.push({
      targetLandmark: Ti.App.landmarks[i].landmark,
      directionDistanceEstimate: {}
    });
  }
  estimateTargets = Utils.shuffle(estimateTargets);
  Ti.App.estimateTargets = estimateTargets;
  Ti.App.currentEstimateTargetIndex = 0;
  Windows.makeEstimate();
  win.close();
});

var skipEstimatesButton = Ti.UI.createButton({
  title: "I'm really rushed. I need to skip the estimates.",
  top:210,
	width:300,
	height:70,
	borderRadius:1,
	font:{fontFamily:'Arial',fontSize:18}
});
win.add(skipEstimatesButton);
skipEstimatesButton.addEventListener('click', function(event) {
  win.close();
});

var wrongLandmarkButton = Ti.UI.createButton({
  title: "Oops, I didn't mean to select " + Titanium.App.currentLandmark.name,
  top:310,
	width:300,
	height:70,
	borderRadius:1,
	font:{fontFamily:'Arial',fontSize:18}
});
win.add(wrongLandmarkButton);
wrongLandmarkButton.addEventListener('click', function(event) {
  /* DELETE LANDMARK VISIT */
  var deletingLandmarkVisitActivityIndicator = Ti.UI.createActivityIndicator({ message: "Deleting your mistaken visit to " +  Titanium.App.currentLandmark.name + "..."});
  deletingLandmarkVisitActivityIndicator.show();
  params = {'_method': 'DELETE'};
  CogSurver.request("POST", "landmark_visits/" + Ti.App.currentLandmarkVisitId, params, function(event) {
   deletingLandmarkVisitActivityIndicator.hide();
   Ti.App.currentLandmarkVisitId = null;
   win.close();
   Windows.selectLandmark();
  }, function() {
    deletingLandmarkVisitActivityIndicator.hide();    
  }, "xml");
});


/* RECORD LANDMARK VISIT */
var recordingLandmarkVisitActivityIndicator = Ti.UI.createActivityIndicator({ message: "Recording your visit to " +  Titanium.App.currentLandmark.name + "..."});
recordingLandmarkVisitActivityIndicator.show();
params = {'landmark_visit[landmark_id]': Ti.App.currentLandmark.id};
CogSurver.request("POST", "landmark_visits", params, function(event) {
 recordingLandmarkVisitActivityIndicator.hide();
 Ti.App.currentLandmarkVisitId = JSON.parse(this.responseText).landmark_visit.id;
}, function(event) {
  recordingLandmarkVisitActivityIndicator.hide();
});