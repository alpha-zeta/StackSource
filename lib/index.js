document.getElementById("query").focus();
function search() {
  const query = document.getElementById("query").value;
  const url = "https://stackoverflow.com/search?q=";
  const querySplit = query.split(" ");
  const queryJoin = querySplit.join("+");
  const fullUrl = url + queryJoin;
  window.open(fullUrl, "_blank").focus();
}

document.getElementById("searchBtn").addEventListener("click", search);
