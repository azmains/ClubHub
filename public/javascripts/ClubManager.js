// ALLOW ACCESS IF USERS IS EITHER ADMIN OR CLUB MANAGER
// IF CLUB MANAGER MUST BE CLUB MANAGER OF QUERIED CLUB
// ELSE ACCESS IS DENIED

// This code will run when the page is loaded
window.addEventListener('DOMContentLoaded', function () {
    // Get the clubName param
    var urlParams = new URLSearchParams(window.location.search);
    var clubName = urlParams.get('clubName');
    var searchMemberID = document.getElementById('searchMemberID');
    var removeUserButton = document.getElementById('removeUser');
    var clubMembersTable = document.querySelector('.clubMembers table tbody');

    // Function to fetch club members and event bookings
    function fetchClubMembers() {
      var fetchMembersXHR = new XMLHttpRequest();
      fetchMembersXHR.open('GET', 'users/clubMembers?club=' + clubName, true);
      fetchMembersXHR.onreadystatechange = function () {
        if (fetchMembersXHR.readyState === 4 && fetchMembersXHR.status === 200) {
          var clubMembers = JSON.parse(fetchMembersXHR.responseText);
          clubMembersTable.innerHTML = '';
          clubMembers.forEach(function (member) {
            var row = document.createElement('tr');
            var nameCell = document.createElement('td');
            var usernameCell = document.createElement('td');
            nameCell.textContent = member.FirstName + ' ' + member.LastName;
            usernameCell.textContent = member.Username;
            row.appendChild(nameCell);
            row.appendChild(usernameCell);
            clubMembersTable.appendChild(row);
          });

          // Fetch event bookings
          var fetchBookingsXHR = new XMLHttpRequest();
          fetchBookingsXHR.open('GET', 'users/bookings?club=' + clubName, true);
          fetchBookingsXHR.onreadystatechange = function () {
            if (fetchBookingsXHR.readyState === 4 && fetchBookingsXHR.status === 200) {
              var eventBookings = JSON.parse(fetchBookingsXHR.responseText);
              var eventBookingsTable = document.querySelector('.eventBookings table tbody');
              eventBookingsTable.innerHTML = '';
              eventBookings.forEach(function (booking) {
                var row = document.createElement('tr');
                var eventNameCell = document.createElement('td');
                var userCell = document.createElement('td');
                eventNameCell.textContent = booking.EventName;
                userCell.textContent = booking.Username;
                row.appendChild(eventNameCell);
                row.appendChild(userCell);

                eventBookingsTable.appendChild(row);
              });
            }
          };
          fetchBookingsXHR.send();
        }
      };
      fetchMembersXHR.send();
    }

    fetchClubMembers();

    // ClubManager Search user can only search for users apart of the club
    function searchUser(event) {
      var username = searchMemberID.value;
      var searchXHR = new XMLHttpRequest();
      searchXHR.open(
        'GET',
        'users/search?username=' + username + '&club=' + clubName,
        true
      );
      searchXHR.onreadystatechange = function () {
        var nameElement = document.querySelector('.user .name-value');
        var usernameElement = document.querySelector('.user .username-value');
        var membershipIDElement = document.querySelector('.user .membershipID-value');
        if (searchXHR.readyState === 4 && searchXHR.status === 200) {
          var searchedUser = JSON.parse(searchXHR.responseText);

          // Check if the searchedUser array is empty or undefined
          if (searchedUser && searchedUser.length > 0) {
            nameElement.textContent = searchedUser[0].FirstName;
            usernameElement.textContent = searchedUser[0].Username;
            membershipIDElement.textContent = searchedUser[0].MembershipID;
          } else {
            nameElement.textContent = '';
            usernameElement.textContent = 'User Does Not Exist';
            membershipIDElement.textContent = '';
          }
        }
      };
      searchXHR.send();
    }

    // ClubManager and Admin remove user can only remove users from the club
    function removeUser() {
      var username = searchMemberID.value;
      var removeXHR = new XMLHttpRequest();
      removeXHR.open('POST', 'users/remove', true);
      removeXHR.setRequestHeader('Content-Type', 'application/json');
      removeXHR.onreadystatechange = function () {
        if (removeXHR.readyState === 4 && removeXHR.status === 200) {
          var removalResult = JSON.parse(removeXHR.responseText);
          console.log('User removed:', removalResult);
        }
      };
      var requestBody = JSON.stringify({
        username: username,
        clubName: clubName
      });
      removeXHR.send(requestBody);
    }

    // Admin search for searching all users
    function searchUserAdmin() {
      const searchUsername = document.getElementById('searchMemberID').value;

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'users/AdminsearchUserClubMan', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            const nameElement = document.querySelector('.name');
            const usernameElement = document.querySelector('.userName');
            const memberIDElement = document.querySelector('.membershipID');

            if (data.error) {
              nameElement.textContent = 'Name: Not found';
              usernameElement.textContent = 'Username: Not found';
              memberIDElement.textContent = 'Member: Not found';
            } else {
              nameElement.textContent = `Name: ${data.fullname}`;
              usernameElement.textContent = `Username: ${data.username}`;
              memberIDElement.textContent = `Member: ${data.membershipID}`;
            }
          }
        }
      };

      xhr.send(JSON.stringify({ searchUsername: searchUsername, clubName: clubName }));
    }

    // Admin make manager will make searched user the clubManager.
    function makeMan() {
      const searchUsername = document.getElementById('searchMemberID').value;
      var MakeManxhr = new XMLHttpRequest();
      MakeManxhr.open('POST', 'users/makeManager', true);
      MakeManxhr.setRequestHeader('Content-Type', 'application/json');
      MakeManxhr.onreadystatechange = function () {
        if (MakeManxhr.readyState === 4) {
          if (MakeManxhr.status === 200) {
            var data = JSON.parse(MakeManxhr.responseText);
            console.log(data);
          }
        }
      };
      MakeManxhr.send(JSON.stringify({ username: searchUsername, clubName: clubName }));
    }

    var runningxhr = new XMLHttpRequest();
    runningxhr.open('GET', 'users/ClubManager/' + clubName, true);
    runningxhr.onreadystatechange = function () {
      if (runningxhr.readyState === 4) {
        if (runningxhr.status === 401) {
          window.location.href = '../AccessDenied.html';
        } else if (runningxhr.status === 200) {
          var response = JSON.parse(runningxhr.responseText);
          var clubManagerStatus = response.ClubManagerStatus;
          var create = document.getElementById('makeManager');
          removeUserButton = document.getElementById('removeUserButton');
          if (clubManagerStatus) {
            create.style.display = 'none';

            searchMemberID.disabled = false;
            removeUserButton.disabled = false;

            var moreDetails = document.getElementById('moreDetails');
            moreDetails.addEventListener('click', searchUser);

            removeUserButton.addEventListener('click', removeUser);
          } else if (!clubManagerStatus) {
            var moreDetailsAdmin = document.getElementById('moreDetails');
            moreDetailsAdmin.addEventListener('click', searchUserAdmin);
            removeUserButton.addEventListener('click', removeUser);
            create.addEventListener('click', makeMan);
          }
        }
      }
    };
    runningxhr.send();
  });
