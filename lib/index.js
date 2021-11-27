// helper functions
function removeAllChild(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
function openInBackground(e) {
  e.preventDefault();
  const url = e.target["data-href"];
  chrome.tabs.create({ url: url, active: false });
}
function retMonthYear(date) {
  return new Date(date * 1000).toLocaleDateString("en-gb", {
    month: "short",
    year: "numeric",
  });
}
function createElement(e, num) {
  // create the parent div
  let div = document.createElement("div");
  div.className = "qLink";
  div["data-href"] = e.link;
  div.style = `--i: ${num % 5}`;
  // title para
  let par1 = document.createElement("p");
  par1.className = "qPar";
  par1.innerText = e.title;
  par1["data-href"] = e.link;
  // div to contain secondary info
  let div2 = document.createElement("div");
  div2.className = "info";
  div2["data-href"] = e.link;
  // check if answered para
  let div3 = document.createElement("div");
  div3.className = "answered";
  div3["data-href"] = e.link;
  let answeredPar = document.createElement("p");
  answeredPar.className = "answeredPar";
  answeredPar.innerText = "Answered: ";
  answeredPar["data-href"] = e.link;
  let signImg = document.createElement("img");
  signImg.className = "signImg";
  signImg["data-href"] = e.link;
  if (e.is_answered) {
    signImg.src = "../img/checked.png";
  } else {
    signImg.src = "../img/close.png";
  }
  div3.appendChild(answeredPar);
  div3.appendChild(signImg);
  // check creation date
  let createdPar = document.createElement("p");
  createdPar.className = "createdPar";
  createdPar["data-href"] = e.link;
  let date = retMonthYear(e.creation_date);
  createdPar.innerText = "Created: " + date;
  // check last activity date
  let lastActivityPar = document.createElement("p");
  lastActivityPar.className = "lastActivityPar";
  const lastActivity = retMonthYear(e.last_activity_date);
  lastActivityPar.innerText = "Last Activity: " + lastActivity;
  lastActivityPar["data-href"] = e.link;
  // append infos to div2
  div2.appendChild(div3);
  div2.appendChild(createdPar);
  div2.appendChild(lastActivityPar);
  // append all
  div.addEventListener("click", openInBackground);
  div.appendChild(par1);
  div.appendChild(div2);
  return div;
}

// todo on startup
document.getElementById("query").focus();

// search function
function searchDist(e) {
  e.preventDefault();
  let query = document.getElementById("query").value;
  if (query.length <= 0) {
    return;
  } else {
    let url = "https://stackoverflow.com/search?q=";
    query = query.split(" ").join("+");
    url = url + query;
    chrome.tabs.create({ url: url });
  }
}
// timer for typing
let typeTimer;
function waitForType(e) {
  clearTimeout(typeTimer);
  typeTimer = setTimeout(searchHelper, 1000, e);
}
// buffer vars
let bufferData = [];
let cnt = 5;
// search helper
async function searchHelper(e) {
  let respDiv = document.getElementById("response");
  let resultDiv = document.getElementById("result");
  bufferData = [];
  cnt = 5;
  removeAllChild(respDiv);
  removeAllChild(resultDiv);
  const query = e.target.value;
  if (query.length <= 0) {
    let placeHolder = document.createElement("p");
    placeHolder.id = "placeHolder";
    placeHolder.innerText = "Your results will be shown here";
    respDiv.appendChild(placeHolder);
  } else {
    removeAllChild(respDiv);
    const urlFirst =
      "https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=";
    const urlSec = "&site=stackoverflow";
    const querySplit = query.split(" ");
    const queryJoin = querySplit.join("%20");
    const fullUrl = urlFirst + queryJoin + urlSec;
    await fetch(fullUrl)
      .then((response) => response.json())
      .then((data) => {
        bufferData = data.items;
      });
    if (bufferData.length <= 0) {
      let placeHolder = document.createElement("p");
      placeHolder.id = "placeHolder";
      placeHolder.innerText = "No results found";
      respDiv.appendChild(placeHolder);
    } else {
      let resultPar = document.createElement("p");
      resultPar.id = "resultPar";
      resultPar.innerText = `${bufferData.length} questions have been found.`;
      resultDiv.appendChild(resultPar);
      for (let i = 0; i < cnt; i++) {
        const element = bufferData[i];
        let anchor = createElement(element, i);
        respDiv.appendChild(anchor);
      }
    }
  }
}
// adding event listener
// creating the delayed search function
document.getElementById("query").addEventListener("input", waitForType);
// creating the absolute search function
document.getElementById("searchBtn").addEventListener("click", searchDist);
// creating the load on scroll function
document.getElementById("response").addEventListener("scroll", function () {
  if (
    Math.round(this.scrollHeight) <=
      Math.round(this.clientHeight) + Math.round(this.scrollTop) &&
    cnt < bufferData.length
  ) {
    for (let i = cnt; i < cnt + 5; i++) {
      if (bufferData[i] === undefined) {
        break;
      }
      const element = bufferData[i];
      let anchor = createElement(element, i);
      this.appendChild(anchor);
    }
    cnt += 5;
  }
});
