var express = require('express');
var router = express.Router();
var path = require('path');
var bcrypt = require('bcrypt');
const { errorMonitor } = require('stream');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('HomePage.html');
});

router.get('/home', function (req, res) {
  res.redirect('HomePage.html');
});

router.get('/login', function (req, res) {
  res.redirect('Login.html');
});

router.get('/clubPage', function (req, res) {
  res.redirect('FrontPage.html');
});

router.get('/register', function (req, res) {
  res.redirect('Register.html');
});

router.get('/events', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    const { UserID } = req.query;
    const query = `
      SELECT Events.* FROM Events
      JOIN Clubs ON Events.ClubID = Clubs.ClubID
      JOIN Membership ON Clubs.ClubID = Membership.ClubID
      WHERE Membership.UserID = ?;
    `;

    connection.query(query, [UserID], function (error, results, fields) {
      connection.release();

      if (error) {
        res.sendStatus(500);
        return;
      }

      res.json(results);
    });
  });
});

// frontpage
router.get('/getClubInfo', function (req, res, next) {
  if (req.query.clubName) {
    var ClubName = req.query.clubName;
    req.pool.getConnection(function (err, connection) {
      if (err) {
        res.sendStatus(500);
        return;
      }
      const query = `
        SELECT * FROM Clubs
        WHERE Name = ?
      `;
      connection.query(query, [ClubName], function (error, results) {
        if (error) {
          connection.release();
          res.sendStatus(500);
          return;
        }
        const clubInfo = results[0];
        connection.release();
        res.json({ clubInfo });
      });
    });
  }
});

// Load in Club's Events
router.get('/getUpcomingEvents', function (req, res, next) {
  var clubID = req.query.ClubID;

  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    const query = `
      SELECT * FROM Events
      WHERE ClubID = ?
    `;
    connection.query(query, [clubID], function (error, results, fields) {
      connection.release();
      if (error) {
        res.sendStatus(500);
        return;
      }
      res.json(results);
    });
  });
});

router.get('/getClubPosts', function (req, res, next) {
  var clubID = req.query.ClubID;

  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    const query = `
      SELECT * FROM Posts
      WHERE ClubID = ?
    `;
    connection.query(query, [clubID], function (error, results, fields) {
      connection.release();
      if (error) {
        res.sendStatus(500);
        return;
      }
      res.json(results);
    });
  });
});

router.post('/register', function (req, res) {
  const userName = req.body.Username;
  const emailGiven = req.body.email;
  const name = req.body.fullname;
  const givenPassword = req.body.password;

  const splitName = name.split(' ');
  const firstName = splitName[0];
  const lastName = splitName.length > 1 ? splitName[1] : '';

  if (!userName || !emailGiven || !firstName || !lastName || !givenPassword) {
    let message = "Missing required inputs: ";
    const missing = [];
    if (!userName) missing.push("Username");
    if (!emailGiven) missing.push("Email");
    if (!firstName || !lastName) missing.push("First name or last name");
    if (!givenPassword) missing.push("password");
    message += missing.join(',');
    res.redirect('/Register.html?message=' + encodeURIComponent(message));
    return;
  }

  const queryForSignIN = "SELECT Username, Email FROM Users WHERE Username=? OR Email=?";

  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    connection.query(queryForSignIN, [userName, emailGiven], function (error, results) {
      if (error) {
        res.sendStatus(500);
        connection.release();
        return;
      }
      if (results.length > 0) {
        res.redirect('/Register.html?message=Email%20or%20Username%20already%20in%20use.%20Please%20try%20again');
        connection.release();
      } else {
        bcrypt.hash(givenPassword, 10, function (errhash, hash) {
          if (errhash) {
            res.sendStatus(500);
            connection.release();
            return;
          }
          const Insertquery = "INSERT INTO Users (Username, Password, Email, FirstName, LastName) VALUES (?, ?, ?, ?, ?)";
          connection.query(Insertquery, [userName,
            hash,
            emailGiven,
            firstName,
            lastName], function (err1, results1) {

              connection.release();
              if (err1) {
                res.sendStatus(500);
                return;
              }
              res.redirect('/Login.html?message=Registration%20successful.%20You%20can%20now%20log%20in!');
            });
        });
      }
    });
  });
});

// list of clubs
router.get('/getClubs', function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    const query = `SELECT * FROM Clubs`;

    connection.query(query, function (error, results) {
      connection.release();
      if (error) {
        res.sendStatus(500);
        return;
      }

      res.json(results);
    });
  });
});

// anything before this LINE won't need signing in, so keep the order
router.post('/login', function (req, res, next) {
  const userInput = req.body.user;
  const Sentpassword = req.body.password;

  if (userInput) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        res.sendStatus(500);
        return;
      }

      const queryForLogIN = "SELECT Username, Password FROM Users WHERE Username= ? OR Email= ?";

      connection.query(queryForLogIN, [userInput, userInput], function (error, results) {
        connection.release();
        if (error) {
          res.sendStatus(500);
          return;
        }
        if (results.length === 0) {
          res.redirect('Login.html?message=Username%20or%20Email%20is%20incorrect.');
          return;
        }

        const passwordInDB = results[0].Password;
        const usernameInDB = results[0].Username;
        bcrypt.compare(Sentpassword, passwordInDB, function (errr, isMatch) {
          if (errr) {
            res.sendStatus(500);
            return;
          }
          if (isMatch) {
            req.session.user = usernameInDB;
            res.redirect('HomePage.html');
          } else {
            res.redirect('Login.html?message=Password%20is%20incorrect.');
          }
        });
      });
    });
  } else {
    res.sendStatus(401);
  }
});

// this is to check if the user is logged in
router.use(function (req, res, next) {
  if ('user' in req.session) {
    next();
  } else {
    res.sendStatus(401);
  }
});

// LOGOUT FUNCTION
router.post('/logout', function (req, res, next) {
  if ('user' in req.session) {
    delete req.session.user;
    res.send();
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
