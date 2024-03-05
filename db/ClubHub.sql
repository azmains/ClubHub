-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: ClubHub
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `BookedEvents`
--

DROP TABLE IF EXISTS `BookedEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BookedEvents` (
  `RSVPID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `ClubID` int DEFAULT NULL,
  `RSVPDate` date DEFAULT NULL,
  `EventID` int DEFAULT NULL,
  PRIMARY KEY (`RSVPID`),
  KEY `UserID` (`UserID`),
  KEY `ClubID` (`ClubID`),
  KEY `EventID` (`EventID`),
  CONSTRAINT `BookedEvents_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BookedEvents_ibfk_2` FOREIGN KEY (`ClubID`) REFERENCES `Clubs` (`ClubID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BookedEvents_ibfk_3` FOREIGN KEY (`EventID`) REFERENCES `Events` (`EventID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BookedEvents`
--

LOCK TABLES `BookedEvents` WRITE;
/*!40000 ALTER TABLE `BookedEvents` DISABLE KEYS */;
/*!40000 ALTER TABLE `BookedEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Clubs`
--

DROP TABLE IF EXISTS `Clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Clubs` (
  `ClubID` int NOT NULL AUTO_INCREMENT,
  `AboutUs` text,
  `Name` varchar(255) NOT NULL,
  `ClubManagerID` int DEFAULT NULL,
  `DateCreated` date DEFAULT NULL,
  `ClubLogo` blob,
  PRIMARY KEY (`ClubID`),
  KEY `ClubManagerID` (`ClubManagerID`),
  CONSTRAINT `Clubs_ibfk_1` FOREIGN KEY (`ClubManagerID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Clubs`
--

LOCK TABLES `Clubs` WRITE;
/*!40000 ALTER TABLE `Clubs` DISABLE KEYS */;
INSERT INTO `Clubs` VALUES (1,'About Club A','Club A',7,'2023-01-01',NULL),(2,'About Club B','Club B',4,'2023-02-01',NULL),(4,NULL,'bob\'s clubs',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Clubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `EventName` varchar(255) DEFAULT NULL,
  `Description` text,
  `Time` time DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `Address` varchar(300) DEFAULT NULL,
  `ClubID` int DEFAULT NULL,
  PRIMARY KEY (`EventID`),
  KEY `ClubID` (`ClubID`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`ClubID`) REFERENCES `Clubs` (`ClubID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES (1,'Club A Event','This is an event for Club A.','18:00:00','2023-06-01','123 Main St',1),(2,'Club B Event','This is a new event for Club B.','18:00:00','2023-06-01','123 Main St, City',2);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Membership`
--

DROP TABLE IF EXISTS `Membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Membership` (
  `MembershipID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `ClubID` int DEFAULT NULL,
  PRIMARY KEY (`MembershipID`),
  KEY `UserID` (`UserID`),
  KEY `ClubID` (`ClubID`),
  CONSTRAINT `Membership_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Membership_ibfk_2` FOREIGN KEY (`ClubID`) REFERENCES `Clubs` (`ClubID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Membership`
--

LOCK TABLES `Membership` WRITE;
/*!40000 ALTER TABLE `Membership` DISABLE KEYS */;
INSERT INTO `Membership` VALUES (1,1,1),(2,2,1),(3,1,1),(4,2,1),(7,3,1),(12,7,1);
/*!40000 ALTER TABLE `Membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Posts` (
  `PostID` int NOT NULL AUTO_INCREMENT,
  `PublicStatus` tinyint(1) DEFAULT '1',
  `ClubID` int DEFAULT NULL,
  `Content` text,
  `Title` text,
  PRIMARY KEY (`PostID`),
  KEY `ClubID` (`ClubID`),
  CONSTRAINT `Posts_ibfk_1` FOREIGN KEY (`ClubID`) REFERENCES `Clubs` (`ClubID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Posts`
--

LOCK TABLES `Posts` WRITE;
/*!40000 ALTER TABLE `Posts` DISABLE KEYS */;
INSERT INTO `Posts` VALUES (1,1,1,'This is a temporary post.','Temporary Post Title');
/*!40000 ALTER TABLE `Posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `AdminStatus` tinyint(1) DEFAULT '0',
  `ClubManagerStatus` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'jane_smith','testUser1','jane@example.com','Jane','Smith','1995-06-15',0,1),(2,'alex_wong','testUser2','alex@example.com','Alex','Wong','1988-12-10',1,0),(3,'Admin','$2b$10$zcgHFhVoL9pHQ3pOf/mXwO7LleSjmjchp2t8R9XFSNu/R46NXbL/m','admin@example.com','Admin','User','1000-01-01',1,0),(4,'sam_jones','testUser3','sam@example.com','Sam','Jones','2000-03-22',0,1),(5,'the','$2b$10$4YI0wLNHtUQZFYP4eJv2lOJ8TB9iWTsOidddQY6YhuWxzYmcD59zW','the@gmail.com','the','bor',NULL,0,0),(7,'bob','$2b$10$JT4G3xa90YKUdjXcQubo9uowiUNRAoyzQUiCTA868cYxDL42WNv5G','bob@gmail.com','bob','jane',NULL,1,1);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-09 14:29:59
