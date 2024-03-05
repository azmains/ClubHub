const app = Vue.createApp({
    data() {
        return {
            eventInformation: {}, // Holds the information about events
            isAdmin: false, // Indicates whether the user is an admin
            userID: null // Holds the user ID
        };
    },
    async mounted() {
        await this.fetchUserID(); // Fetches the user ID when the component is mounted
    },
    methods: {
        loadUserClubEvent() {
            // Loads the user's club event information
            if (this.userID) {
                let xhttp = new XMLHttpRequest();
                xhttp.open("GET", `/users/getUserClubEvent?UserID=${encodeURIComponent(this.userID)}`, true);
                xhttp.setRequestHeader('Content-Type', 'application/json');
                xhttp.onreadystatechange = () => {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        this.eventInformation = JSON.parse(xhttp.responseText);
                    }
                };
                xhttp.send();
            }
        },
        async fetchUserID() {
            // Fetches the user ID
            let xhttp = new XMLHttpRequest();
            xhttp.open("GET", "/users/getUserID", true);
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.userID = JSON.parse(xhttp.responseText).userID;
                    this.loadUserClubEvent(); // Loads the user's club event information
                    this.fetchAdminStatus(); // Fetches the admin status
                }
            };
            xhttp.send();
        },
        formatDate(date) {
            // Formats a date string
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString(undefined, options);
        },
        formatTime(time) {
            // Formats a time string
            if (time) {
                return time.substr(0, 5); // Extract the time portion without seconds
            }
            return ''; // Return an empty string if the time value is undefined
        },
        async fetchAdminStatus() {
            // Fetches the admin status
            let xhttp = new XMLHttpRequest();
            xhttp.open("GET", `/users/getAdminStatus?UserID=${encodeURIComponent(this.userID)}`, true);
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.isAdmin = JSON.parse(xhttp.responseText).isAdmin;
                }
            };
            xhttp.send();
        },
        logout() {
            // Logs out the user
            let xhttp = new XMLHttpRequest();
            xhttp.open("POST", "/logout", true);
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    location.reload(); // Reloads the page after logout
                }
            };
            xhttp.send();
        }
    }
  });

  app.mount('#app'); // Mounts the app to the element with id 'app'
