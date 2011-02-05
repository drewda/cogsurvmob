Ti.include('/utils/current_user.js');
Ti.include('/utils/events.js');

var CogSurver = {
  url: "https://cogsurv.com/api/",
  format: "json",
  request: function(action, url, params, onLoadFunction) {
    xhr = Ti.Network.createHTTPClient();
    xhr.onload = onLoadFunction;
    xhr.onerror = function(e)
    {
      Ti.API.info("ERROR " + e.error);
       	alert(e.error); 
    };
    xhr.open(action, CogSurver.url + url + "." + CogSurver.format);
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
  	Ti.API.fireEvent(Events.landmarksLoaded, {});
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
    Ti.API.fireEvent(Events.landmarkMarked, {});
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
    Ti.API.fireEvent(Events.landmarkVisited, {});
  }
};