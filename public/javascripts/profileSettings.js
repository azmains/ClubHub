// Declare app variable
var app;

// Make an XMLHttpRequest to fetch user data
var userdataXhr = new XMLHttpRequest();
userdataXhr.open('GET', 'users/userdata', true);
userdataXhr.onreadystatechange = function () {
  if (userdataXhr.readyState === 4) {
    if (userdataXhr.status === 200) {
      // Parse the response data
      var data = JSON.parse(userdataXhr.responseText);

      // Create a new Vue instance
      app = new Vue({
        el: "#app",
        data: {
          // Set the initial values for input fields and data properties
          inputUsername: data.username,
          inputFullname: data.fullname,
          inputBirthday: data.birthday,
          email: data.userEmail,
          events: data.events
        },
        methods: {
          // Method to update the username
          updateUsername() {
            // Retrieve the updated username from input
            var updatedUsername = this.inputUsername.trim();

            // Make an AJAX request to update the username
            var updateUsernameXhr = new XMLHttpRequest();
            updateUsernameXhr.open('POST', 'users/updateUsername', true);
            updateUsernameXhr.setRequestHeader('Content-Type', 'application/json');
            updateUsernameXhr.onreadystatechange = function () {
              if (updateUsernameXhr.readyState === 4) {
                if (updateUsernameXhr.status === 200) {
                  // Handle the successful update
                  // console.log('Username updated successfully');
                }
              }
            };
            updateUsernameXhr.send(JSON.stringify({
              username: updatedUsername
            }));
          },
          // Method to update personal information
          updatePersonalInfo() {
            // Split the full name into first name and last name
            var updatedFirstName = "";
            var updatedLastName = "";
            var nameParts = this.inputFullname.trim().split(" ");
            if (nameParts.length > 0) {
              [updatedFirstName] = nameParts;
            }
            if (nameParts.length > 1) {
              updatedLastName = nameParts.slice(1).join(" ");
            }

            // Retrieve the updated birthday
            var updatedBirthday = this.inputBirthday;

            // Make an AJAX request to update the personal information
            var updatePersonalInfoXhr = new XMLHttpRequest();
            updatePersonalInfoXhr.open('POST', 'users/updatePersonalInfo', true);
            updatePersonalInfoXhr.setRequestHeader('Content-Type', 'application/json');
            updatePersonalInfoXhr.onreadystatechange = function () {
              if (updatePersonalInfoXhr.readyState === 4) {
                if (updatePersonalInfoXhr.status === 200) {
                  // Handle the successful update
                  console.log('Personal information updated successfully');
                }
              }
            };
            updatePersonalInfoXhr.send(JSON.stringify({
              firstName: updatedFirstName,
              lastName: updatedLastName,
              birthday: updatedBirthday
            }));
          },
          // Method to update the password
          updatePassword() {
            // Make an AJAX request to update the password
            var updatePasswordXhr = new XMLHttpRequest();
            updatePasswordXhr.open('POST', 'users/updatePassword', true);
            updatePasswordXhr.setRequestHeader('Content-Type', 'application/json');
            updatePasswordXhr.onreadystatechange = function () {
              if (updatePasswordXhr.readyState === 4) {
                if (updatePasswordXhr.status === 200) {
                  // Handle the successful update
                  // console.log('Password updated successfully');
                }
              }
            };
            updatePasswordXhr.send(JSON.stringify({
              password: this.newPassword
            }));
          },
          // Method to update the connected accounts
          updateConnectedAccounts() {
            // Make an AJAX request to update the connected accounts
            var updateConnectedAccountsXhr = new XMLHttpRequest();
            updateConnectedAccountsXhr.open('POST', 'users/updateConnectedAccounts', true);
            updateConnectedAccountsXhr.setRequestHeader('Content-Type', 'application/json');
            updateConnectedAccountsXhr.onreadystatechange = function () {
              if (updateConnectedAccountsXhr.readyState === 4) {
                if (updateConnectedAccountsXhr.status === 200) {
                  // Handle the successful update
                  // console.log('Connected accounts updated successfully');
                }
              }
            };
            updateConnectedAccountsXhr.send(JSON.stringify({
              email: this.email
            }));
          }
        }
      });
    }
  }
};

// Send the user data request
userdataXhr.send();
