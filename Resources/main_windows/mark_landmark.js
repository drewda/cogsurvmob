Titanium.include('../utils.js');

Ti.UI.setBackgroundColor('#fff');

var win = Ti.UI.currentWindow;

var label = Ti.UI.createLabel({
  text: 'Mark a New Landmark Here',
  top: 10,
  left: 10,
  right: 10,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
});
win.add(label);

/* CURRENT LOCATION */
var longitude;
var latitude;
var altitude;
var heading;
var accuracy;
var speed;
var timestamp;
var altitudeAccuracy;

var waitForLocation = Ti.UI.createActivityIndicator({ message: "Trying to determine your current position..." });
waitForLocation.show();

if (Ti.Platform.name == "iPhone OS") {
  Ti.Geolocation.purpose = "Marking a new landmark.";
}

if (Ti.Geolocation.locationServicesEnabled == false) {
	Ti.UI.createAlertDialog({title:'GPS Error', message:'Your device has its GPS turned off. Please turn it on.'}).show();
}
else
{
	if (Ti.Platform.name != 'android') {
		var authorization = Ti.Geolocation.locationServicesAuthorization;
		Ti.API.log('Authorization: '+authorization);
		if (authorization == Ti.Geolocation.AUTHORIZATION_DENIED) {
			Ti.UI.createAlertDialog({
				title:'GPS Error',
				message:'You are not giving Cognitive Surveyor to access your location.'
			}).show();
		}
		else if (authorization == Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
			Ti.UI.createAlertDialog({
				title:'GPS Error',
				message:'You are not giving Cognitive Surveyor to access your location.'
			}).show();
		}
	}

	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	
	//
	//  SET DISTANCE FILTER.  THIS DICTATES HOW OFTEN AN EVENT FIRES BASED ON THE DISTANCE THE DEVICE MOVES
	//  THIS VALUE IS IN METERS
	//
	Titanium.Geolocation.distanceFilter = 10;

	//
	// GET CURRENT POSITION - THIS FIRES ONCE
	//
	Titanium.Geolocation.getCurrentPosition(function(e)
	{
		if (!e.success || e.error)
		{
			alert('error ' + JSON.stringify(e.error));
			return;
		}

		longitude = e.coords.longitude;
		latitude = e.coords.latitude;
		altitude = e.coords.altitude;
		heading = e.coords.heading;
		accuracy = e.coords.accuracy;
		speed = e.coords.speed;
		timestamp = e.coords.timestamp;
		altitudeAccuracy = e.coords.altitudeAccuracy;
		
		waitForLocation.hide();
	});

	//
	// EVENT LISTENER FOR GEO EVENTS - THIS WILL FIRE REPEATEDLY (BASED ON DISTANCE FILTER)
	//
	Titanium.Geolocation.addEventListener('location',function(e) {
		if (!e.success || e.error) {
			return;
		}

	  longitude = e.coords.longitude;
	  latitude = e.coords.latitude;
	  altitude = e.coords.altitude;
	  heading = e.coords.heading;
	  accuracy = e.coords.accuracy;
	  speed = e.coords.speed;
	  timestamp = e.coords.timestamp;
	  altitudeAccuracy = e.coords.altitudeAccuracy;
		
	  waitForLocation.hide();
	});
}

var newLandmarkNameTextField = Ti.UI.createTextField({
	color:'#000',
  top:60,
	left:10,
  width:300,
	height:60,
	hintText:'Name of this Landmark',
	keyboardType:Ti.UI.KEYBOARD_DEFAULT,
	returnKeyType:Ti.UI.RETURNKEY_DEFAULT,
	borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(newLandmarkNameTextField);

var loginButton = Ti.UI.createButton({
	title:'Mark this New Landmark',
  top:150,
	width:240,
	height:55,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(loginButton);

loginButton.addEventListener('click', function(e) {
  if (!latitude || !longitude) {
    waitForLocation.show();
  }
  else if (!newLandmarkNameTextField.value) {
    alert('Please type a name for your new landmark.');
  }
  else {
    var markingLandmarkActivityIndicator = Ti.UI.createActivityIndicator({ message: "Sending your new landmark to the server..." });
    // CogSurver.markLandmark(newLandmarkNameTextField.value, latitude, longitude); 
    markingLandmarkActivityIndicator.show();
    params = {'landmark[name]': newLandmarkNameTextField.value, 
              'landmark[latitude]': latitude,
              'landmark[longitude]': longitude};
    CogSurver.request("POST", "landmarks", params, function(event) {
      CogSurver.markingLandmarkActivityIndicator.hide();
      Ti.App.currentLandmark = JSON.parse(this.responseText).landmark;
      // Titanium.Geolocation.removeEventListener('location');
      Windows.visitLandmark();
      win.close();
    }, function() {
      CogSurver.markingLandmarkActivityIndicator.hide();
    });
  }
});