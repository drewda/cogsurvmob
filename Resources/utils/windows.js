var Windows = {
  signIn: function() {
    var signInWindow = Titanium.UI.createWindow({
    	title: 'Sign In',
    	url: 'main_windows/sign_in.js'
    });
    signInWindow.open();
  },
  main: function() {
    var mainWindow = Titanium.UI.createWindow({
      title: 'Cognitive Surveyor',
      url: "main_windows/main.js",
      exitOnClose: true,
      navBarHidden: false
    });
    mainWindow.open();
  },
  selectLandmark: function() {
    var selectLandmarkWindow = Titanium.UI.createWindow({
      title: 'Select Landmark',
      url: "main_windows/select_landmark.js",
      navBarHidden: false
    });
    selectLandmarkWindow.open();
  },
  markLandmark: function() {
    var markLandmarkWindow = Titanium.UI.createWindow({
      title: 'Mark Landmark',
      url: "main_windows/mark_landmark.js",
      navBarHidden: false
    });
    markLandmarkWindow.open();
  }
};