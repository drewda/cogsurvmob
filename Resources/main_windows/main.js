Titanium.include('../utils.js');

var win = Titanium.UI.currentWindow;

var label = Titanium.UI.createLabel({
  text: 'Hello ' + CurrentUser.getName(),
  top: 10,
  left: 10,
  right: 10,
  width: 300,
  textAlign: 'center',
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
});
win.add(label);

var visitLandmarkButton = Titanium.UI.createButton({
  title: 'Visit a Landmark',
  top:150,
	width:200,
	height:150,
	borderRadius:1,
	font:{fontFamily:'Arial',fontSize:22}
});
win.add(visitLandmarkButton);
visitLandmarkButton.addEventListener('click',function(e) {
  Windows.selectLandmark();
  win.hide();
});

/* MENU */
if (Ti.Platform.name == 'android') {
  win.activity.onCreateOptionsMenu = function(e) {
  	var menu = e.menu;
	
  	var signOutMenuOption = menu.add({ title : 'Sign Out' });
  	signOutMenuOption.addEventListener('click', function(e) {
      CurrentUser.signOut();
      win.close();
  	});
  };
}