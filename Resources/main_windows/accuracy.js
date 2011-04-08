Titanium.include('../utils.js');

var win = Titanium.UI.currentWindow;

/**
 * GPS
 */
/* CURRENT LOCATION */
var longitude;
var latitude;
var altitude;
var heading;
var accuracy;
var speed;
var timestamp;
var altitudeAccuracy;

// var waitForLocation = Ti.UI.createActivityIndicator({ message: "Trying to determine your current position..." });
// waitForLocation.show();

if (Ti.Platform.name == "iPhone OS") {
 Ti.Geolocation.purpose = "CogSurv accuracy";
}

if (Ti.Geolocation.locationServicesEnabled == false) {
 Ti.UI.createAlertDialog({title:'GPS Error', message:'Your device has its GPS turned off. Please turn it on.'}).show();
}
else {
 if (Ti.Platform.name != 'android') {
  var authorization = Ti.Geolocation.locationServicesAuthorization;
  Ti.API.info('Authorization: '+authorization);
  if (authorization == Ti.Geolocation.AUTHORIZATION_DENIED) {
    Ti.UI.createAlertDialog({
      title:'GPS Error',
      message:'You are not giving CogSurv permission to access your location.'
    }).show();
  }
  else if (authorization == Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
    Ti.UI.createAlertDialog({
      title:'GPS Error',
      message:'You are not giving CogSurv permission to access your location.'
    }).show();
  }
 }

Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;

 //
 //  SET DISTANCE FILTER.  THIS DICTATES HOW OFTEN AN EVENT FIRES BASED ON THE DISTANCE THE DEVICE MOVES
 //  THIS VALUE IS IN METERS
 //
 Titanium.Geolocation.distanceFilter = 1;

 //
 // EVENT LISTENER FOR GEO EVENTS - THIS WILL FIRE REPEATEDLY (BASED ON DISTANCE FILTER)
 //
 var locationChange = function(e) {
   if (!e.success || e.error) {
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
   positioningMethod = "gps";

   Titanium.API.info('geo updated (lon: ' + longitude + ', lat: ' + latitude + ')');
 };

 Titanium.Geolocation.addEventListener('location', locationChange);
}

/**
 * MAP
 */
var mapview = Titanium.Map.createView({
  mapType: Titanium.Map.SATELLITE_TYPE,
  // region: {latitude:37.86945, longitude:-122.26635,  
          // latitudeDelta:0.01, longitudeDelta:0.01},
  animate:true,
  // regionFit:true,
  userLocation:true,
  touchEnabled: true,
  top: 30
});

win.add(mapview);

var mapLatitude = 0;
var mapLongitude = 0;

/**
 * COMPASS
 */
var trueHeading;
var rotateCompassMeasuredLine = Titanium.UI.create2DMatrix();
var lastCompassMeasuredLineAngle = 0;
var compassMeasuredLine = Ti.UI.createImageView({
  image: '../arrow-red.png',
  center: mapview.center
});
win.add(compassMeasuredLine);
var rotateCompassSpecifiedLine = Titanium.UI.create2DMatrix();
var lastCompassSpecifiedLineAngle = 0;
var compassSpecifiedLine = Ti.UI.createImageView({
  image: '../arrow-green.png',
  center: mapview.center
});
win.add(compassSpecifiedLine);
// rotate both the arrows so they point straight up -- that's what we want as 0 degrees
rotateCompassMeasuredLine = rotateCompassMeasuredLine.rotate(-90);
compassMeasuredLine.transform = rotateCompassMeasuredLine;
rotateCompassSpecifiedLine = rotateCompassSpecifiedLine.rotate(-90);
compassSpecifiedLine.transform = rotateCompassSpecifiedLine;

if (Titanium.Geolocation.hasCompass) {
 Titanium.Geolocation.showCalibration = true;
 Titanium.Geolocation.headingFilter = 1;

 Ti.Geolocation.getCurrentHeading(function(e) {
   if (e.error) {
     alert('error: ' + e.error);
     return;
   }
   var x = e.heading.x;
   var y = e.heading.y;
   var z = e.heading.z;
   var magneticHeading = e.heading.magneticHeading;
   var accuracy = e.heading.accuracy;
   trueHeading = e.heading.trueHeading % 360;
   var timestamp = e.heading.timestamp;

   Titanium.API.info('geo - current heading: ' + trueHeading);
 });

 var headingChange = function(e) {
   if (e.error) {
     alert('error: ' + e.error);
     return;
   }

   var x = e.heading.x;
   var y = e.heading.y;
   var z = e.heading.z;
   var magneticHeading = e.heading.magneticHeading;
   var accuracy = e.heading.accuracy;
   trueHeading = e.heading.trueHeading % 360;
   var timestamp = e.heading.timestamp;
   
   rotateCompassMeasuredLine = rotateCompassMeasuredLine.rotate((lastCompassMeasuredLineAngle - trueHeading) * -1); // UPDATE 2D TRANSFORM MATRIX
   compassMeasuredLine.transform = rotateCompassMeasuredLine;
   lastCompassMeasuredLineAngle = trueHeading;

   Titanium.API.info('geo - heading updated; magnetic: ' + e.heading.magneticHeading + ' true (%360): ' + trueHeading);
 };
 Titanium.Geolocation.addEventListener('heading', headingChange);
}
else {
 Ti.UI.createAlertDialog({title:'No Compass', message:'This is a problem. Your device does not have a compass.'}).show();
}


/**
 * MAP CHANGE
 */
mapview.addEventListener('regionChanged',function(e) {
  // move crosshairs
  mapview.removeAllAnnotations();
  var crosshair = Titanium.Map.createAnnotation({
    pincolor: Titanium.Map.ANNOTATION_RED,
    title: 'actual location',
    latitude: e.latitude,
    longitude: e.longitude
  });
  mapview.addAnnotation(crosshair);
  
  // move compass lines
  compassMeasuredLine.center = mapview.center;
  compassSpecifiedLine.center = mapview.center;
  
  mapLongitude = e.longitude;
  mapLatitude = e.latitude;
	Titanium.API.info('maps region has updated to '+e.longitude+','+e.latitude);
});

/**
 * RECORD GPS
 */
var recordGpsButton = Titanium.UI.createButton({
  title: 'Record GPS',
  top:30,
  left: 10,
	width:120,
	height:80,
	borderRadius:1,
	font:{fontFamily:'Arial',fontSize:12}
});
win.add(recordGpsButton);
recordGpsButton.addEventListener('click', function() {
  var recordingGpsActivityIndicator = Ti.UI.createActivityIndicator({ message: "Sending measurement to server..." });
  recordingGpsActivityIndicator.show();
  params = {'gps_accuracy_measure[measured_latitude]': latitude, 
            'gps_accuracy_measure[measured_longitude]': longitude,
            'gps_accuracy_measure[measured_altitude]': altitude,
            'gps_accuracy_measure[measured_speed]': speed,
            'gps_accuracy_measure[measured_accuracy]': accuracy,
            'gps_accuracy_measure[specified_latitude]': mapLatitude,
            'gps_accuracy_measure[specified_longitude]': mapLongitude,
            'gps_accuracy_measure[specified_against]': 'google_hybrid_map',
            'gps_accuracy_measure[device]': Ti.Platform.model};
  CogSurver.request("POST", "gps_accuracy_measures", params, function(event) {
    recordingGpsActivityIndicator.hide();
    Ti.UI.createNotification({
        duration: 1000,
        message: "GPS accuracy measure recorded."
    }).show();
  }, function() {
    recordingGpsActivityIndicator.hide();
  });
});

/**
 * RECORD COMPASS
 */

var recordCompassButton = Titanium.UI.createButton({
  title: 'Record Compass',
  top:30,
  right: 10,
	width:120,
	height:80,
	borderRadius:1,
	font:{fontFamily:'Arial',fontSize:12}
});
win.add(recordCompassButton);
recordCompassButton.addEventListener('click', function() {
  var recordingCompassActivityIndicator = Ti.UI.createActivityIndicator({ message: "Sending measurement to server..." });
  recordingCompassActivityIndicator.show();
  if (lastCompassSpecifiedLineAngle < 0) {
    var specifiedDirectionEstimate = lastCompassSpecifiedLineAngle + 360;
  } else {
    var specifiedDirectionEstimate = lastCompassSpecifiedLineAngle;
  }
  params = {'compass_accuracy_measure[measured_direction_estimate]': lastCompassMeasuredLineAngle, 
            'compass_accuracy_measure[specified_direction_estimate]': specifiedDirectionEstimate,
            'compass_accuracy_measure[specified_against]': 'google_hybrid_map',
            'compass_accuracy_measure[device]': Ti.Platform.model};
  CogSurver.request("POST", "compass_accuracy_measures", params, function(event) {
    recordingCompassActivityIndicator.hide();
    Ti.UI.createNotification({
        duration: 1000,
        message: "Compass accuracy measure recorded."
    }).show();
  }, function() {
    recordingCompassActivityIndicator.hide();
  });
});

var compassSlider = Titanium.UI.createSlider({
  min:-180,
  max:180,
  value:0,
  height:'auto',
  top: 0
});
win.add(compassSlider);
compassSlider.addEventListener('change', function(e) {
  rotateCompassSpecifiedLine = rotateCompassSpecifiedLine.rotate((lastCompassSpecifiedLineAngle - e.value) * -1);
  compassSpecifiedLine.transform = rotateCompassSpecifiedLine;
  lastCompassSpecifiedLineAngle = e.value;
  Ti.API.info('compass slider: ' + e.value);
});