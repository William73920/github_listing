let resultsPerPage = 10;
let currentPage = 1;
const loader = document.querySelector(".loader");

function updateResultsPerPage() {
  const selectElement = document.getElementById("quantitySelect");
  resultsPerPage = parseInt(selectElement.value, 10);
}

document
  .getElementById("usernameInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      currentPage = 1;
      fetchRepositories();
    }
  });

document.querySelector(".submit").addEventListener("click", function (e) {
  currentPage = 1;
  fetchRepositories();
});

async function fetchRepositories() {
  loader.style.display = "block";
  const username = document.getElementById("usernameInput").value;
  const apiUrl = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${resultsPerPage}`;
  const profileUrl = `https://api.github.com/users/${username}`;

  try {
    const response = await fetch(apiUrl);
    const profile = await fetch(profileUrl);
    const profileDetails = await profile.json();
    const repositories = await response.json();
    const profileContainer = document.querySelector(".profile_container");
    const repositoryContainer = document.querySelector("#repositoryList");
    const error = document.querySelector(".error");
    const paginationContainer = document.getElementById("pagination");

    if (profileDetails?.message === "Not Found") {
      error.innerText = "Not a valid github username";
      error.style.display = "block";

      profileContainer.style.display = "none";
      repositoryContainer.style.display = "none";
      paginationContainer.style.display = "none";
    } else {
      profileContainer.style.display = "block";
      repositoryContainer.style.display = "flex";
      paginationContainer.style.display = "flex";
      error.style.display = "none";

      displayProfile(profileDetails);

      displayRepositories(repositories);
      displayPagination(profileDetails.public_repos);
    }
    loader.style.display = "none";
  } catch (error) {
    console.log(error);
    loader.style.display = "none";
  }
}

function displayProfile(profileDetails) {
  const avatar = document.querySelector(".profile_avatar");
  const name = document.querySelector(".profile_name");
  const public_repos = document.querySelector(".public_repos");
  const followers = document.querySelector(".followers");

  if (profileDetails) {
    avatar.src = profileDetails.avatar_url;
    name.innerHTML = profileDetails.login || profileDetails.name;
    public_repos.innerHTML = `Public-Repos: <span>${profileDetails.public_repos}</span>`;
    followers.innerHTML = `Followers: <span>${profileDetails.followers}</span>`;
  } else {
    console.error("Unable to update avatar.src. Check your data structure.");
  }
}

function displayRepositories(repositories) {
  const repositoryList = document.getElementById("repositoryList");
  repositoryList.innerHTML = "";

  repositories.forEach((repo) => {
    const tags = repo.topics;
    const listItem = document.createElement("div");
    const link = document.createElement("a");
    const desc = document.createElement("div");
    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("tags_container");

    if (tags?.length === 0) {
      const listTag = document.createElement("p");

      listTag.innerHTML = "No topics mentioned";
      tagsContainer.appendChild(listTag);
    } else {
      tags?.forEach((tag) => {
        const listTag = document.createElement("div");

        listTag.innerHTML = tag;
        tagsContainer.appendChild(listTag);
      });
    }

    listItem.classList.add("repo_card");
    desc.classList.add("repo_desc");
    desc.innerHTML = repo.description;
    link.innerHTML = repo.name;
    link.href = repo.html_url;
    listItem.appendChild(link);
    listItem.appendChild(desc);
    listItem.appendChild(tagsContainer);

    repositoryList.appendChild(listItem);
  });
}

function displayPagination(profileDetails) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button_container");

  const totalPages = Math.ceil(profileDetails / resultsPerPage);

  const maxButtonsToShow = 5; // number of buttons to show
  const halfMaxButtonsToShow = Math.floor(maxButtonsToShow / 2);

  let startPage = Math.max(1, currentPage - halfMaxButtonsToShow);
  let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

  if (totalPages - endPage < halfMaxButtonsToShow) {
    startPage = Math.max(1, totalPages - maxButtonsToShow + 1);
  }

  const nextPageButton = document.createElement("button");
  nextPageButton.textContent = "Next Page";
  nextPageButton.disabled = currentPage + 1 > totalPages;
  nextPageButton.addEventListener("click", () => {
    currentPage++;
    fetchRepositories();
  });

  if (startPage > 1) {
    const firstPageButton = document.createElement("button");
    firstPageButton.innerText = "1";
    firstPageButton.addEventListener("click", () => {
      currentPage = 1;
      fetchRepositories();
    });
    buttonContainer.appendChild(firstPageButton);

    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.innerText = "...";
      buttonContainer.appendChild(ellipsis);
    }
  }

  for (let index = startPage; index <= endPage; index++) {
    const button = document.createElement("button");
    button.innerText = index;

    if (index === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentPage = index;
      fetchRepositories();
    });

    buttonContainer.appendChild(button);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.innerText = "...";
      buttonContainer.appendChild(ellipsis);
    }

    const lastPageButton = document.createElement("button");
    lastPageButton.innerText = totalPages;
    lastPageButton.addEventListener("click", () => {
      currentPage = totalPages;
      fetchRepositories();
    });
    buttonContainer.appendChild(lastPageButton);
  }

  const prevPageButton = document.createElement("button");
  prevPageButton.textContent = "Previous Page";
  prevPageButton.disabled = currentPage - 1 < 1;
  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchRepositories();
    }
  });

  paginationContainer.appendChild(prevPageButton);
  paginationContainer.appendChild(buttonContainer);
  paginationContainer.appendChild(nextPageButton);
}
