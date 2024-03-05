const app = Vue.createApp({
    data() {
        return {
            clubName: null,
            clubInfo: {},
            upcomingEvents: [],
            clubPosts: {},
            isLoginForm: true,
            aboutUsVisible: false,
            showLoginModal: false,
            userID: null,
            isClubManager: false,
            isFollowing: false,
            showPostForm: false,
            newPost: {
                title: '',
                content: '',
                PublicStatus: true
            },
            showEventForm: false,
            newEvent: {
                EventName: '',
                Description: '',
                Time: '',
                Date: '',
                Address: ''
            },
            showAboutUsForm: false
        };
    },
    async mounted() {
        const params = new URLSearchParams(window.location.search);
        this.clubName = params.get('clubName');

        try {
            await this.getClubInfo();
        } catch (error) {
            //  console.error('Failed to initialize:', error);
        }
    },
    methods: {
        // Refreshes the page by fetching necessary data
        refreshPage() {
            this.getClubInfo();
            this.loadUpcomingEvents();
            this.loadClubPosts();
            this.fetchUserID();
        },
        // Fetches club information
        async getClubInfo() {
            let xhttp = new XMLHttpRequest();
            xhttp.open('GET', `/getClubInfo?clubName=${encodeURIComponent(this.clubName)}`, true);
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4) {
                    if (xhttp.status === 200) {
                        let response = JSON.parse(xhttp.responseText);
                        this.clubInfo = response.clubInfo;
                        this.loadUpcomingEvents();
                        this.loadClubPosts();
                        this.fetchUserID();
                    }
                }
            };
            xhttp.send();
        },
        // Loads upcoming events for the club
        async loadUpcomingEvents() {
            if (this.clubInfo.ClubID) {
                let xhttp = new XMLHttpRequest();
                xhttp.open('GET', `/getUpcomingEvents?ClubID=${encodeURIComponent(this.clubInfo.ClubID)}`, true);
                xhttp.setRequestHeader('Content-Type', 'application/json');
                xhttp.onreadystatechange = () => {
                    if (xhttp.readyState === 4) {
                        if (xhttp.status === 200) {
                            this.upcomingEvents = JSON.parse(xhttp.responseText);
                        }
                    }
                };
                xhttp.send();
            }
        },
        // Loads club posts
        async loadClubPosts() {
            if (this.clubInfo.ClubID) {
                let xhttp = new XMLHttpRequest();
                xhttp.open('GET', `/getClubPosts?ClubID=${encodeURIComponent(this.clubInfo.ClubID)}`, true);
                xhttp.onreadystatechange = () => {
                    if (xhttp.readyState === 4) {
                        if (xhttp.status === 200) {
                            this.clubPosts = JSON.parse(xhttp.responseText);
                        }
                    }
                };
                xhttp.send();
            }
        },
        // Checks the booking status for the upcoming events
        async checkBookings() {
            if (this.userID !== null) {
                for (let event of this.upcomingEvents) {
                    let xhttp = new XMLHttpRequest();
                    xhttp.open(
                        'GET',
                        `/users/checkBooking?UserID=${encodeURIComponent(
                            this.userID
                        )}&EventID=${encodeURIComponent(event.EventID)}`,
                        true
                    );
                    xhttp.setRequestHeader('Content-Type', 'application/json');
                    xhttp.onreadystatechange = () => {
                        if (xhttp.readyState === 4) {
                            if (xhttp.status === 200) {
                                event.isBooked = JSON.parse(xhttp.responseText).isBooked;
                            }
                        }
                    };
                    xhttp.send();
                }
            }
        },
        // Fetches the user ID
        async fetchUserID() {
            var xhttp = new XMLHttpRequest();
            xhttp.open('GET', '/users/getUserID', true);
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.userID = JSON.parse(xhttp.responseText).userID;
                    if (this.userID === this.clubInfo.ClubManagerID) {
                        this.isClubManager = true;
                    }
                    this.checkBookings();

                    // See if user is club manager
                    let xhttp2 = new XMLHttpRequest();
                    xhttp2.open(
                        'GET',
                        `/users/checkFollow?UserID=${encodeURIComponent(
                            this.userID
                        )}&ClubID=${encodeURIComponent(this.clubInfo.ClubID)}`,
                        true
                    );
                    xhttp2.setRequestHeader('Content-Type', 'application/json');
                    xhttp2.onreadystatechange = () => {
                        if (xhttp2.readyState === 4) {
                            if (xhttp2.status === 200) {
                                this.isFollowing = JSON.parse(xhttp2.responseText).isFollowing;
                            }
                        }
                    };
                    xhttp2.send();
                }
            };
            xhttp.send();
        },
        // Toggles the booking status of an event
        async toggleBook(eventID) {
            if (this.userID === null) {
                this.toggleLoginPopup();
                return;
            }
            var xhttp = new XMLHttpRequest();
            xhttp.open('POST', '/users/toggleBooking', true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.checkBookings();
                }
            };
            xhttp.send(
                JSON.stringify({
                    userID: this.userID,
                    eventID: eventID,
                    clubID: this.clubInfo.ClubID
                })
            );
        },
        // Submits a new club post
        submitPost() {
            var xhttp = new XMLHttpRequest();
            xhttp.open('POST', '/users/newClubPost', true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.loadClubPosts(); // Reload the posts after submitting
                }
            };
            xhttp.send(
                JSON.stringify({
                    title: this.newPost.title,
                    content: this.newPost.content,
                    ClubID: this.clubInfo.ClubID,
                    PublicStatus: this.newPost.PublicStatus
                })
            );
            this.newPost.title = '';
            this.newPost.content = '';
            this.newPost.PublicStatus = true; // reset PublicStatus to default
            this.showPostForm = false;
        },
        // Submits a new club event
        submitEvent() {
            var xhttp = new XMLHttpRequest();
            xhttp.open('POST', '/users/newClubEvent', true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.loadUpcomingEvents(); // Reload the events after submitting
                }
            };
            xhttp.send(
                JSON.stringify({
                    EventName: this.newEvent.EventName,
                    Description: this.newEvent.Description,
                    Time: this.newEvent.Time,
                    Date: this.newEvent.Date,
                    Address: this.newEvent.Address,
                    ClubID: this.clubInfo.ClubID
                })
            );
            // Reset form
            this.newEvent = {
                EventName: '',
                Description: '',
                Time: '',
                Date: '',
                Address: ''
            };
            this.showEventForm = false;
        },
        // Submits the provided about us information for a club
        submitAboutUs() {
            var xhttp = new XMLHttpRequest();
            xhttp.open('POST', '/users/updateAboutUs', true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.refreshPage();
                    this.aboutUsVisible = !this.aboutUsVisible;
                }
            };
            xhttp.send(
                JSON.stringify({
                    AboutUs: this.clubInfo.AboutUs,
                    ClubID: this.clubInfo.ClubID
                })
            );
        },
        // Deletes the selected club event
        deleteEvent(eventID) {
            var xhttp = new XMLHttpRequest();
            xhttp.open('DELETE', '/users/deleteEvent', true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.loadUpcomingEvents(); // Reload the events after deleting
                }
            };
            xhttp.send(JSON.stringify({ EventID: eventID }));
        },
        // Deletes the selected club post
        deletePost(postID) {
            var xhttp = new XMLHttpRequest();
            xhttp.open('DELETE', '/users/deletePost', true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.refreshPage();
                }
            };
            xhttp.send(JSON.stringify({ PostID: postID }));
            // Toggles the follow status
        },
        async toggleFollow() {
            if (this.userID === null) {
                this.toggleLoginPopup();
                return;
            }
            let xhttp = new XMLHttpRequest();
            xhttp.open('POST', '/users/toggleFollow', true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    this.fetchUserID(); // Refresh follow status
                }
            };
            xhttp.send(
                JSON.stringify({ userID: this.userID, clubID: this.clubInfo.ClubID })
            );
        },
        // Logs out the user
        logout() {
            var xhttp = new XMLHttpRequest();
            xhttp.open('POST', '/logout', true);
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    location.reload();
                }
            };
            xhttp.send();
        },
        // Formats a date string
        formatDate(date) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString(undefined, options);
        },
        // Formats a time string
        formatTime(time) {
            return time.substr(0, 5); // Extract the time portion without seconds
        },
        // Toggles the about us form visibility
        toggleAboutUs() {
            this.aboutUsVisible = !this.aboutUsVisible;
        },
        // switches between sign up and log in
        toggleLoginForm() {
            this.isLoginForm = !this.isLoginForm;
        },
        // login/sign up pop up when trying to book without being logged in
        toggleLoginPopup() {
            this.showLoginModal = !this.showLoginModal;
        },
        getClubManagerURL() {
            // Construct the URL with the clubName as a URL parameter
            const url = new URL('ClubManager.html', window.location.origin);
            url.searchParams.set('clubName', this.clubName);
            console.log(url);
            return url.href;
          }
    }
});

app.mount('#app');
