var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var path = require('path');
var bcrypt = require('bcrypt');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

var DatabasePool = mysql.createPool({ host: 'localhost', database: 'ClubHub' });


// HOMEPAGE.HTML

router.get('/getAdminStatus', function (req, res, next) {
  var userID = req.query.UserID;

  req.pool.getConnection(function (err, connection) {
    if (err) {
      // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const query = `
      SELECT AdminStatus
      FROM Users
      WHERE UserID = ?
    `;
    connection.query(query, [userID], function (error, results) {
      connection.release();
      if (error) {
        // console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }
      const isAdmin = results.length > 0 && results[0].AdminStatus === 1;
      res.json({ isAdmin: isAdmin });
    });
  });
});


router.get('/getUserClubEvent', function (req, res, next) {
  var userID = req.query.UserID;

  req.pool.getConnection(function (err, connection) {
    if (err) {
      // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }

    const query = `
      SELECT Clubs.Name AS ClubName, Events.EventName, Events.Date
      FROM Membership
      JOIN Clubs ON Membership.ClubID = Clubs.ClubID
      JOIN Events ON Clubs.ClubID = Events.ClubID
      WHERE Membership.UserID = ?
    `;

    connection.query(query, [userID], function (error, results) {
      connection.release();
      if (error) {
        // console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }

     // console.log(results);
      res.json(results);
    });
  });
});


// check for admin
router.get('/homeisadmin', (req, res, next) => {
  const username = req.session.user;
  if (username === null) {
    return res.status(404).send('Access Denied!');
  }

  const admincheck = 'SELECT AdminStatus FROM Users WHERE Username = ?';

  DatabasePool.query(admincheck, [username], (err, results) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (results.length > 0) {
      const adminStatus = results[0].AdminStatus;

      if (adminStatus === 1) {
        // User has admin access
        return res.status(200).send('Access Granted');
      }
    } else {
      // User not found
      return res.sendStatus(404);
    }
  });
});




// ADMINMANAGER.HTML CODE


// Check is signed in user has admin permission
router.get('/adminRunning', function (req, res, next) {


  var username = req.session.user;
  const admincheck = 'SELECT AdminStatus FROM Users WHERE Username = ?';
  DatabasePool.query(admincheck, [username], (err, results) => {
    if (err) {
      res.sendStatus(500);
    } else if (results.length > 0) {
      const adminStatus = results[0].AdminStatus;

      if (adminStatus === 1) {
        res.status(200).send('Access Granted');
      } else if (adminStatus === 0) {
        // User does not have admin access
        res.sendFile(path.join(__dirname, '../public/AccessDenied.html'));
        res.status(401).send('Access Denied!');
      }
    } else {
      // User not found
      res.sendStatus(404);
    }
  });
});



// FrontPage.html
router.get('/getUserID', function (req, res, next) {
  if (req.session.user) {
    var username = req.session.user;
    const query = 'SELECT UserID FROM Users WHERE Username = ?';
    DatabasePool.query(query, [username], (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else if
        (results.length > 0) {
        res.json({ userID: results[0].UserID });
      } else {
        res.sendStatus(404); // User not found
      }
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
});

router.get('/checkBooking', function (req, res, next) {
  var userID = req.query.UserID;
  var eventID = req.query.EventID;

  req.pool.getConnection(function (err, connection) {
    if (err) {
     // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const queryCheck = `
      SELECT * FROM BookedEvents
      WHERE UserID = ? AND EventID = ?
    `;
    connection.query(queryCheck, [userID, eventID], function (error, results) {
      // console.log(queryCheck);
      connection.release();
      if (error) {
        // console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }


      var isBooked = results.length > 0;

      res.json({ isBooked: isBooked });
    });
  });
});

// book unbook
router.post('/toggleBooking', function (req, res, next) {
  var { userID, eventID, clubID } = req.body;

  req.pool.getConnection(function (err, connection) {
    if (err) {
      // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const queryCheck = `
      SELECT * FROM BookedEvents
      WHERE UserID = ? AND EventID = ? AND ClubID = ?
    `;
    connection.query(queryCheck, [userID, eventID, clubID], function (error, results) {
      // console.log(queryCheck);
      if (error) {
        connection.release();
       // console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }
      var query;
      var isBooked; // This will hold the intended state after the action

      if (results.length > 0) {
        // The user has already booked this event, so unbook it
        query = `
          DELETE FROM BookedEvents
          WHERE UserID = ? AND EventID = ? AND ClubID = ?
        `;
        isBooked = false; // After unbooking, it's not booked
      } else {
        // The user has not booked this event, so book it
        query = `
          INSERT INTO BookedEvents (UserID, EventID, ClubID)
          VALUES (?, ?, ?)
        `;
        isBooked = true; // After booking, it's booked
      }
      connection.query(query, [userID, eventID, clubID], function (error1) {
        connection.release();
        if (error1) {
         // console.log('Error in query:', error1);
          res.sendStatus(500);
        } else {
         // console.log(isBooked);
          res.json({ isBooked: isBooked }); // Return the intended state
        }
      });
    });
  });
});


router.post('/toggleFollow', function (req, res, next) {
  var { userID, clubID } = req.body;

  req.pool.getConnection(function (err, connection) {
    if (err) {
      // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const queryCheck = `
      SELECT * FROM Membership
      WHERE UserID = ? AND ClubID = ?
      `;
    connection.query(queryCheck, [userID, clubID], function (error, results) {
      if (error) {
        connection.release();
      //  console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }
      var query;
      var isFollowing;

      if (results.length > 0) {
        // The user is already following this club, so unfollow
        query = `
              DELETE FROM Membership
              WHERE UserID = ? AND ClubID = ?
              `;
        isFollowing = false;
      } else {
        // The user is not following this club, so follow
        query = `
              INSERT INTO Membership (UserID, ClubID)
              VALUES (?, ?)
              `;
        isFollowing = true;
      }
      connection.query(query, [userID, clubID], function (error1) {
        connection.release();
        if (error1) {
        //  console.log('Error in query:', error1);
          res.sendStatus(500);
        } else {
          res.json({ isFollowing: isFollowing });
        }
      });
    });
  });
});


// make post
router.post('/newClubPost', function (req, res, next) {
  var Title = req.body.title;
  var Content = req.body.content;
  var clubID = req.body.ClubID;
  var publicStatus = req.body.PublicStatus;
 // console.log(Title, Content, clubID, publicStatus, req.body.PublicStatus);
  req.pool.getConnection(function (err, connection) {
    if (err) {
    //  console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const query = `
      INSERT INTO Posts (Title, Content, ClubID, PublicStatus)
      VALUES (?, ?, ?, ?)
    `;
    connection.query(query, [Title, Content, clubID, publicStatus], function
      (error, results, fields) {
      connection.release();
      if (error) {
       // console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
});


// delete event
router.delete('/deleteEvent', function (req, res, next) {
  var { EventID } = req.body;
  req.pool.getConnection(function (err, connection) {
    if (err) {
     // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const query = `DELETE FROM Events WHERE EventID = ?`;
    connection.query(query, [EventID], function (error) {
      connection.release();
      if (error) {
       // console.log('Error in query:', error);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });
});

// delete post
router.delete('/deletePost', function (req, res, next) {
  var { PostID } = req.body;
  req.pool.getConnection(function (err, connection) {
    if (err) {
     // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const query = `DELETE FROM Posts WHERE PostID = ?`;
    connection.query(query, [PostID], function (error) {
      connection.release();
      if (error) {
       // console.log('Error in query:', error);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });
});


// change about us
router.post('/updateAboutUs', function (req, res, next) {
  var { AboutUs, ClubID } = req.body;
  req.pool.getConnection(function (err, connection) {
    if (err) {
    //  console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const query = `
          UPDATE Clubs
          SET AboutUs = ?
          WHERE ClubID = ?
      `;
    connection.query(query, [AboutUs, ClubID], function (error) {
      connection.release();
      if (error) {
       // console.log('Error in query:', error);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });
});



// make event
router.post('/newClubEvent', function (req, res, next) {
  var {
    EventName,
    Description,
    Time, Date,
    Address,
    ClubID
  } = req.body;

/* console.log(req.body);
  console.log({
    EventName,
    Description,
    Time, Date,
    Address,
    ClubID
  }); */

  req.pool.getConnection(function (err, connection) {
    if (err) {
     // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const query = `
          INSERT INTO Events (EventName, Description, Time, Date, Address, ClubID)
          VALUES (?, ?, ?, ?, ?, ?)
      `;
    connection.query(query, [EventName, Description, Time, Date, Address, ClubID], function
      (error) {
      connection.release();
      if (error) {
     //   console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
});

// follow or unfollow
router.post('/toggleFollow', function (req, res, next) {
  var { userID, clubID } = req.body;
  req.pool.getConnection(function (err, connection) {
    if (err) {
    //  console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const queryCheck = `
      SELECT * FROM Membership
      WHERE UserID = ? AND ClubID = ?
      `;
    connection.query(queryCheck, [userID, clubID], function (error, results) {
      if (error) {
        connection.release();
      //  console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }
      var query;
      var isFollowing;
      if (results.length > 0) {
        // The user is already following this club, so unfollow
        query = `
              DELETE FROM Membership
              WHERE UserID = ? AND ClubID = ?
              `;
        isFollowing = false;
      } else {
        // The user is not following this club, so follow
        query = `
              INSERT INTO Membership (UserID, ClubID)
              VALUES (?, ?)
              `;
        isFollowing = true;
      }
      connection.query(query, [userID, clubID], function (error1) {
        connection.release();
        if (error1) {
         // console.log('Error in query:', error1);
          res.sendStatus(500);
        } else {
          res.json({ isFollowing: isFollowing });
        }
      });
    });
  });
});

// check if following
router.get('/checkFollow', function (req, res, next) {
  var userID = req.query.UserID;
  var clubID = req.query.ClubID;

  req.pool.getConnection(function (err, connection) {
    if (err) {
     // console.log('Error in getConnection:', err);
      res.sendStatus(500);
      return;
    }
    const queryCheck = `
      SELECT * FROM Membership
      WHERE UserID = ? AND ClubID = ?
      `;
    connection.query(queryCheck, [userID, clubID], function (error, results) {
      connection.release();
      if (error) {
       // console.log('Error in query:', error);
        res.sendStatus(500);
        return;
      }
      var isFollowing = results.length > 0;
      res.json({ isFollowing: isFollowing });
    });
  });
});



// PROFILESETTINGS.HTML

router.get('/userdata', (req, res, next) => {
  const query = `
    SELECT Users.Username, Users.FirstName, Users.LastName, Users.DateOfBirth, Users.Email, Events.EventID, Events.EventName, Events.Description, Events.Time, Events.Date, Events.Address
    FROM Users
    LEFT JOIN BookedEvents ON Users.UserID = BookedEvents.UserID
    LEFT JOIN Events ON BookedEvents.EventID = Events.EventID
    WHERE Users.Username = ?
  `;
  const username = req.session.user;

  DatabasePool.query(query, [username], (err, results) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    if (results.length > 0) {
      const user = results[0];
      const userData = {
        username: user.Username,
        fullname: user.FirstName + ' ' + user.LastName,
        birthday: user.DateOfBirth ? user.DateOfBirth.toISOString().split('T')[0] : null,
        userEmail: user.Email,
        events: results.map((row) => ({
          eventID: row.EventID,
          eventName: row.EventName,
          description: row.Description,
          time: row.Time,
          date: row.Date ? row.Date.toISOString().split('T')[0] : null,
          address: row.Address
        }))
      };
      res.json(userData);
    } else {
      const user = results[0];
      const userData = {
        username: user.Username,
        fullname: user.FirstName + ' ' + user.LastName,
        birthday: user.DateOfBirth ? user.DateOfBirth.toISOString().split('T')[0] : null,
        userEmail: user.Email,
        events: [] // Empty events array when no events are booked
      };
      res.json(userData);
    }
  });
});


// Updates the users username when changed and btn clicked
router.post('/updateUsername', (req, res, next) => {
  const updatedUsername = req.body.username;
  const username = req.session.user; // Use the session user's username

  const updateUsernameQuery = 'UPDATE Users SET Username = ? WHERE Username = ?'; // Change to update by username

  DatabasePool.query(updateUsernameQuery, [updatedUsername, username], (err, result) => {
    if (err) {

      res.sendStatus(500);
    } else {

      res.json({ message: 'Username updated successfully' });
    }
  });
});



// Updates the users personal info when changed and btn clicked
router.post('/updatePersonalInfo', (req, res, next) => {
  const username = req.session.user; // Use the session user's username

  const { firstName, lastName, birthday } = req.body;

  const updatePinfo = `UPDATE Users SET FirstName = ?, LastName = ?, DateOfBirth = ? WHERE Username = ?`; // Change to update by username

  DatabasePool.query(updatePinfo, [firstName, lastName, birthday, username], (error, results) => {
    if (error) {

      res.sendStatus(500);
    } else {

      res.status(200).json({ message: 'Personal information updated successfully' });
    }
  });
});


// Updates user password
router.post('/updatePassword', (req, res, next) => {
  const username = req.session.user; // Use the session user's username
  const { password } = req.body;
  bcrypt.hash(password, 10, function(errhash, hashedPassword) {
    if (errhash) {
     // console.log('error hashing');
      return res.sendStatus(500);
    }
    var changeP = 'UPDATE Users SET Password = ? WHERE Username = ?';
    DatabasePool.query(changeP, [hashedPassword, username], (err, result) => {
      if (err) {
      //  console.log('error db');
        return res.sendStatus(500);
      }
      return res.status(200).json({ message: 'Password updated successfully' });
    });
  });
});

// Updates the users email when changed and btn clicked
router.post('/updateConnectedAccounts', (req, res, next) => {
  const username = req.session.user; // Use the session user's username

  const { email } = req.body;

  const updateCAinfo = `UPDATE Users SET Email = ? WHERE Username = ?`; // Change to update by username

  DatabasePool.query(updateCAinfo, [email, username], (error, results) => {
    if (error) {

      res.sendStatus(500);
    } else {

      res.status(200).json({ message: 'Connected accounts updated successfully' });
    }
  });
});


// ADMINMANAGER.HTML
// Searches for inputted user
router.post('/searchUser', (req, res, next) => {
  const { searchUsername } = req.body;
  const finduser = 'SELECT Username, FirstName, LastName, UserID FROM Users WHERE Username LIKE ? ORDER BY CASE WHEN Username = ? THEN 0 ELSE 1 END LIMIT 1';
  const searchPattern = `%${searchUsername}%`;
  DatabasePool.query(finduser, [searchPattern, searchUsername], (err, results) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      const userData = {
        username: user.Username,
        fullname: user.FirstName + ' ' + user.LastName,
        userID: user.UserID
      };
      res.json(userData);
    } else {
      res.json({ error: 'User not found' });
    }
  });
});

router.post('/deleteUser', (req, res, next) => {
  const { username } = req.body;

  // Check if user is a manager for a club if so set to null
  const updateReferences = 'UPDATE Clubs SET ClubManagerID = NULL WHERE ClubManagerID IN (SELECT UserID FROM Users WHERE Username = ?)';
  DatabasePool.query(updateReferences, [username], (err, updateResults) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Delete user
    const deleteUser = 'DELETE FROM Users WHERE Username = ?';
    DatabasePool.query(deleteUser, [username], (errr, deleteResults) => {
      if (err) {
        res.sendStatus(500);
        return;
      }

      res.json({ success: true });
    });
  });
});

// Assigns the Admin permission to searched user
router.post('/assignAdmin', (req, res, next) => {
  const { username } = req.body;

  // Update user's role to 'admin'
  const updateRole = 'UPDATE Users SET AdminStatus = TRUE WHERE Username = ?';
  DatabasePool.query(updateRole, [username], (err, result) => {
    if (err) {

      res.sendStatus(500);
      return;
    }

    // Return success response
    res.json({ success: true });
  });
});



// Gets clubs from db and loads them
router.get('/clubs', (req, res, next) => {
  // Retrieve the list of clubs from the database
  const selectClubs = 'SELECT * FROM Clubs';
  DatabasePool.query(selectClubs, (err, clubs) => {
    if (err) {

      res.sendStatus(500);
      return;
    }

    // Return the list of clubs as JSON response
    res.json({ clubs });
  });
});

// Make a new club with inputted clubName
router.post('/makeclubs', (req, res, next) => {
  const { Name } = req.body;

  // Insert the new club into the database
  const insertClub = 'INSERT INTO Clubs (Name) VALUES (?)';
  DatabasePool.query(insertClub, [Name], (err, results) => {
    if (err) {

      res.sendStatus(500);
      return;
    }

    // Return success response with the inserted club ID
    res.json({ success: true, clubID: results.insertId });
  });
});

// Deletes club with the delete btn
router.delete('/deleteclubs/:clubName', (req, res, next) => {
  const { clubName } = req.params;


  const deleteClub = 'DELETE FROM Clubs WHERE Name= ?';
  DatabasePool.query(deleteClub, [clubName], (err, result) => {
    if (err) {

      res.sendStatus(500);
      return;
    }

    if (result.affectedRows === 0) {

      res.sendStatus(404);
      return;
    }

    res.json({ success: true });
  });
});


// CLUBMANAGER.HTML

// Checks if either admin or clubManager if CM checks if is correct club
router.get('/ClubManager/:clubName', (req, res, next) => {


  var username = req.session.user;
  var encodedClubName = req.params.clubName;

 // console.log(username);
 // console.log(encodedClubName);

  // Check if clubName parameter is empty or null
  if (!encodedClubName || encodedClubName === 'null') {
    res.sendFile(path.join(__dirname, '../public/AccessDenied.html'));
    res.status(401).send('Access Denied!');
    return;
  }

  var clubName = decodeURIComponent(encodedClubName);
  // Get admin status
  const CheckAdminStatus = 'SELECT AdminStatus FROM Users WHERE Username = ?';

  DatabasePool.query(CheckAdminStatus, [username], (err, results) => {
    if (err) {

      res.sendStatus(500);
    } else if (results.length > 0) {
      const adminStatus = results[0].AdminStatus;

      if (adminStatus === 1) {
        // If admin go to admin side of page
        res.status(200).json({ access: 'granted', ClubManagerStatus: false });
      } else if (adminStatus === 0) {
        // If not admin check if clubManager
        const CheckClubManStat = 'SELECT ClubManagerStatus FROM Users WHERE Username = ?';
        DatabasePool.query(CheckClubManStat, [username], (errr, result) => {
          if (errr) {

            res.sendStatus(500);
          } else if (result.length > 0) {
            const ClubManStatus = result[0].ClubManagerStatus;

            if (ClubManStatus === 1) {
              // If User is club manager check to see that
              // they are querying thro params the correct club
              const isClubManager = 'SELECT ClubManagerID FROM Clubs WHERE Name = ?';
              DatabasePool.query(isClubManager, [clubName], (errrr, clubResult) => {
                if (errrr) {

                  res.sendStatus(500);

                } else if (clubResult.length > 0) {
                  const clubManagerID = clubResult[0].ClubManagerID;

                  // UserId get
                  const sqlUserID = 'SELECT UserID FROM Users WHERE Username = ?';
                  DatabasePool.query(sqlUserID, [req.session.user], (e, userResult) => {
                    if (e) {

                      res.sendStatus(500);
                    } else {
                      var UsersID = userResult[0].UserID;


                      if (clubManagerID === UsersID) {
                        res.status(200).json({ access: 'granted', ClubManagerStatus: true });
                      } else {
                        res.sendFile(path.join(__dirname, '../public/AccessDenied.html'));
                        res.status(401).send('Access Denied!');
                      }
                    }
                  });

                } else {
                  res.sendStatus(404);
                }
              });
            } else if (ClubManStatus === 0) {
              res.sendFile(path.join(__dirname, '../public/AccessDenied.html'));
              res.status(401).send('Access Denied!');
            }
          } else {
            res.sendStatus(404);
          }
        });
      }
    } else {
      // User not found
      res.sendStatus(404);
    }
  });
});



// Search function for if it is Club Manger signed in
router.get('/search', function (req, res, next) {
  const { username } = req.query;
  const clubName = req.query.club;

  // First, retrieve the ClubID using the clubName
  const getClubId = 'SELECT ClubID FROM Clubs WHERE Name = ?';
  DatabasePool.query(getClubId, [clubName], function (error, clubResult) {
    if (error) {

      res.sendStatus(500);
    }

    if (clubResult.length === 0) {

      res.sendStatus(404);
    }

    const clubId = clubResult[0].ClubID;


    const searchClubUsers = `
      SELECT u.FirstName, u.Username, m.MembershipID
      FROM Users u
      INNER JOIN Membership m ON u.UserID = m.UserID
      INNER JOIN Clubs c ON c.ClubID = m.ClubID
      WHERE u.Username LIKE ?
        AND c.ClubID = ?
    `;
    DatabasePool.query(searchClubUsers, [`%${username}%`, clubId], function (err, searchResult) {
      if (err) {

        res.sendStatus(500);
      }


      res.json(searchResult);
    });
  });
});


// Removes searched user from club
router.post('/remove', function (req, res, next) {
  var { username } = req.body;
  var { clubName } = req.body;

  // Get UserID using the username
  var UserIdToRemove = 'SELECT UserID FROM Users WHERE Username = ?';
  DatabasePool.query(UserIdToRemove, [username], function (err, userResult) {
    if (err) {

      res.sendStatus(500);
    }

    if (userResult.length === 0) {

      res.sendStatus(404);
    }

    var userId = userResult[0].UserID;

    // Get ClubID using the clubName
    var getClubId = 'SELECT ClubID FROM Clubs WHERE Name = ?';
    DatabasePool.query(getClubId, [clubName], function (error, clubResult) {
      if (error) {

        res.sendStatus(500);
      }

      if (clubResult.length === 0) {

        res.sendStatus(404);
      }

      var clubId = clubResult[0].ClubID;

      // remove the membership using the retrieved ClubID and UserID
      var removeMembershipFromUser = 'DELETE FROM Membership WHERE ClubID = ? AND UserID = ?';
      DatabasePool.query(removeMembershipFromUser, [clubId, userId], function
        (errr, removalResult) {
        if (errr) {

          res.sendStatus(500);
        }


        res.status(200).send('User removed successfully');
      });
    });
  });
});


// Admin set a club manager for paramed club
router.post('/makeManager', function (req, res, next) {
  var { username, clubName } = req.body;

 // console.log(username, " ", clubName);
  // Get user ID from username
  var newClubManID = 'SELECT UserID FROM Users WHERE Username = ?';
  DatabasePool.query(newClubManID, [username], (err, resID) => {

    if (err) {

      res.sendStatus(500);
    }

    var IDfound = resID[0].UserID;



    // Update searched user's role to 'manager' for selected club



    var updateClubManStat = 'UPDATE Users SET ClubManagerStatus = TRUE WHERE UserID = ?';


    DatabasePool.query(updateClubManStat, [IDfound], (errr, result) => {

      if (errr) {

        res.sendStatus(500);
      }

      var updateClubManagerID = 'UPDATE Clubs SET ClubManagerID = ? WHERE Name = ?';
      DatabasePool.query(updateClubManagerID, [IDfound, clubName], (errrr, res2) => {
        if (errrr) {

          res.sendStatus(500);
        }
        res.status(200).send('User role updated to manager and ClubManagerID set');
      });

    });

  });

});

// Search for when admin on club Manager page
router.post('/AdminsearchUserClubMan', (req, res, next) => {
  var { searchUsername, clubName } = req.body;

  const getUser = `
    SELECT u.Username, u.FirstName, u.LastName, u.UserID, IF(m.MembershipID IS NULL, 'User is not a member of ${clubName}', m.MembershipID) AS MembershipID
    FROM Users u
    LEFT JOIN Membership m ON u.UserID = m.UserID AND m.ClubID = (SELECT ClubID FROM Clubs WHERE Name = ?)
    WHERE u.Username LIKE ?
    ORDER BY CASE WHEN u.Username = ? THEN 0 ELSE 1 END
    LIMIT 1
  `;
  const searchPattern = `%${searchUsername}%`;

  DatabasePool.query(getUser, [clubName, searchPattern, searchUsername], (err, results) => {
    if (err) {

      res.sendStatus(500);
      return;
    }

    if (results.length > 0) {
      const user = results[0];
      const userData = {
        username: user.Username,
        fullname: user.FirstName + ' ' + user.LastName,
        userID: user.UserID,
        membershipID: user.MembershipID
      };

      res.json(userData);
    } else {
      res.json({ error: 'User not found' });
    }
  });
});

// Get members
router.get('/clubMembers', (req, res, next) => {
  const { club } = req.query;
//  console.log(club);
  // Query to fetch club members based on club name
  const query = `
  SELECT u.UserID, u.FirstName, u.LastName, u.Username
  FROM Users u
  JOIN Membership m ON u.UserID = m.UserID
  JOIN Clubs c ON m.ClubID = c.ClubID
  WHERE c.Name = ?;
`;


  DatabasePool.query(query, [club], (error, results) => {
    if (error) {
    //  console.error('Error fetching club members:', error);
      res.status(500).json({ error: 'Failed to fetch club members.' });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET endpoint for retrieving event bookings
router.get('/bookings', (req, res, next) => {
  const clubName = req.query.club; // Get the clubName from the query parameter


  const getEvents = `
    SELECT Events.EventName, Users.Username
    FROM BookedEvents
    INNER JOIN Events ON BookedEvents.EventID = Events.EventID
    INNER JOIN Users ON BookedEvents.UserID = Users.UserID
    INNER JOIN Clubs ON BookedEvents.ClubID = Clubs.ClubID
    WHERE Clubs.Name = ?
  `;

  DatabasePool.query(getEvents, [clubName], (error, results) => {
    if (error) {
    //  console.error('Error fetching event bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {

      const eventBookings = results.map((row) => ({
        EventName: row.EventName,
        Username: row.Username
      }));
      res.status(200).json(eventBookings);
    }
  });
});

module.exports = router;
