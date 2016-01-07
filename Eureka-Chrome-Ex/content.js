

document.addEventListener("DOMContentLoaded", function(){


    $(".wrong").hide();
    $("#addLink").hide();
    $("#done").hide();

    if(background) {
            $("#login").hide();
            $("#addLink").show();
            $("#please").hide();
    }
    var getInfo = document.getElementById("login");
    getInfo.addEventListener("submit", function(){
      var password =  $('#password').val();
      var username = $('#username').val();

        $.ajax({
          url: "http://localhost:4000/api/users/login",
          type: "POST", 
          data: {
            "username": username, 
            "password": password
          },

          success: function(res) {
            chrome.storage.sync.set({"userData": res}, function() {
              console.log("Settings saved");
            });
          
            background = true;
            $("#login").hide();
            $("#addLink").show();
            $("#please").hide();
          },
          error: function(err) {
            console.log("error", JSON.stringify(err));
            $(".wrong").show()
          }
      })
      event.preventDefault();
    })



// document.addEventListener("DOMContentLoaded", function() {
  var addLinkButton = document.getElementById("addLink");
  var linkSentHide = false;
  addLinkButton.addEventListener("click", function() {

    chrome.tabs.getSelected(null, function(tab) {
      
      chrome.storage.sync.get("userData", function(data) {
        
        $.ajax({
            url: "http://localhost:4000/api/links",
            type: "POST",
            data: {
                    "username": data.userData.fullname,
                    "url": tab.url,
                    "user_id": data.userData.user_id
            },
            headers: {
              "x-access-token": data.userData.token
            },
            success: function(res) {
              $("#addLink").hide();
              linkSentHide = true;
              $("#done").show();
            },
            error: function(err) {
              console.log(err);
            }
        });
      });
    })
  }, false);
// }, false);
}, false);




