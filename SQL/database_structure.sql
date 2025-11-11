CREATE TABLE `Artist` (
  `ArtistName` varchar(75) NOT NULL,
  PRIMARY KEY (`ArtistName`)
)

CREATE TABLE `CollectedIssues` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(75) NOT NULL,
  `XmenAdj` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`)
)

CREATE TABLE `Color` (
  `ColorName` varchar(75) NOT NULL,
  PRIMARY KEY (`ColorName`)
)

CREATE TABLE `Entry` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `DateString` datetime NOT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`,`DateString`)
)

CREATE TABLE `Inker` (
  `InkerName` varchar(75) NOT NULL,
  PRIMARY KEY (`InkerName`)
)

CREATE TABLE `IssueArtist` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `ArtistName` varchar(75) NOT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`,`ArtistName`)
)

CREATE TABLE `IssueColor` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `ColorName` varchar(75) NOT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`,`ColorName`)
)

CREATE TABLE `IssueInker` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `InkerName` varchar(75) NOT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`,`InkerName`)
)

CREATE TABLE `IssuePenciller` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `PencillerName` varchar(75) NOT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`,`PencillerName`)
)

CREATE TABLE `IssueWriter` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `WriterName` varchar(75) NOT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`,`WriterName`)
)

CREATE TABLE `Penciller` (
  `PencillerName` varchar(75) NOT NULL,
  PRIMARY KEY (`PencillerName`)
)

CREATE TABLE `RealIssue` (
  `IssueName` varchar(75) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `XmenAdj` tinyint(1) DEFAULT NULL,
  `issueID` int DEFAULT NULL,
  `coverURL` varchar(255) DEFAULT NULL,
  `Color` tinyint(1) DEFAULT NULL,
  `Inker` tinyint(1) DEFAULT NULL,
  `Penciller` tinyint(1) DEFAULT NULL,
  `Writer` tinyint(1) DEFAULT NULL,
  `Artist` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`IssueName`,`SeriesName`)
)

CREATE TABLE `Series` (
  `SeriesName` varchar(100) NOT NULL,
  `Publisher` varchar(75) DEFAULT NULL,
  `Xmen` tinyint(1) DEFAULT NULL,
  `seriesID` int DEFAULT NULL,
  PRIMARY KEY (`SeriesName`)
)

CREATE TABLE `Writer` (
  `WriterName` varchar(75) NOT NULL,
  PRIMARY KEY (`WriterName`)
)

CREATE TABLE `publisher` (
  `publisher` varchar(100) NOT NULL,
  `list_order` int DEFAULT NULL,
  PRIMARY KEY (`publisher`)
)