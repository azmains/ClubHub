// This code will run when the page is loaded
window.addEventListener('DOMContentLoaded', function () {
    var runningxhr = new XMLHttpRequest();
    runningxhr.open('GET', 'users/adminRunning', true);
    runningxhr.onreadystatechange = function () {
      if (runningxhr.readyState === 4) {
        if (runningxhr.status === 401) {
          window.location.href = '../AccessDenied.html';
        }
      }
    };
    runningxhr.send();
  });

  // Function to delete a club
  function deleteClub(clubName, btnsDiv) {
    var deleteXhr = new XMLHttpRequest();
    deleteXhr.open('DELETE', 'users/deleteclubs/' + encodeURIComponent(clubName), true);
    deleteXhr.onreadystatechange = function () {
      if (deleteXhr.readyState === 4) {
        if (deleteXhr.status === 200) {
          btnsDiv.remove();
        }
      }
    };
    deleteXhr.send();
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'users/clubs', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        var clubList = document.querySelector('#availbleClubs');

        if (!clubList) {
          return;
        }

        clubList.innerHTML = '';

        // Loop through the club data and create clubs
        data.clubs.forEach(function (club) {
          var clubButton = document.createElement('button');
          clubButton.classList.add('btn');
          clubButton.textContent = club.Name;

          var deleteButton = document.createElement('button');
          deleteButton.classList.add('delete');
          deleteButton.textContent = 'delete';

          var btnsDiv = document.createElement('div');
          btnsDiv.classList.add('btns');
          btnsDiv.appendChild(clubButton);
          btnsDiv.appendChild(deleteButton);

          clubButton.addEventListener('click', function () {
            var clubName = encodeURIComponent(club.Name);
            window.location.href = `FrontPage.html?clubName=${clubName}`;
          });

          // Attach event listener for delete button
          deleteButton.addEventListener('click', function () {
            deleteClub(club.Name, btnsDiv);
          });

          clubList.appendChild(btnsDiv);
        });
      }
    }
  };
  xhr.send();

  // needs to be able to make a new club home page and save it in db
  function openCreateClubMenu() {
    var main = document.getElementsByClassName('main')[0];
    var popup = document.getElementsByClassName('popup')[0];
    var createClubButton = popup.getElementsByClassName('createClub')[0];
    var clubNameInput = popup.getElementsByTagName('input')[0];
    var availbleClubs = document.getElementById('availbleClubs');
    var clubName;

    main.style.display = 'none';
    popup.style.display = 'block';

    createClubButton.addEventListener('click', function () {
      clubName = clubNameInput.value;

      if (clubName) {
        var newClub = {
          Name: clubName
        };

        // Send a POST request to the server to add the new club to the database
        xhr = new XMLHttpRequest();
        xhr.open('POST', 'users/makeclubs', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);
              if (data.success) {
                var btnsDiv = document.createElement('div');
                btnsDiv.classList.add('btns');

                var clubButton = document.createElement('button');
                clubButton.classList.add('btn');
                clubButton.textContent = clubName;

                var deleteButton = document.createElement('button');
                deleteButton.classList.add('delete');
                deleteButton.textContent = 'delete';

                btnsDiv.appendChild(clubButton);
                btnsDiv.appendChild(deleteButton);

                clubButton.addEventListener('click', function () {
                  window.location.href = `FrontPage.html?clubName=${encodeURIComponent(clubName)}`;
                });

                availbleClubs.appendChild(btnsDiv);

                // Delete club from the database
                deleteButton.addEventListener('click', function () {
                  var deleteXhr = new XMLHttpRequest();
                  deleteXhr.open('DELETE', 'users/deleteclubs/' + encodeURIComponent(clubName), true);
                  deleteXhr.onreadystatechange = function () {
                    if (deleteXhr.readyState === 4 && deleteXhr.status === 200) {
                      btnsDiv.remove();
                    }
                  };
                  deleteXhr.send();
                });
              }
            }
          }
        };
        xhr.send(JSON.stringify(newClub));
      }

      main.style.display = 'block';
      popup.style.display = 'none';
      clubNameInput.value = '';
    });
  }

  function searchUser() {
    const searchUsername = document.getElementById('searchMemberID').value;

    xhr = new XMLHttpRequest();
    xhr.open('POST', 'users/searchUser', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);

          const nameElement = document.querySelector('.name');
          const usernameElement = document.querySelector('.userName');
          const memberIDElement = document.querySelector('.MemeberID');

          if (data.error) {
            // User not found
            nameElement.textContent = 'Name: Not found';
            usernameElement.textContent = 'Username: Not found';
            memberIDElement.textContent = 'Member: Not found';
          } else {
            // User found, update the UI with the retrieved data
            nameElement.textContent = `Name: ${data.fullname}`;
            usernameElement.textContent = `Username: ${data.username}`;
            memberIDElement.textContent = `Member: ${data.userID}`;
          }
        }
      }
    };

    xhr.send(JSON.stringify({ searchUsername }));
  }

  function deleteUser() {
    const username = document.getElementById('searchMemberID').value;
    // Send an HTTP POST request to delete the user
    xhr = new XMLHttpRequest();
    xhr.open('POST', 'users/deleteUser', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          console.log(data);
        }
      }
    };

    xhr.send(JSON.stringify({ username: username }));
  }

  function assignAdmin() {
    const username = document.getElementById('searchMemberID').value;
    // Send an HTTP POST request to delete the user
    xhr = new XMLHttpRequest();
    xhr.open('POST', 'users/assignAdmin', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);

          // Handle the response here
          console.log(data);
        }
      }
    };

    xhr.send(JSON.stringify({ username }));
  }
