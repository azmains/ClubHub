DROP DATABASE ClubHub;
SOURCE /workspaces/23S1_WDC_UG064_WDC/db/db.sql;
USE ClubHub;
INSERT INTO Posts (PublicStatus, ClubID, Content, Title)  VALUES (TRUE, 1, 'This is a temporary post.', 'Temporary Post Title');
UPDATE Clubs SET ClubManagerID = 3 WHERE ClubID = 1;
SELECT * FROM Membership;
SELECT * FROM Clubs;
SELECT * FROM Users;