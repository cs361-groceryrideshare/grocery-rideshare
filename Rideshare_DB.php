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
    
    $distance = $_REQUEST['distance']; // distance in miles -> GPS    
    $locationX = $_REQUEST['locationX']; // user location X GPS coord
    $locationY = $_REQUEST['locationY']; // user locatoin Y GPS coord
    $destination = $_REQUEST['destination']; // name

    //$locationX = 47.693928;
    //$locationY = -122.306676;    
    
    switch($act)
    {
        case 'get_table':        
            break;
        case 'insert':
            break;
        case 'query':           
            $result = MakeQuery($mysqli);               
            break;
        case 'del_row':
            break;
        default:
            break;
    }
    
    echo json_encode(process_result($result));
    mysqli_close($mysqli);
 
    function MakeQuery($mysqli)
    {
        global $distance, $locationX, $locationY, $destination;
        
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
        
        $q_str = "SELECT RSE_RD.rideshare_ID, RSE_RD.ride_date, RDS.dest_name, RSU.user_first_name, RSU.user_last_name, RSE_RD.pickup_lat, RSE_RD.pickup_lng "
        ."FROM "
        ."("
                ."SELECT RSE.rideshare_ID, RSE.DID, RSE.UID, RSE.pickup_lat, RSE.pickup_lng, RD.ride_date FROM "
                ."("
                        ."SELECT RideshareDate.RID, RideshareDate.ride_date FROM `RideshareDate`"                 
                .") AS RD "
                ."INNER JOIN "//."INNER JOIN `Rideshare` RSE ON RSE.rideshare_ID = RD.RID"
                ."("
                        ."SELECT Rideshare.rideshare_ID, Rideshare.DID, Rideshare.UID, Rideshare.pickup_lat, Rideshare.pickup_lng FROM `Rideshare` ".$sub_q_distance
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
    
    function process_result($result)
    {
        switch($_REQUEST['act'])
        {
            case 'query':
                global $locationX, $locationY;
                while($row = mysqli_fetch_array($result, MYSQLI_ASSOC))
                {
                    $dist = getDistance($locationX, $locationY, $row['pickup_lat'], $row['pickup_lng']);
                    $dist = round($dist, 6, PHP_ROUND_HALF_UP);
                    unset($row['pickup_lat']);
                    unset($row['pickup_lng']);
                    $row['distance'] = $dist;
                    $jarr[] = $row;                
                }
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