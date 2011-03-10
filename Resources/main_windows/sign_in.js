Titanium.include('../utils.js');

var win = Titanium.UI.currentWindow;

var emailTextField = Titanium.UI.createTextField({
	color:'#000',
  top:10,
	left:10,
  width:300,
	height:60,
	hintText:'E-mail',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(emailTextField);

var passwordTextField = Titanium.UI.createTextField({
	color:'#000',
  top:80,
	left:10,
  width:300,
	height:60,
	hintText:'Password',
	passwordMask:true,
  // keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
  // returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(passwordTextField);

var loginButton = Titanium.UI.createButton({
	title:'Login',
  top:150,
	width:90,
	height:55,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(loginButton);

/*
* Login Event Handling
*/
var loggingInActivityIndicator = Ti.UI.createActivityIndicator({ message: "Logging in to the server..." });
var loginReq = Titanium.Network.createHTTPClient();
loginReq.onload = function() {
  loggingInActivityIndicator.hide();
	var json = this.responseText;
	var response = JSON.parse(json);
	CurrentUser.setEmail(response[0].user.email);
	CurrentUser.setId(response[0].user.id);
	CurrentUser.setPassword(passwordTextField.value);
	CurrentUser.setName(response[0].user.first_name + " " + response[0].user.last_name);
	win.close();
	Windows.main();
};

loginReq.onerror = function(e) {
  loggingInActivityIndicator.hide();
  Ti.API.info("ERROR " + e.error);
  if (e.error == "Authorization Required") {
    alert("Check your e-mail address and your password.");
  }
  else {
   	alert(e.error); 
  }
};

/*
* Login Button Click Event
*/

loginButton.addEventListener('click',function(e) {
	if (emailTextField.value != '' && passwordTextField.value != '') {
		loginReq.open("GET","https://cogsurv.com/api/users.json");
		loginReq.setRequestHeader("Accept", "application/json");
		loginReq.setRequestHeader(
        'Authorization', 
        'Basic ' + Ti.Utils.base64encode(emailTextField.value+':'+passwordTextField.value));
		loginReq.send();
		loggingInActivityIndicator.show();
	}
	else {
		alert("Username/Password are required");
	}
});


