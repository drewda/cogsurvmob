var CurrentUser = {
  USER_ID: "userId",
  USER_EMAIL: "userEmail",
  USER_PASSWORD: "userPassword",
  NAME: "name",
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
  }
};