CREATE DATABASE ClubHub;
USE ClubHub;

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    DateOfBirth DATE,
    AdminStatus BOOLEAN DEFAULT FALSE,
    ClubManagerStatus BOOLEAN DEFAULT FALSE
);

CREATE TABLE Clubs (
    ClubID INT AUTO_INCREMENT PRIMARY KEY,
    AboutUs TEXT,
    Name VARCHAR(255) NOT NULL,
    ClubManagerID INT,
    DateCreated DATE,
    ClubLogo BLOB,
    FOREIGN KEY (ClubManagerID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE Events (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    EventName VARCHAR(255),
    Description TEXT,
    Time TIME,
    Date DATE,
    Address VARCHAR(300),
    ClubID INT,
    FOREIGN KEY (ClubID) REFERENCES Clubs(ClubID)
);

CREATE TABLE BookedEvents (
    RSVPID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    ClubID INT,
    RSVPDate DATE,
    EventID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ClubID) REFERENCES Clubs(ClubID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Membership (
    MembershipID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    ClubID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ClubID) REFERENCES Clubs(ClubID) ON DELETE CASCADE
);

CREATE TABLE Posts (
    PostID INT AUTO_INCREMENT PRIMARY KEY,
    PublicStatus BOOLEAN DEFAULT TRUE,
    ClubID INT,
    Content TEXT,
    Title TEXT,
    FOREIGN KEY (ClubID) REFERENCES Clubs(ClubID)
);


/*Test values made by Oliver */


INSERT INTO Users (Username, Password, Email, FirstName, LastName, DateOfBirth, AdminStatus, ClubManagerStatus)
VALUES
    ('jane_smith', 'testUser1', 'jane@example.com', 'Jane', 'Smith', '1995-06-15', FALSE, TRUE),
    ('alex_wong', 'testUser2', 'alex@example.com', 'Alex', 'Wong', '1988-12-10', TRUE, FALSE),
    ('Admin', '$2b$10$zcgHFhVoL9pHQ3pOf/mXwO7LleSjmjchp2t8R9XFSNu/R46NXbL/m', 'admin@example.com', 'Admin', 'User', '1000-01-01', TRUE, FALSE),
    ('sam_jones', 'testUser3', 'sam@example.com', 'Sam', 'Jones', '2000-03-22', FALSE, TRUE);

INSERT INTO Clubs (AboutUs, Name, ClubManagerID, DateCreated, ClubLogo)
VALUES ('About Club A', 'Club A', 3, '2023-01-01', NULL),
       ('About Club B', 'Club B', 2, '2023-02-01', NULL);

INSERT INTO Membership (UserID, ClubID)
VALUES (1, 1), (2, 1);

INSERT INTO Membership (UserID, ClubID)
VALUES (1, 1), (2, 1);


-- Retrieve the UserID for the user "jane_smith"
SET @janeUserID := (SELECT UserID FROM Users WHERE Username = 'jane_smith');

-- Update the Club A's ClubManagerID with the UserID of "jane_smith"
UPDATE Clubs
SET ClubManagerID = @janeUserID
WHERE Name = 'Club A';

-- Retrieve the UserID for the user "sam_jones"
SET @userID := (SELECT UserID FROM Users WHERE Username = 'sam_jones');

-- Update Club B's ClubManagerID with the UserID of "sam_jones"
UPDATE Clubs
SET ClubManagerID = @userID
WHERE ClubID = (SELECT ClubID FROM (SELECT ClubID FROM Clubs WHERE Name = 'Club B') AS temp);


-- Retrieve the ClubID for Club A
SET @clubID := (SELECT ClubID FROM Clubs WHERE Name = 'Club A');

-- Insert a new event for Club A
INSERT INTO Events (EventName, Description, Time, Date, Address, ClubID)
VALUES ('Club A Event', 'This is an event for Club A.', '18:00:00', '2023-06-01', '123 Main St', @clubID);

-- Retrieve the ClubID for Club B
SET @clubID := (SELECT ClubID FROM Clubs WHERE Name = 'Club B');

-- Insert a new event for Club B
INSERT INTO Events (EventName, Description, Time, Date, Address, ClubID)
VALUES ('Club B Event', 'This is a new event for Club B.', '18:00:00', '2023-06-01', '123 Main St, City', @clubID);