var userDataStorage = null;
var loginHide = false;
var linkSentHide = false;
var logged = false;




document.addEventListener("DOMContentLoaded", function(){
  $(".wrong").hide();
  $('#addLink').hide();
  $('#done').hide();

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
        loginHide = true;
        logged = true
        if(loginHide) {
          $('#login').hide()
        }
        if(logged) {
          $('#addLink').show()
          $('#please').hide()
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
                // console.log("success!")
                // console.log("Link should be posted.");
                // console.log(data);
                $('#addLink').hide();
                linkSentHide = true;
                if(linkSentHide) {
                  $('#done').show();
                }
                // document.getElementById("done").innerHTML = '<p>Link has been added to Eureka!</p>';
              },
              error: function(data) {
                console.log(data);
              }
          });
        // }
      })

  }, false);
}, false);




