let owner = 'AshwinSM';

//GitHub Url
const GITHUBREPO = 'https://api.github.com/user/repos';
const GITHUBREPOCONTENTS = 'https://api.github.com/repos/{owner}/{repo}/contents';
const GITHUBCOMMITFILE =  'https://api.github.com/repos/{owner}/{repo}/contents/{path}';

//Other Variables
const TOKEN = 'token ';
let availableRepos = [];
let availableDirectories = {};
let mainDirInfo = {};
let sha = {};
let code=0;

document.addEventListener('DOMContentLoaded', (event) => {
  const commitBtnEl = document.getElementById("commitBtn");
  commitBtnEl.addEventListener("click", commitFile);

  const logoutBtn = document.getElementById("logout");
  logoutBtn.addEventListener("click", logout);

  const repoEl = document.getElementById("repos");
  repoEl.addEventListener("change", changeRepo);

  const dirEl = document.getElementById("directories");
  dirEl.addEventListener("change", populateCommitPath);

  initSetup();
})

const getDirectories = async function(repo) {
  try {
    let access_token = await getAccessToken();
    const res = await axios.get(GITHUBREPOCONTENTS.replace('{owner}', 'AshwinSM').replace('{repo}',repo), {
            headers: {
                Authorization: TOKEN + access_token
            },
      });
      console.log("After Getting Repo");
      mainDirInfo = res.data;
      console.log("Main Dir Info : "+mainDirInfo);
      if(!availableDirectories[repo]){
        availableDirectories[repo] = [];
        availableDirectories[repo].push("/");
      }
      if(mainDirInfo) {
        for(var dirContent of mainDirInfo){
          if(dirContent.type === 'dir'){
              const nestedRes = await axios.get(dirContent.git_url+"?recursive=1", {
                  headers: {
                    Authorization: TOKEN + access_token
                  },
              });
              const allDirectories = nestedRes.data.tree;
              allDirectories.forEach(function(subDir){
                if(subDir.type === 'tree')
                  availableDirectories[repo].push("/"+dirContent.path+"/"+subDir.path);
              }); 
              console.log(availableDirectories);
            }
        }
      }
        
      console.log(`Added a new Todo!`, mainDirInfo);
      // return mainDirInfo;
  }catch (e) {
      console.error(e);
  }
} 

const getRepos = async getRepos => {
    try {
      let access_token = await getAccessToken();
      // await chrome.storage.sync.get("access_token", function (value) {
      //   access_token = value.access_token;
      //   console.log(value.access_token);
      // });

      console.log(access_token);
      const res = await axios.get(GITHUBREPO, {
            headers: {
                Authorization: TOKEN + access_token
            },
        });
      const allRepInfo = res.data;
      allRepInfo.forEach(function(repoInfo){
        if(repoInfo.permissions.admin === true){
          availableRepos.push(repoInfo.name);
        }
      }) 

      console.log(`Added a new Todo!`, allRepInfo);

      return availableRepos;
    } catch (e) {
      console.error(e);
    }
};

const populateRepos = async populateRepos => {
  availableRepos = await getRepos();
  const selectRepoEl = document.getElementById('repos');
  constructOptions(availableRepos, selectRepoEl, "Repo");
}

const populateDirectories = async function(currentRepo) {
  if(!availableDirectories[currentRepo]){
    await getDirectories(currentRepo);
  }
  const selectDirEl = document.getElementById('directories');
  constructOptions(availableDirectories[currentRepo], selectDirEl, "Directory");
  populateCommitPath();
}

const populateCommitPath = () => {
  const repoEl = document.getElementById('repos').value;
  const directoriesEl = document.getElementById('directories').value;
  const pathEl = document.getElementById('commitPath');
  const pathValue = repoEl + ' :' + directoriesEl;
  pathEl.value = pathValue;
  pathEl.setAttribute("tip", pathValue);
  pathEl
}

const changeRepo = async changeRepo => {
  const currentSelectedRepo = getValue('repos');
  await populateDirectories(currentSelectedRepo);
}

const constructOptions = (dataArr, parent, innerText) => {
  parent.innerHTML = "";
  // const defOptEl = document.createElement('option');
  // defOptEl.setAttribute("disabled",true);
  // defOptEl.setAttribute("selected",true);
  // defOptEl.innerText = "Select your "+innerText;
  // parent.appendChild(defOptEl);
  console.log(dataArr);
  for(var data of dataArr) {
      const optEl = document.createElement('option');
      optEl.innerText = data;
      parent.appendChild(optEl);
  }
}

const initSetup = async initSetup => {
  await populateRepos();
  const currentSelectedRepo = document.getElementById('repos').value;
  await populateDirectories(currentSelectedRepo);
}

const logout = () => {
  chrome.storage.sync.remove("access_token",()=>{
    chrome.browserAction.setPopup({
      popup: "Client/signInPage.html",
    });
    window.location.href = window.location.href.replace("homePage.html", "signInPage.html");
  });
  console.log("Logged out");
}

async function commitFile (e) {
  if(e){
  e.preventDefault();
  }
  const fileName = getValue('fileName');
  const path = getValue('directories').substring(1, getValue('directories').length) +fileName;
  const repo = getValue('repos');
  const content = getValue('content');
  let existingSHA;
  if(sha[path]){
    existingSHA = sha[path];
  }
  
  try{
    let access_token = await getAccessToken();
    console.log(access_token);
    const reqBody = existingSHA ?  { message : 'Commit by Git Push', content : window.btoa(content), sha : existingSHA } : { message : 'Commit by Git Push', content : window.btoa(content) };
    const res = await axios.put(GITHUBCOMMITFILE.replace('{owner}',owner).replace('{repo}', repo).replace('{path}',path), reqBody ,{
        headers: {
                Authorization: TOKEN + access_token
        },
    });
    sha[path] = res.data.content.sha;
    res.status === 200 || res.status === 201 ? notifyMessage(true) : notifyMessage(false);
    console.log("Committed a File");
  }catch(error){
      console.log(error);
      try{
        if(error.response.status === 422 && code != 1){
          code++;
          let access_token = await getAccessToken();
          const url = error.response.config.url;
          const nestedRes = await axios.get(url,{
            headers: {
              Authorization: TOKEN + access_token
            },
          });
          console.log(nestedRes);
          sha[path] = nestedRes.data.sha;debugger;
          await commitFile();
        }
      }catch(nestedError){
        console.log(nestedError);
      }
  }
}

async function getAccessToken() {
  var p = new Promise(function(resolve, reject){
      chrome.storage.sync.get("access_token", function(options){
          resolve(options.access_token);
      })
  });

  const configOut = await p;
  console.log(configOut);
  return configOut;
}

const getValue = (id) => {
  return document.getElementById(id).value;
}

const notifyMessage = (isSuccess) => {
  const divClassName = isSuccess ? "ui positive message" : "ui negative message";
  const displayMsg = isSuccess ? "Committed Successfully" : "Error in Commit";
  const divEl1 = document.createElement("div");
  divEl1.className = divClassName;
  
  const iEl2 = document.createElement("i");
  iEl2.className = "close icon";
  divEl1.appendChild(iEl2);
  const divEl3 = document.createElement("div");
  divEl3.className = "header";
  divEl3.innerText = displayMsg;
  iEl2.appendChild(divEl3);
  const msgEl = document.getElementById("message");
  msgEl.appendChild(divEl1);
}