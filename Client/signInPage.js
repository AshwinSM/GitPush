// const { default: axios } = require("axios");

// const login = "https://github.com/login/oauth/authorize?client_id=c0c3936b4710adcf7f2b&scope=repo user";
const LOGINURL = "http://localhost:3000/login";

document.addEventListener('DOMContentLoaded', (event) => {
    // chrome.storage.sync.get(["gitspeedUser"], (user) => {
      // if (user && user.gitspeedUser) {
        // chrome.browserAction.setPopup({
        //   popup: "home.html",
        // });
        // window.location.href = window.location.href.replace(
        //   "login.html",
        //   "home.html"
        // );
      // }
    // });

    const signInButtonEl = document.getElementById("signInButton");
    signInButtonEl.addEventListener("click", signIn);
    
    // chrome.storage.sync.get('gitPush', (data)=> {
    //     if(data && data.access_token){
    //         axios.
    //     }
    //     console.log(data);
    // });
    
});

const signIn = async signIn => {
    window.open("https://github.com/login/oauth/authorize?client_id=c0c3936b4710adcf7f2b&scope=repo user");
};
