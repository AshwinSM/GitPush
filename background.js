let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.storage.sync.get(["access_token"],(data)=>{
    alert("Access Token : "+data.access_token);
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
      alert("Inside Fetch-Token");
      // axios.post(`http://localhost:3000/getToken`, null, { params: {
      //   code
      // }})
      // axios.post("http://localhost:3000/getToken",{ code : code })
      axios.get("http://localhost:3000/getToken?code="+code)
          .then((resp) => {
            const access_token = resp.data;
            console.log(access_token);
            chrome.storage.sync.set({"access_token": access_token}, () => {
                  console.log("Access : "+access_token);
            });
            chrome.storage.sync.get(["access_token"],(data)=>{
              alert("Data : "+data);
            });
            alert("Got Token  : "+access_token);
          window.location.href="http://localhost:3000/home";
          })
          .catch((error) => {
            console.log(error.response.data);
          });
    }
    // callback();
  }
});


// chrome.storage.sync.set({"gitspeedUser": user}, () => {
//   chrome.storage.sync.get(['gitspeedData'], (data) => {
//       if(!data.gitspeedData) {
//           chrome.storage.sync.set({
//               'gitspeedData': {
//                   collection: [],
//                   commits: new Map()
//               }
//           });
//       }
//   })
// });