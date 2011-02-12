Titanium.include('../utils.js');

Titanium.UI.setBackgroundColor('#fff');

var win = Titanium.UI.currentWindow;

/* CALIBRATION ALERT */
if (Ti.App.currentEstimateTargetIndex == 0) {
  alert('Wave the phone around in a figure 8. This resets the compass.');
}

/* COMPASS */
var trueHeading;

if (Titanium.Geolocation.hasCompass) {
  Titanium.Geolocation.showCalibration = true;
  Titanium.Geolocation.headingFilter = 1;

  Ti.Geolocation.getCurrentHeading(function(e) {
    if (e.error) {
      currentHeading.text = 'error: ' + e.error;
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
      Titanium.API.info("error: " + e.error);
      return;
    }

    var x = e.heading.x;
    var y = e.heading.y;
    var z = e.heading.z;
    var magneticHeading = e.heading.magneticHeading;
    var accuracy = e.heading.accuracy;
    trueHeading = e.heading.trueHeading % 360;
    var timestamp = e.heading.timestamp;

    Titanium.API.info('geo - heading updated: ' + trueHeading);
  };
  Titanium.Geolocation.addEventListener('heading', headingChange);
}
else {
  Ti.UI.createAlertDialog({title:'No Compass', message:'This is a problem. Your device does not have a compass.'}).show();
}

/* NORTH ESTIMATE (which is always the last estimate to make) */
var northEstimate = Ti.UI.createAlertDialog({
  title:'Point to North', 
  message:'Please finish by estimating the direction toward north. Point with the phone,',
  buttonNames: ["Record"]
});
northEstimate.addEventListener('click', function(event) {
  if (event.index == 0) {
    var recordingEstimateIndicator = Ti.UI.createActivityIndicator({ message: "Sending your north estimate to the server..." });
    recordingEstimateIndicator.show();
    params = {'direction_distance_estimate[landmark_visit_id]': Ti.App.currentLandmarkVisitId, 
              'direction_distance_estimate[start_landmark_id]': Ti.App.currentLandmark.id, 
              'direction_distance_estimate[kind]': 'landmarkToNorth',
              'direction_distance_estimate[direction_estimate]': trueHeading};
    CogSurver.request("POST", "direction_distance_estimates", params, function(event) {
      recordingEstimateIndicator.hide();
      Titanium.Geolocation.removeEventListener('heading', headingChange);
      win.close();
      Ti.UI.createNotification({
          duration: 3000,
          message: "You are done doing estimates at " + Ti.App.currentLandmark.name
      }).show();
    }, function() {
      recordingEstimateIndicator.hide();
    });
  }
});

// if this is the first landmark being marked, skip to north estimate
if (Ti.App.estimateTargets.length == 0) {
  northEstimate.show();
}
// otherwise, we'll actually go and draw the whole screen
else {
  var verticalView = Titanium.UI.createView({
    height:'auto', 
    layout:'vertical', 
    backgroundColor:'#000'
  });

  var currentLocationLabel = Titanium.UI.createLabel({
    text: 'You are currently at: ' + Titanium.App.currentLandmark.name,
    left: 10,
    right: 10,
    width: 300,
    textAlign: 'center',
  	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:16}
  });
  verticalView.add(currentLocationLabel);

  var instructions1Label = Titanium.UI.createLabel({
    text: 'Estimate the straight-line distance and direction to: ',
    top: 10,
    left: 10,
    right: 10,
    width: 300,
    textAlign: 'center',
  	font:{fontFamily:'Arial',fontSize:16}
  });
  verticalView.add(instructions1Label);

  var targetLandmarkLabel = Titanium.UI.createLabel({
    text: Ti.App.estimateTargets[Ti.App.currentEstimateTargetIndex].targetLandmark.name,
    left: 10,
    right: 10,
    width: 300,
    textAlign: 'center',
  	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
  });
  verticalView.add(targetLandmarkLabel);

  var instructions2Label = Titanium.UI.createLabel({
    text: 'Use the +/- buttons to enter distance.',
    top: 20,
    left: 10,
    right: 10,
    width: 300,
    textAlign: 'center',
  	font:{fontFamily:'Arial',fontSize:14}
  });
  verticalView.add(instructions2Label);

  /* DISTANCE ENTRY */
  var distanceNumberTextField = Ti.UI.createTextField({
  	color:'#000',
    top:10,
  	left:10,
    width:100,
    // height:60,
  	value:0,
  	editable:false,
  	borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED
  });

  var distanceAddButtonsView = Titanium.UI.createView({
    height:'50', 
    width:'auto'
    // layout:'horizontal' // https://appcelerator.lighthouseapp.com/projects/32238/tickets/1225-horizontal-layout-doesnt-work-in-android
  });
  // var distanceAddLabel = Ti.UI.createLabel({
  //   text: "+",
  //   height: 50,
  //   left: 10,
  //   font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
  // });
  // distanceAddButtonsView.add(distanceAddLabel);
  var distanceAddHundredButton = Ti.UI.createButton({
    title: "+ 100",
    left: 30,
    height: 50,
    width: 60
  });
  distanceAddButtonsView.add(distanceAddHundredButton);
  distanceAddHundredButton.addEventListener('click', function(event) {
    distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) + 100);
  });
  var distanceAddTenButton = Ti.UI.createButton({
    title: "+ 10",
    left: 90,
    height: 50,
    width: 60
  });
  distanceAddButtonsView.add(distanceAddTenButton);
  distanceAddTenButton.addEventListener('click', function(event) {
    distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) + 10);
  });
  var distanceAddOneButton = Ti.UI.createButton({
    title: "+ 1",
    left: 150,
    height: 50,
    width: 60
  });
  distanceAddButtonsView.add(distanceAddOneButton);
  distanceAddOneButton.addEventListener('click', function(event) {
    distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) + 1);
  });
  var distanceAddTenthButton = Ti.UI.createButton({
    title: "+ 0.1",
    left: 210,
    height: 50,
    width: 60
  });
  distanceAddButtonsView.add(distanceAddTenthButton);
  distanceAddTenthButton.addEventListener('click', function(event) {
    distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) + 0.1);
  });
  verticalView.add(distanceAddButtonsView);

  var distanceNumberView = Titanium.UI.createView({
    height:'60', 
    left:30,
    width:'auto'
  });

  distanceNumberView.add(distanceNumberTextField);

  var distanceUnitsPicker = Ti.UI.createPicker({
    right: 10
  });
  var distanceUnitsColumn = Ti.UI.createPickerColumn();
  distanceUnitsColumn.addRow(Ti.UI.createPickerRow({title:'miles'}));
  distanceUnitsColumn.addRow(Ti.UI.createPickerRow({title:'kilometers'}));
  distanceUnitsColumn.addRow(Ti.UI.createPickerRow({title:'meters'}));
  distanceUnitsColumn.addRow(Ti.UI.createPickerRow({title:'feet'}));
  distanceUnitsPicker.add(distanceUnitsColumn);
  distanceUnitsPicker.selectionIndicator = true;
  distanceNumberView.add(distanceUnitsPicker);
  switch (CurrentUser.getDefaultDistanceUnits()) {
    case "miles":
      distanceUnitsPicker.setSelectedRow(0, 0, true);
      break;
    case "kilometers": 
      distanceUnitsPicker.setSelectedRow(0, 1, true);
      break;
    case "meters": 
      distanceUnitsPicker.setSelectedRow(0, 2, true);
      break;
    case "feet": 
      distanceUnitsPicker.setSelectedRow(0, 3, true);
      break;
  }
  distanceUnitsPicker.addEventListener('change', function(event) {
    CurrentUser.setDefaultDistanceUnits(event.row.title);
  });

  verticalView.add(distanceNumberView);

  var distanceSubtractButtonsView = Titanium.UI.createView({
    height:'50', 
    width:'auto'
  });
  // var distanceSubtractLabel = Ti.UI.createLabel({
  //   text: "-",
  //   height: 50,
  //   left: 10,
  //   font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
  // });
  // distanceSubtractButtonsView.add(distanceSubtractLabel);
  var distanceSubtractHundredButton = Ti.UI.createButton({
    title: "- 100",
    left: 30,
    height: 50,
    width: 60
  });
  distanceSubtractButtonsView.add(distanceSubtractHundredButton);
  distanceSubtractHundredButton.addEventListener('click', function(event) {
    if (parseFloat(distanceNumberTextField.value) > 100) {
      distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) - 100);
    }
    else {
      distanceNumberTextField.value = "0.0";
    }
  });
  var distanceSubtractTenButton = Ti.UI.createButton({
    title: "- 10",
    left: 90,
    height: 50,
    width: 60
  });
  distanceSubtractButtonsView.add(distanceSubtractTenButton);
  distanceSubtractTenButton.addEventListener('click', function(event) {
    if (parseFloat(distanceNumberTextField.value) > 10) {
      distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) - 10);
    }
    else {
      distanceNumberTextField.value = "0.0";
    }
  });
  var distanceSubtractOneButton = Ti.UI.createButton({
    title: "- 1",
    left: 150,
    height: 50,
    width: 60
  });
  distanceSubtractButtonsView.add(distanceSubtractOneButton);
  distanceSubtractOneButton.addEventListener('click', function(event) {
    if (parseFloat(distanceNumberTextField.value) > 1) {
      distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) - 1);
    }
    else {
      distanceNumberTextField.value = "0.0";
    }
  });
  var distanceSubtractTenthButton = Ti.UI.createButton({
    title: "- 0.1",
    left: 210,
    height: 50,
    width: 60
  });
  distanceSubtractButtonsView.add(distanceSubtractTenthButton);
  distanceSubtractTenthButton.addEventListener('click', function(event) {
    if (parseFloat(distanceNumberTextField.value) > 0.1) {
      distanceNumberTextField.value = String(parseFloat(distanceNumberTextField.value) - 0.1);
    }
    else {
      distanceNumberTextField.value = "0.0";
    }
  });
  verticalView.add(distanceSubtractButtonsView);

  var instructions3Label = Titanium.UI.createLabel({
    text: 'Estimate the direction by pointing your phone.',
    top: 50,
    left: 10,
    right: 10,
    width: 300,
    textAlign: 'center',
  	font:{fontFamily:'Arial',fontSize:14}
  });
  verticalView.add(instructions3Label);

  /* RECORD ESTIMATE */
  var recordEstimateButton = Ti.UI.createButton({
    title: "I'm Pointing. Record My Estimate Now.",
  	width:300,
  	height:70,
  	borderRadius:1,
  	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:22}
  });
  verticalView.add(recordEstimateButton);
  recordEstimateButton.addEventListener('click', function(event) {
    if (distanceNumberTextField.value == 0) {
      Ti.UI.createAlertDialog({
        message:'Please enter a distance estimate greater than zero.',
        buttonNames: ["OK"]
      }).show();
    }
    else {
      var recordingEstimateIndicator = Ti.UI.createActivityIndicator({ message: "Sending your estimate to the server..." });
      recordingEstimateIndicator.show();
      params = {'direction_distance_estimate[landmark_visit_id]': Ti.App.currentLandmarkVisitId, 
                'direction_distance_estimate[start_landmark_id]': Ti.App.currentLandmark.id, 
                'direction_distance_estimate[target_landmark_id]': Ti.App.estimateTargets[Ti.App.currentEstimateTargetIndex].targetLandmark.id,
                'direction_distance_estimate[kind]': 'landmarkToLandmark',
                'direction_distance_estimate[direction_estimate]': trueHeading,
                'direction_distance_estimate[distance_estimate]': distanceNumberTextField.value,
                'direction_distance_estimate[distance_estimate_units]': distanceUnitsPicker.getSelectedRow(0).title};
      CogSurver.request("POST", "direction_distance_estimates", params, function(event) {
        recordingEstimateIndicator.hide();
        // Titanium.Geolocation.removeEventListener('location');
        var lastEstimateTargetIndex = Ti.App.estimateTargets.length - 1;
        Ti.API.info('Ti.App.currentEstimateTargetIndex: ' + Ti.App.currentEstimateTargetIndex);
        Ti.API.info('Ti.App.estimateTargets.length: ' + Ti.App.estimateTargets.length);
        if (Ti.App.currentEstimateTargetIndex < lastEstimateTargetIndex) {
          Ti.App.currentEstimateTargetIndex = Ti.App.currentEstimateTargetIndex + 1;
          Titanium.Geolocation.removeEventListener('heading', headingChange);
          Windows.makeEstimate();
          Ti.UI.createNotification({
              duration: 3000,
              message: "Great guess! Can you make an estimate to your next landmark? (If not, open the menu to skip.)"
          }).show();
          win.close();
        }
        else {
          northEstimate.show();
        }
      }, function() {
        recordingEstimateIndicator.hide();
      });
    }
  });

  win.add(verticalView);

  /* MENU */
  if (Ti.Platform.name == 'android') {
    win.activity.onCreateOptionsMenu = function(e) {
    	var menu = e.menu;
	
    	var skipOption = menu.add({ title : 'Skip the Rest of the Estimates' });
    	skipOption.addEventListener('click', function(e) {
    	  northEstimate.show();
    	});
    };
  }
}