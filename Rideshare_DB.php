<?php
    ini_set('error_reporting', E_ALL);
    ini_set('display_errors', 'On');   
    ini_set('display_startup_errors', 1);
    error_reporting(-1);

    $act = $_REQUEST['act'];
    
    $mysqli = new mysqli('oniddb.cws.oregonstate.edu','mcqueejo-db','UfrFyrfejhu1toXP','mcqueejo-db');
    
    if(mysqli_connect_error())
    {
        die('Connect Error(' . mysqli_connect_errno() . ') '. mysqli_connect_error());
    }
    
//    $distance = $_REQUEST['distance']; // distance in miles -> GPS    
//    $locationX = $_REQUEST['locationX']; // user location X GPS coord
//    $locationY = $_REQUEST['locationY']; // user locatoin Y GPS coord
//    $destination = $_REQUEST['destination']; // name

    //$locationX = 47.693928;
    //$locationY = -122.306676;    
    
    switch($act)
    {
        case 'login':
            $result = MakeLoginQuery($mysqli);
            echo json_encode($result);          
            mysqli_close($mysqli);                        
            break;
        case 'addAccount':
            $result = MakeAddAccountQuery($mysqli);
            //echo json_encode(array( "result" => "TESTING" ));
            echo json_encode($result); 
            mysqli_close($mysqli);             
            break;
        case 'addRideshare':
            $result = MakeAddRideshareQuery($mysqli);
            echo json_encode($result); 
            mysqli_close($mysqli);              
            break;
        case 'searchRideshare':           
            $result = MakeSearchQuery($mysqli);
            echo json_encode(process_result($result));
            mysqli_close($mysqli);            
            break;
        case 'joinRideshare':
            $result = MakeRideshareJoinQuery($mysqli);
            echo json_encode($result);          
            mysqli_close($mysqli);            
            break;
        default:
            break;
    }
    
    //echo json_encode(process_result($result));
    //mysqli_close($mysqli);
    function MakeLoginQuery($mysqli)
    {
        $username = $_REQUEST['uname'];
        $password = $_REQUEST['pw'];
        
        $q_str = "SELECT user_ID, username FROM `RideshareUser` WHERE"
            ." username='".$username."' AND password='".$password."'";
        
        //echo $q_str;
        $result = $mysqli->query($q_str);
        
        if($result == TRUE)
        {
            if ($result->num_rows >= 1)
            {
                $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
                return array( "result" => "OK", "UID" => $row['user_ID'], "uname" => $row['username'] );
            }
            else 
            {
                return array( "result" => "LOGIN_FAIL");
            }
        }
        else
        {
            return array( "result" => "ERROR");
        }
    }
    
    function MakeAddAccountQuery($mysqli)
    {
        $username = $_REQUEST['username'];
        $password = $_REQUEST['password'];
        $firstname = $_REQUEST['firstname'];
        $lastname = $_REQUEST['lastname'];
 
//        $username = $_REQUEST['username'];
//        $password = $_REQUEST['password'];
//        $firstname = $_REQUEST['firstname'];
//        $lastname = $_REQUEST['lastname'];        
        
        
        $check_qstr = "SELECT user_ID FROM `RideshareUser` WHERE username = '".$username."'";
        //echo $check_qstr;
        $check_res = $mysqli->query($check_qstr);
        //echo ' check res = '.$check_res;
        if($check_res == TRUE)
        {
            if ($check_res->num_rows >= 1)
            {
                //echo 'ALREADY EXISTS ';
                return array( "result" => "UNAME_EXISTS" );
            }
            //echo ' OK ';
        }
        
        $insert_qstr = "INSERT INTO `RideshareUser` (`username`, `password`, `user_first_name`, `user_last_name`) ".
                "VALUES( '".$username."', '".$password."', '".$firstname."', '".$lastname."')";
        
        $result = $mysqli->query($insert_qstr);

        if($result == TRUE)
        {            
            $check_qstr2 = "SELECT user_ID, username FROM `RideshareUser` WHERE username = '".$username."'";
            $check_res2 = $mysqli->query($check_qstr2);
            $row = mysqli_fetch_array($check_res2, MYSQLI_ASSOC);
            return array( "result" => "ADD_OK", "UID" => $row['user_ID'], 'UNAME' => $row['username']);
            
        }
        else
        {
            //echo 'ADD FAIL';
            return array( "result" => "ADD_FAIL" );
        }    
    }
    
    function MakeAddRideshareQuery($mysqli)
    {
        $ownerID = $_REQUEST['ownerID'];
        $capacity = $_REQUEST['capacity'];
        $pickup_locX = $_REQUEST['pickup_locX'];
        $pickup_locY = $_REQUEST['pickup_locY'];
        $pickup_addr = $_REQUEST['pickup_addr'];
        $dest_locX = $_REQUEST['dest_locX'];
        $dest_locY = $_REQUEST['dest_locY'];
        $dest_name = $_REQUEST['dest_name'];
        $dest_addr = $_REQUEST['dest_addr'];
        $ridedate = $_REQUEST['ridedate'];       

        // query string for checking if destination already exists
        $dest_subqstr = "SELECT RD.destination_ID FROM `RideDestination` AS RD "
                ."WHERE RD.dest_name = '".$dest_name."' "
                ."AND RD.GPS_lat = ".$dest_locX." "
                ."AND RD.GPS_lng = ".$dest_locY." ";
        $result1 = $mysqli->query($dest_subqstr);
        
        if($result1 == TRUE)
        {
            if ($result1->num_rows == 0)
            {
                // make RideDestination
                $dest_qstr = "INSERT INTO `RideDestination` (`GPS_lat`, `GPS_lng`, `dest_name`, `dest_addr`)"
                        ." VALUES (".$dest_locX.", ".$dest_locY.", '".$dest_name."', '".$dest_addr."')";     
                $result1 = $mysqli->query($dest_qstr);

                if($result1 == FALSE)
                {            
                    return array( "result" => "ADD_ERROR_DEST_INSERT" );             
                }   
            }            
        }
        else
        {
            return array( "result" => "ADD_ERROR_DEST_SELECT" ); 
        }        

        // query string for checking if rideshare already exists
        $re_subqstr = "SELECT Rideshare.rideshare_ID FROM `Rideshare` "
                ."WHERE UID = ".$ownerID." "
                ."AND capacity = ".$capacity." "
                ."AND DID = (".$dest_subqstr.") "
                ."AND pickup_lat = ".$pickup_locX." "
                ."AND pickup_lng = ".$pickup_locY." ";        
        $result2 = $mysqli->query($re_subqstr);
        
        if($result2 == TRUE)
        {
            if ($result2->num_rows >= 1)
            {
                return array( "result" => "RS_EXISTS" );   
            }            
        }
        else
        {
            return array( "result" => "ADD_ERROR_RS_CHECK" ); 
        }
        
        // make Rideshare
        $rs_qstr = "INSERT INTO `Rideshare` (`UID`, `capacity`, `max_capacity`, `DID`, `pickup_lat`, `pickup_lng`, `pickup_addr`)"
            ." VALUES (".$ownerID.", "
            .$capacity.", "
            .$capacity.", "
            ."(".$dest_subqstr."), "
            .$pickup_locX.", "
            .$pickup_locY.", "
            ."'".$pickup_addr."')";
        $result3 = $mysqli->query($rs_qstr);
        
        if($result3 == FALSE)
        {            
            return array( "result" => "ADD_ERROR_RS_INSERT" );             
        }    
             
        // make Ridedate
        $rd_sqtr = "INSERT INTO `RideshareDate` (`RID`, `ride_date`) "
            ."VALUES ( (".$re_subqstr."), '".$ridedate."')";     
        $result4 = $mysqli->query($rd_sqtr);
        
        
        if($result4 == FALSE)
        {            
            return array( "result" => "ADD_ERROR_DATE_INSERT" );             
        }
        
        return array( "result" => "OK" ); 
    }
    
    function MakeSearchQuery($mysqli)
    {
        $distance = $_REQUEST['distance']; // distance in miles -> GPS    
        $locationX = $_REQUEST['locationX']; // user location X GPS coord
        $locationY = $_REQUEST['locationY']; // user locatoin Y GPS coord
        $destination = $_REQUEST['destination']; // name
        
        $R = 6371;
        $p = PI() / 180;
        $sqrt_arg = "POW( SIN( ( ( Rideshare.pickup_lat - ".$locationX.") * ".$p." ) / 2 ) , 2) + "
                    ."COS( (".$locationX." * ".$p.") ) * COS( ( Rideshare.pickup_lat * ".$p." ) ) * "
                    ."POW( SIN( ( ( Rideshare.pickup_lng - ".$locationY.") * ".$p." ) / 2 ) , 2)";
        $sub_q_distance = "";
        if($distance != NULL)
        {
            $sub_q_distance = " WHERE ( " 
                    .$R." * "
                            ."(2 * "
                                    ."ATAN2( "
                                            ."SQRT( "
                                                    .$sqrt_arg
                                            ."),"
                                            ."SQRT( 1 - ("
                                                    .$sqrt_arg.")"
                                            .")"
                                    .")"
                            .")"
                    .") <= ".$distance;                       
        }
        else
        {
            $sub_q_distance = " WHERE ( " 
                    .$R." * "
                            ."(2 * "
                                    ."ATAN2( "
                                            ."SQRT( "
                                                    .$sqrt_arg
                                            ."),"
                                            ."SQRT( 1 - ("
                                                    .$sqrt_arg.")"
                                            .")"
                                    .")"
                            .")"
                    .") <= 360";             
        }
        
        $sub_q_destination = "";
        if($destination != NULL)
        {
            $sub_q_destination = " WHERE RideDestination.dest_name = "."'".$destination."'";     
            //$sub_q_destination = " AND RideDestination.dest_name = "."'".$destination."'"; 
        }      
        
        $q_str = "SELECT RSE_RD.rideshare_ID, RSE_RD.ride_date, RDS.dest_name, RSE_RD.UID, "
        . "RSU.user_first_name, RSU.user_last_name, RSE_RD.capacity, RSE_RD.pickup_lat, RSE_RD.pickup_lng, RSE_RD.pickup_addr "
        ."FROM "
        ."("
                ."SELECT RSE.rideshare_ID, RSE.capacity, RSE.DID, RSE.UID, RSE.pickup_lat, RSE.pickup_lng, RSE.pickup_addr, RD.ride_date FROM "
                ."("
                        ."SELECT RideshareDate.RID, RideshareDate.ride_date FROM `RideshareDate`"                 
                .") AS RD "
                ."INNER JOIN "//."INNER JOIN `Rideshare` RSE ON RSE.rideshare_ID = RD.RID"
                ."("
                        ."SELECT Rideshare.rideshare_ID, Rideshare.capacity, Rideshare.DID, Rideshare.UID, "
                        . "Rideshare.pickup_lat, Rideshare.pickup_lng, Rideshare.pickup_addr FROM `Rideshare` ".$sub_q_distance
                .") AS RSE ON RSE.rideshare_ID = RD.RID"
        .") AS RSE_RD "
        ."INNER JOIN "
        ."("
                ."SELECT RideDestination.dest_name, RideDestination.destination_ID FROM `RideDestination`".$sub_q_destination//$sub_q_distance.$sub_q_destination
        .") AS RDS ON RDS.destination_ID = RSE_RD.DID "
        ."INNER JOIN `RideshareUser` RSU ON RSU.user_ID = RSE_RD.UID";
        //echo $q_str;
        $result = $mysqli->query($q_str);
        //echo $result;
        //$row = mysqli_fetch_row($result);

        return $result;
    }
    
    function MakeRideshareJoinQuery($mysqli)
    {
        $rideshare_ID = $_REQUEST['rideshare_ID'];
        $user_ID = $_REQUEST['user_ID'];
        
        $q_str = "SELECT RS_ID, USR_ID FROM `RideshareMember` WHERE RS_ID=".$rideshare_ID." AND USR_ID=".$user_ID;
        $result1 = $mysqli->query($q_str);
        if($result1 == TRUE)
        {
            if ($result1->num_rows >= 1)
            {
                return array( "result" => "IS_MEMBER" );
            }
        }
        else
        {
            return array( "result" => "JOIN_ERROR" ); 
        }
        
        $um_str = "INSERT INTO `RideshareMember` (`RS_ID`, `USR_ID`) "
            ."VALUES ( (".$rideshare_ID."), '".$user_ID."')";
        
        $result2 = $mysqli->query($um_str);
 
        if($result2 != TRUE)
        {
            return array( "result" => "JOIN_ERROR" ); 
        }        
        
        $ur_str = "UPDATE `Rideshare` SET Rideshare.capacity=(Rideshare.capacity - 1) WHERE Rideshare.capacity > 0 AND Rideshare.rideshare_ID = ".$rideshare_ID;
        $result3 = $mysqli->query($ur_str);
        
        if($result3 == TRUE)
        {
            return array( "result" => "JOIN_OK" ); 
        }
        else
        {
            return array( "result" => "JOIN_ERROR" ); 
        }               
    }
    
    function process_result($result)
    {
        switch($_REQUEST['act'])
        {
            case 'addRideshare':
                if($result == FALSE)
                {
                    $arr[] = array( "result" => "FAIL" );
                    return $arr;                    
                }
                else
                {
                    $arr[] = array( "result" => "OK" );
                    return $arr;                      
                }
                return $jarr;            
            case 'searchRideshare':  
                $locationX = $_REQUEST['locationX']; // user location X GPS coord
                $locationY = $_REQUEST['locationY']; // user locatoin Y GPS coord
                
                if($result == FALSE)
                {
                    $arr[] = array( "result" => "FAIL" );
                    return $arr;
                }
                else if($result->num_rows == 0)
                {
                    $arr[] = array( "result" => "NONE" );
                    return $arr;
                }
                
                while($row = mysqli_fetch_array($result, MYSQLI_ASSOC))
                {
                    $dist = getDistance($locationX, $locationY, $row['pickup_lat'], $row['pickup_lng']);
                    $dist = round($dist, 6, PHP_ROUND_HALF_UP);
                    $row['distance'] = $dist;
                    $row['result'] = 'OK';
                    $jarr[] = $row;
                }
                
                return $jarr; 
            case 'joinRideshare':
                $jarr[] = $result;
                return $jarr;
            default:
                break;
        }       
    }
    
  function getDistance($lat1,$lon1,$lat2,$lon2)
  {
      $R = 6371;
      $dLat = deg2rad($lat2 - $lat1);
      $dLon = deg2rad($lon2 - $lon1);
      $a = SIN($dLat/2) * SIN($dLat/2) + COS(deg2rad($lat1)) * COS(deg2rad($lat2)) * SIN($dLon/2) * SIN($dLon/2);
      $c = 2 * ATAN2(sqrt( $a ),sqrt( 1 - $a ));
      $d = $R * $c;
      return $d;
  }
  
  function deg_to_rad($deg)
  {
      $rad = $deg * ( PI() / 180 );
      return $rad;
  }
?>