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

})

const getDirectories = async function(repo) {
  try {
    chrome.storage.sync.get(["access_token"],(data)=>{
      const res = await axios.get(GITHUBREPOCONTENTS.replace('{owner}', 'AshwinSM').replace('{repo}',repo), {
            headers: {
                Authorization: TOKEN + data.access_token
            },
      })});
      mainDirInfo = res.data;
      if(!availableDirectories[repo]){
        availableDirectories[repo] = [];
        availableDirectories[repo].push("/");
      }
      if(mainDirInfo) {
        for(var dirContent of mainDirInfo){
          if(dirContent.type === 'dir'){
              console.log(dirContent.name);
              chrome.storage.sync.get(["access_token"],(data)=>{
              const nestedRes = await axios.get(dirContent.git_url+"?recursive=1", {
                  headers: {
                    Authorization: TOKEN + data.access_token
                  },
              })});
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
      chrome.storage.sync.get(["access_token"],(data)=>{
      const res = await axios.get(GITHUBREPO, {
            headers: {
                Authorization: TOKEN + data.access_token
            },
        })});
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
  document.getElementById('commitPath').value = repoEl + ' :' + directoriesEl;
}

const changeRepo = async changeRepo => {
  const currentSelectedRepo = getValue('repos');
  console.log(currentSelectedRepo);
  await populateDirectories(currentSelectedRepo);
}

const constructOptions = (dataArr, parent, innerText) => {
  parent.innerHTML = "";
  const defOptEl = document.createElement('option');
  defOptEl.setAttribute("disabled",true);
  defOptEl.setAttribute("selected",true);
  defOptEl.innerText = "Select your "+innerText;
  parent.appendChild(defOptEl);
  for(var data of dataArr) {
      const optEl = document.createElement('option');
      optEl.innerText = data;
      parent.appendChild(optEl);
  }
}

const initSetup = async initSetup => {
  await populateRepos();
  const currentSelectedRepo = document.getElementById('repos').value;
  console.log(currentSelectedRepo);
  await populateDirectories(currentSelectedRepo);
}

const logout = () => {
  chrome.storage.sync.set({"access_token":null},(data)=>{
    console.log(data);
  });
  console.log("Logged out");
}

async function commitFile () {
  const fileName = getValue('fileName');
  const path = getValue('directories').substring(1, getValue('directories').length) +fileName;
  const repo = getValue('repos');
  const content = getValue('content');
  let existingSHA;
  if(sha[path]){
    existingSHA = sha[path];
  }
  
  try{
    const reqBody = existingSHA ?  { message : 'Commit by Git Push', content : window.btoa(content), sha : existingSHA } : { message : 'Commit by Git Push', content : window.btoa(content) };
    chrome.storage.sync.get(["access_token"],(data)=>{
    const res = await axios.put(GITHUBCOMMITFILE.replace('{owner}',owner).replace('{repo}', repo).replace('{path}',path), reqBody ,{
        headers: {
                Authorization: TOKEN + data.access_token
        },
      })
    });
    sha[path] = res.data.content.sha;

    console.log("Committed a File");
  }catch(error){
      console.log(error);
      try{
        if(error.response.status === 422 && code != 1){
          code++;
          const url = error.response.config.url;
          chrome.storage.sync.get(["access_token"],(data)=>{
          const nestedRes = await axios.get(url,{
            headers: {
              Authorization: TOKEN + data.access_token,
              // Authorization: TOKEN + 'dd15d2e37545f830da5d4969f6085980cef20767',
            },
          })});
          console.log(nestedRes);
          sha[path] = nestedRes.data.sha;debugger;
          await commitFile();
        }
      }catch(nestedError){
        console.log(nestedError);
      }
  }
}

const getValue = (id) => {
  return document.getElementById(id).value;
}

window.addEventListener('load', initSetup);