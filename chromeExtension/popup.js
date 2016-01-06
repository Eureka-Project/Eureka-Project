
var userDataStorage;

$( "#login" ).submit(function( event ) {
  var username = $(".username").val();
  var password = $(".password").val();
  console.log("something for chrissake");
  var loginRequest = {};
  loginRequest.username = username;
  loginRequest.password = password;
  console.log("loginRequest:\n", loginRequest);

  $.ajax({
    url: "localhost:3000/api/users/login",
    type: "POST",
    data: {
            "username": username,
            "password": password
    },
    dataType: "application/json",
    success: function(res) {
      console.log("login response:", res);
      userDataStorage = JSON.parse(res);
      console.log("userDataStorage:", userDataStorage);
    },
    error: function(err) {
      console.log(err);
    }
  });
});

document.addEventListener("DOMContentLoaded", function() {
  var addLinkButton = document.getElementById("addLink");
  addLinkButton.addEventListener("click", function() {

    chrome.tabs.getSelected(null, function(tab) {   //using instead of chrome.tabs.getSelected

      // var form = document.createElement('form');
      // form.action = 'localhost:3000/api/links';
      // form.method = 'post';
      // var input = document.createElement('input');
      // input.type = 'hidden';
      // input.name = 'url';
      // input.value = tab.url;
      // form.appendChild(i);
      // document.body.appendChild(form);
      // form.submit();

      // $("#addLink").submit(function( event ) {
      //   //handle link adding here
      //   function() {
          $.ajax({
              url: "localhost:3000/api/links",
              type: "POST",
              data: {
                      "username": userDataStorage.fullname,  //?????
                      "url": tab.url,                        //?????
                      "user_id": userDataStorage.user_id     //?????
              },
              dataType: "application/json",
              success: function(data) {
                console.log("Link should be posted.");
                console.log(data);
              },
              error: function(data) {
                console.log(data);
              }
          });
        // }
      })


  }, false);
}, false);


