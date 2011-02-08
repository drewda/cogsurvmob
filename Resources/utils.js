/* EVENTS */
var Events = {
  landmarksLoaded: "landmarksLoaded",
  landmarkVisited: "landmarkVisited",
  landmarkMarked: "landmarkMarked"
};

/* CURRENT USER */
var CurrentUser = {
  USER_ID: "userId",
  USER_EMAIL: "userEmail",
  USER_PASSWORD: "userPassword",
  NAME: "name",
  DISTANCE_UNITS: "distanceUnits",
  setId: function(id) {
    Titanium.App.Properties.setString(CurrentUser.USER_ID, id);
  },
  getId: function() {
    return Titanium.App.Properties.getString(CurrentUser.USER_ID, "");
  },
  setEmail: function(email) {
    Titanium.App.Properties.setString(CurrentUser.USER_EMAIL, email);
  },
  getEmail: function() {
    return Titanium.App.Properties.getString(CurrentUser.USER_EMAIL, "");
  },
  setPassword: function(password) {
    Titanium.App.Properties.setString(CurrentUser.USER_PASSWORD, password);
  },
  getPassword: function() {
    return Titanium.App.Properties.getString(CurrentUser.USER_PASSWORD, "");  
  },
  setName: function(name) {
    Titanium.App.Properties.setString(CurrentUser.NAME, name);
  },
  getName: function() {
    return Titanium.App.Properties.getString(CurrentUser.NAME, "");  
  },
  setDefaultDistanceUnits: function(distanceUnits) {
    Titanium.App.Properties.setString(CurrentUser.DISTANCE_UNITS, distanceUnits);
  },
  getDefaultDistanceUnits: function() {
    return Titanium.App.Properties.getString(CurrentUser.DISTANCE_UNITS, "");
  },
  signedIn: function() {
    // if (Titanium.App.Properties.getString(CurrentUser.USER_ID, "") !== "" && Titanium.App.Properties.getString(CurrentUser.USER_PASSWORD, "") !== "") {
    if (CurrentUser.getId() !== "" && CurrentUser.getPassword() !== "") {
      return true;
    }
    else {
      return false;
    }
  },
  signOut: function() {
    CurrentUser.setId("");
    CurrentUser.setEmail("");
    CurrentUser.setPassword("");
    CurrentUser.setDefaultDistanceUnits("");
  }
};

/* WINDOWS */
var Windows = {
  signIn: function() {
    var signInWindow = Titanium.UI.createWindow({
    	title: 'Sign In',
    	url: '/main_windows/sign_in.js'
    });
    signInWindow.open();
  },
  main: function() {
    var mainWindow = Titanium.UI.createWindow({
      title: 'Cognitive Surveyor',
      url: "/main_windows/main.js",
      exitOnClose: true,
      navBarHidden: false
    });
    mainWindow.open();
  },
  selectLandmark: function() {
    var selectLandmarkWindow = Titanium.UI.createWindow({
      title: 'Select Landmark',
      url: "/main_windows/select_landmark.js",
      navBarHidden: false
    });
    selectLandmarkWindow.open();
  },
  markLandmark: function() {
    var markLandmarkWindow = Titanium.UI.createWindow({
      title: 'Mark Landmark',
      url: "/main_windows/mark_landmark.js",
      navBarHidden: false
    });
    markLandmarkWindow.open();
  },
  visitLandmark: function() {
    var visitLandmarkWindow = Titanium.UI.createWindow({
      title: 'Visit Landmark',
      url: "/main_windows/visit_landmark.js",
      navBarHidden: false
    });
    visitLandmarkWindow.open();
  },
  makeEstimate: function() {
    var makeEstimateWindow = Titanium.UI.createWindow({
      title: 'Estimate Direction and Distance',
      url: "/main_windows/make_estimate.js",
      navBarHidden: false
    });
    makeEstimateWindow.open();
  }
};

/* COGSURVER */
var CogSurver = {
  url: "https://cogsurv.com/api/",
  request: function(action, url, params, onLoadFunction, onErrorFunction, format) { // format is optional
    if (!format) {
      format = "json";
    }
    
    xhr = Ti.Network.createHTTPClient();
    xhr.onload = onLoadFunction;
    xhr.onerror = function(e)
    {
      Ti.API.info("ERROR " + e.error);
      alert(e.error); 
      onErrorFunction();
    };
    xhr.open(action, CogSurver.url + url + "." + format);
    xhr.setRequestHeader(
        'Authorization', 
        'Basic ' + Ti.Utils.base64encode(CurrentUser.getEmail()+':'+CurrentUser.getPassword()));
    return xhr.send(params);
  },
  
  /* LANDMARKS */
  loadingLandmarksActivityIndicator: Ti.UI.createActivityIndicator({ message: "Loading your landmarks from the surver..." }),
  loadLandmarks: function() {
    CogSurver.request("GET", "landmarks", {}, CogSurver.landmarksLoaded);
    CogSurver.loadingLandmarksActivityIndicator.show();
  },
  landmarksLoaded: function() {
    CogSurver.loadingLandmarksActivityIndicator.hide();
    var json = this.responseText;
  	var response = JSON.parse(json);
  	
  	// add titles for the sake of landmarksTableView
  	landmarks = [];
  	for (var i = 0, j = response.length; i < j; i++) {
      landmarks.push({title: response[i].landmark.name, landmark: response[i].landmark});
    }
  	
  	Ti.App.landmarks = landmarks;
  	Ti.App.addEventListener("landmarksLoaded", function() {
  	  alert("hi hi");
  	});
  	Ti.App.fireEvent("landmarksLoaded", {});
  },
  
  markingLandmarkActivityIndicator: Ti.UI.createActivityIndicator({ message: "Sending your new landmark to the server..." }),
  markLandmark: function(name, latitude, longitude) {
    params = {'landmark[name]': name, 
              'landmark[latitude]': latitude,
              'landmark[longitude]': longitude};
    CogSurver.request("POST", "landmarks", params, CogSurver.landmarkMarked);
    CogSurver.markingLandmarkActivityIndicator.show();
  },
  landmarkMarked: function() {
    CogSurver.markingLandmarkActivityIndicator.hide();
    Ti.App.currentLandmark = JSON.parse(this.responseText).landmark;
    Ti.App.fireEvent("landmarkMarked", {});
  },
  
  /* LANDMARK VISITS */
  recordingLandmarkVisitActivityIndicator: Ti.UI.createActivityIndicator({ message: "Recording your visit to this landmark..." }),
  visitLandmark: function(landmarkId) {
    params = {'landmark_visit[landmark_id]': landmarkId};
    CogSurver.request("POST", "landmark_visits", params, CogSurver.landmarkVisited);
    CogSurver.recordingLandmarkVisitActivityIndicator.show();
  },
  landmarkVisited: function() {
    CogSurver.recordingLandmarkVisitActivityIndicator.hide();
    Ti.App.currentLandmarkVisitId = JSON.parse(this.responseText).landmark_visit.id;
    Ti.App.fireEvent("landmarkVisited", {});
  }
};

/* MISC. FUNCTIONS */
// http://dtm.livejournal.com/38725.html
var Utils = {
  shuffle: function (list) {
    var i, j, t;
    for (i = 1; i < list.length; i++) {
      j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
      if (j != i) {
        t = list[i];                        // swap list[i] and list[j]
        list[i] = list[j];
        list[j] = t;
      }
    }
    return list;
  }
};