Titanium.include('../utils.js');

Titanium.UI.setBackgroundColor('#fff');

var win = Titanium.UI.currentWindow;

var label = Titanium.UI.createLabel({
  text: 'Which landmark are you currently at?',
  top: 10,
  left: 10,
  right: 10,
  width: 300,
  textAlign: 'center',
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
});
win.add(label);

/* LANDMARKS TABLEVIEW */
var landmarksTableView = Titanium.UI.createTableView({
  top: 65,
  bottom: 65,
  data: Ti.App.landmarks,
	font: {fontSize: 14}
});
win.add(landmarksTableView);

/* LOAD LANDMARKS */
// CogSurver.loadLandmarks();
// Titanium.App.addEventListener("landmarksLoaded", function() {
//   landmarksTableView.setData(Ti.App.landmarks);
// });
var loadingLandmarksActivityIndicator = Ti.UI.createActivityIndicator({ message: "Loading your landmarks from the server..." });
loadingLandmarksActivityIndicator.show();
CogSurver.request("GET", "landmarks", {}, function(event) {
  var json = this.responseText;
	var response = JSON.parse(json);
	
	// add titles for the sake of landmarksTableView
	landmarks = [];
	for (var i = 0, j = response.length; i < j; i++) {
    landmarks.push({title: response[i].landmark.name, landmark: response[i].landmark});
  }
	
	Ti.App.landmarks = landmarks;
	landmarksTableView.setData(Ti.App.landmarks);
  Ti.App.fireEvent("landmarksLoaded", {});  //TODO
  loadingLandmarksActivityIndicator.hide();
  Ti.App.xhr.abort();
}, function() {
  loadingLandmarksActivityIndicator.hide();  
});

/* SELECTING AN EXISTING LANDMARK */
landmarksTableView.addEventListener('click', function(e) {
 Titanium.App.currentLandmark = e.rowData.landmark; 
 Windows.visitLandmark();
 win.close();
});

/* MARK A NEW LANDMARK BUTTON */
var markNewLandmarkButton = Titanium.UI.createButton({
  title: 'Mark a New Landmark',
  bottom:10,
	width:300,
	height:55,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
});
win.add(markNewLandmarkButton);

markNewLandmarkButton.addEventListener('click', function(e) { markNewLandmark(); });
markNewLandmarkButton.addEventListener('touchend', function(e) { markNewLandmark(); });
markNewLandmark = function() {
  Windows.markLandmark();
  win.close();
};
