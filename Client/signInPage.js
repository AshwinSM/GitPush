const signIn = async signIn => {
    window.open("https://github.com/login/oauth/authorize?client_id=c0c3936b4710adcf7f2b&scope=repo user");
};

document.addEventListener('DOMContentLoaded', (event) => {
    chrome.storage.sync.get("access_token", (data) => {
      if (data && data.access_token) {
        chrome.browserAction.setPopup({
          popup: "Client/homePage.html",
        }); 
        var newUrl = window.location.href.replace("signInPage.html","homePage.html");
        window.location.href = newUrl;
      }
    });

    const signInButtonEl = document.getElementById("signInButton");
    signInButtonEl.addEventListener("click", signIn);
});



