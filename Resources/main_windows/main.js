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
  	  var signOutAlert = Ti.UI.createAlertDialog({
  	    title:'Sorry', 
  	    message:"To finish the sign out process, you're going to need to turn off your phone and then turn it on again.",
  	    buttonNames: ["OK"]
  	  });
  	  signOutAlert.addEventListener('click', function() {
  	    CurrentUser.signOut();
        win.close();
  	  });
  	  signOutAlert.show();
	  });
	  
  	var accuracyMenuOption = menu.add({ title : 'Check GPS and Compass Accuracy' });
  	accuracyMenuOption.addEventListener('click', function(e) {
  	  Windows.accuracy();
      win.hide();
	  });
  };
}