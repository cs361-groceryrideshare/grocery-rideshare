SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `Rideshare`;
DROP TABLE IF EXISTS `RideshareDate`;
DROP TABLE IF EXISTS `RideDestination`;
DROP TABLE IF EXISTS `RideshareUser`;

CREATE TABLE `Rideshare`
(
    `rideshare_ID` smallint AUTO_INCREMENT, 
    `UID` smallint NOT NULL,
    `capacity` smallint NOT NULL,
    `max_capacity` smallint NOT NULL,
    `DID` smallint NOT NULL,
    `pickup_lat` decimal(9,6) NOT NULL,
    `pickup_lng` decimal(9,6) NOT NULL,
    `pickup_addr` varchar(255) NOT NULL,
    PRIMARY KEY (`rideshare_ID`),
    CONSTRAINT `Rideshare_owner_ID_fkey_user_ID` FOREIGN KEY (`UID`) REFERENCES `RideshareUser`(`user_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Rideshare_destination_ID_fkey_user_ID` FOREIGN KEY (`DID`) REFERENCES `RideDestination`(`destination_ID`) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE=InnoDB;

CREATE TABLE `RideshareDate`
(
    `date_ID` smallint AUTO_INCREMENT,
    `RID` smallint NOT NULL,
    `ride_date` datetime NOT NULL,
    PRIMARY KEY (`date_ID`),
    CONSTRAINT `Rideshare_ID_fkey_RID` FOREIGN KEY (`RID`) REFERENCES `Rideshare`(`rideshare_ID`) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE=InnoDB;

CREATE TABLE `RideDestination`
(
    `destination_ID` smallint AUTO_INCREMENT, 
    `GPS_lat` decimal(9,6) NOT NULL,
    `GPS_lng` decimal(9,6) NOT NULL,
    `dest_name` varchar(30) NOT NULL,
    PRIMARY KEY (`destination_ID`)
)ENGINE=InnoDB;

CREATE TABLE `RideshareUser`
(
    `user_ID` smallint AUTO_INCREMENT,
    `user_first_name` varchar(30),
    `user_last_name` varchar(30),
    PRIMARY KEY (`user_ID`)
)ENGINE=InnoDB;

INSERT INTO `RideshareUser` (`user_first_name`, `user_last_name`)
    VALUES
    ('John', 'Doe'),
    ('Jane', 'Doe'),
    ('Silas','Lithburg'),
    ('Pascal','Vari'),
    ('Ignatius', 'Quemar'), 
    ('Lark','Sivlos'), 
    ('Ada','Lovelace');

INSERT INTO `RideDestination` (`GPS_lat`, `GPS_lng`, `dest_name`)
    VALUES
    (47.675293, -122.316237, 'Whole Foods'),
    (47.692817, -122.376036, 'Grocery Outlet'),
    (47.612371, -122.295657, 'Grocery Outlet'),
    (47.670402, -122.387101, 'QFC'),
    (47.637189, -122.377047, 'Whole Foods'),
    (47.662707, -122.317641, "Trader Joe's"),
    (47.636569, -122.356793, "Trader Joe's");
    

INSERT INTO `Rideshare` (`UID`, `capacity`, `max_capacity`, `DID`, `pickup_lat`, `pickup_lng`, `pickup_addr`)
    VALUES
    (
        (SELECT `user_ID` FROM `RideshareUser` AS RS WHERE RS.user_first_name = 'John' AND RS.user_last_name = 'Doe'),
        4, 4,
        (SELECT `destination_ID` FROM `RideDestination` AS RD WHERE RD.dest_name = 'Whole Foods' AND RD.GPS_lat= 47.675293),
        47.613872, -122.321639, "placeholder"
    ),
    (
        (SELECT `user_ID` FROM `RideshareUser` AS RS WHERE RS.user_first_name = 'Jane' AND RS.user_last_name = 'Doe'),
        2, 2,
        (SELECT `destination_ID` FROM `RideDestination` AS RD WHERE RD.dest_name = 'Grocery Outlet' AND RD.GPS_lat= 47.692817),
        47.602251, -122.327881, "placeholder"
    ),
    (
        (SELECT `user_ID` FROM `RideshareUser` AS RS WHERE RS.user_first_name = 'Silas' AND RS.user_last_name = 'Lithburg'),
        5, 5,
        (SELECT `destination_ID` FROM `RideDestination` AS RD WHERE RD.dest_name = 'Grocery Outlet' AND RD.GPS_lat= 47.612371),
        47.588310, -122.298675, "placeholder"
    ),
    (
        (SELECT `user_ID` FROM `RideshareUser` AS RS WHERE RS.user_first_name = 'Pascal' AND RS.user_last_name = 'Vari'),
        3, 3,
        (SELECT `destination_ID` FROM `RideDestination` AS RD WHERE RD.dest_name = 'QFC' AND RD.GPS_lat= 47.670402),
        47.599293, -122.302228, "placeholder"
    ),
    (
        (SELECT `user_ID` FROM `RideshareUser` AS RS WHERE RS.user_first_name = 'Ignatius' AND RS.user_last_name = 'Quemar'),
        3, 3,
        (SELECT `destination_ID` FROM `RideDestination` AS RD WHERE RD.dest_name = 'Whole Foods' AND RD.GPS_lat = 47.637189),
        47.681314, -122.384314, "placeholder"
    ),
    (
        (SELECT `user_ID` FROM `RideshareUser` AS RS WHERE RS.user_first_name = 'Lark' AND RS.user_last_name = 'Sivlos'),
        3, 3,
        (SELECT `destination_ID` FROM `RideDestination` AS RD WHERE RD.dest_name = "Trader Joe's" AND RD.GPS_lat = 47.662707),
        47.679159, -122.286285, "placeholder"
    ),
    (
        (SELECT `user_ID` FROM `RideshareUser` AS RS WHERE RS.user_first_name = 'Ada' AND RS.user_last_name = 'Lovelace'),
        3, 3,
        (SELECT `destination_ID` FROM `RideDestination` AS RD WHERE RD.dest_name = "Trader Joe's" AND RD.GPS_lat = 47.636569),
        47.712533, -122.322578, "placeholder"
    );

INSERT INTO `RideshareDate` (`RID`, `ride_date`)
    VALUES
    (
        (SELECT `rideshare_ID` FROM `Rideshare` AS RD WHERE RD.rideshare_ID = '1'),
        '2012-12-31 11:34:22'
    ),
    (
        (SELECT `rideshare_ID` FROM `Rideshare` AS RD WHERE RD.rideshare_ID = '2'),
        '2013-01-01 10:30:00'
    ),
    (
        (SELECT `rideshare_ID` FROM `Rideshare` AS RD WHERE RD.rideshare_ID = '3'),
        '2013-02-03 10:30:00'
    ),
    (
        (SELECT `rideshare_ID` FROM `Rideshare` AS RD WHERE RD.rideshare_ID = '4'),
        '2013-03-07 10:30:00'
    ),
    (
        (SELECT `rideshare_ID` FROM `Rideshare` AS RD WHERE RD.rideshare_ID = '5'),
        '2013-05-08 10:30:00'
    ),
    (
        (SELECT `rideshare_ID` FROM `Rideshare` AS RD WHERE RD.rideshare_ID = '6'),
        '2013-05-08 12:30:00'
    ),
    (
        (SELECT `rideshare_ID` FROM `Rideshare` AS RD WHERE RD.rideshare_ID = '7'),
        '2013-07-23 10:30:00'
    );

