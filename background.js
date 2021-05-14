chrome.browserAction.onClicked.addListener(function() {
  chrome.storage.sync.get(["access_token"],(data)=>{
    console.log(data.access_token);
    if(data.access_token && data.access_token !== null) {
      chrome.browserAction.setPopup({popup: 'Client/homePage.html'});
    }else{
      chrome.browserAction.setPopup({popup: 'Client/signInPage.html'});
    }
  });
});

chrome.runtime.onMessage.addListener((req, sender, callback) => {
  if (req.type == "fetch-token") {
    const code = req.params.code;
    if (code) {
      axios.get("http://localhost:3000/getToken?code="+code)
          .then((resp) => {
            const access_token = resp.data;
            console.log(access_token);
            chrome.storage.sync.set({"access_token": access_token}, () => {
                  console.log("Access : "+access_token);
            });
            // chrome.storage.sync.get(["access_token"],(data)=>{
            //   alert("Data : "+data);
            // });
          window.location.href="http://localhost:3000/home";
          })
          .catch((error) => {
            console.log(error.response.data);
          });
    }
  }
});