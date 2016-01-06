// // content.js
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if( request.message === "clicked_browser_action" ) {
//       var firstHref = $("a[href^='http']").eq(0).attr("href");

//       console.log(firstHref);

//       // This line is new!
//       chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
//     }
//   }
// );

/*var userDataStorage;

$( "#login" ).click(function(){
  console.log("clicked login")
  var username = $(".username").val();
  var password = $(".password").val();
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
});*/
var userDataStorage = null;
var hide = false




document.addEventListener("DOMContentLoaded", function(){
  $(".wrong").hide();
  var getInfo = document.getElementById("login");
  getInfo.addEventListener("submit", function(){
    var password =  $('#password').val();
    var username = $('#username').val();
    console.log("password", password)
    console.log("username", username)

    $.ajax({
      url: "http://localhost:4000/api/users/login",
      type: "POST", 
      data: {
        "username": username, 
        "password": password
      },
      // dataType: "application/json",

      success: function(res) {
        console.log("hit success");
        console.log("login response", res);
        userDataStorage = res;
        console.log("userDataStorage", userDataStorage);
        hide = true
        if(hide) {
          $('#login').hide()
        }
      },
      error: function(err) {
        console.log("error", JSON.stringify(err));
        $('.wrong').show()
      }
    })
    event.preventDefault();
  })
});



document.addEventListener("DOMContentLoaded", function() {
  var addLinkButton = document.getElementById("addLink");
  addLinkButton.addEventListener("click", function() {
    console.log("userDataStorage inside link Post", userDataStorage)

    chrome.tabs.getSelected(null, function(tab) {

          $.ajax({
              url: "http://localhost:4000/api/links",
              type: "POST",
              data: {
                      "username": userDataStorage.fullname,  
                      "url": tab.url,                        
                      "user_id": userDataStorage.user_id 
              },

              headers: {
                "x-access-token": userDataStorage.token 
              },

              // dataType: "application/json",
              success: function(data) {
                console.log("success!")
                console.log("Link should be posted.");
                console.log(data);
                $('#addLink').hide();
                document.getElementById("done").innerHTML = '<p>Link has been added to Eureka!</p>';
              },
              error: function(data) {
                console.log(data);
              }
          });
        // }
      })

  }, false);
}, false);




