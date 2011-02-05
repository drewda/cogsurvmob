Titanium.include('/imports.js');

Titanium.UI.setBackgroundColor('#fff');

var win = Titanium.UI.currentWindow;

var label = Titanium.UI.createLabel({
  text: 'Which landmark are you currently at?',
  top: 10,
  left: 10,
  right: 10,
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
CogSurver.loadLandmarks();
Titanium.API.addEventListener(Events.landmarksLoaded, function() {
  landmarksTableView.setData(Ti.App.landmarks);
});

/* SELECTING AN EXISTING LANDMARK */
landmarksTableView.addEventListener('click', function(e) {
 Titanium.App.currentLandmark = e.rowData.landmark;
 CogSurver.visitLandmark(Ti.App.currentLandmark.id);
});
Titanium.API.addEventListener(Events.landmarkVisited, function() {
  alert('yo');
  Titanium.UI.createAlertDialog({title:'Landmark',message:'you visited: ' + Titanium.App.currentLandmark.landmark.name}).show();
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

markNewLandmarkButton.addEventListener('click', function(e) {
  Windows.markLandmark();
  win.close();
});
