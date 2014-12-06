var pickupX;
var pickupY;
var destX;
var destY;

function makeRideshare()
{
    var ownerID = 2;
    var p_addr = document.getElementById('pick_addr').value;
    var d_addr = document.getElementById('dest_addr').value;
    var d_name = document.getElementById('dest_name').value;
    var r_cap = document.getElementById('capacity').value;
    var r_date = document.getElementById('date').value;

    var p_locX = parseFloat(pickupX).toFixed(6);
    var p_locY = parseFloat(pickupY).toFixed(6);  
 
    var d_locX = parseFloat(destX).toFixed(6);
    var d_locY = parseFloat(destY).toFixed(6);      
    
    var q_str= "Rideshare_DB.php?act=addRideshare"
            +"&ownerID="+ownerID
            +"&capacity="+r_cap
            +"&pickup_locX="+p_locX
            +"&pickup_locY="+p_locY
            +"&pickup_addr="+p_addr+""
            +"&dest_locX="+d_locX
            +"&dest_locY="+d_locY
            +"&dest_name="+d_name+""
            +"&dest_addr="+d_addr+""
            +"&ridedate="+r_date+"";
    
    //alert(q_str);
    connectDatabase(q_str, postMakeFunc, { distance: 1, pickup: 1, destination: 1, date_start: 1, date_end: 1});    
}

function postMakeFunc()
{
    var msg_div = document.getElementById("message_div");
    msg_div.innerHTML = '<br>Rideshare created!';
    
    document.getElementById('pick_addr').value = "";
    document.getElementById('dest_addr').value = "";
    document.getElementById('dest_name').value = "";
    document.getElementById('capacity').value = "";
    document.getElementById('date').value = "";    
    
    
    //alert('rideshare created!');
}

function connectDatabase(url, func, funcArgs)
{
    var httpReq;
    
    if(window.XMLHttpRequest)
    { httpReq = new XMLHttpRequest(); }
    else if(window.ActiveXObject)
    {
        try
            { httpReq = new ActiveXObject("Msxml2.XMLHTTP"); }
        catch(e)
        {
            try
                { httpReq = new ActiveXObject("Microsoft.XMLHTTP"); }
            catch(e)
                {}
        }
    }
    
    if(!httpReq)
    {
        alert('ERROR: cannot create XMLHTTP instance');
        return;
    }
    
    httpReq.onreadystatechange = responseContent;
    httpReq.open('POST', url, true);
    httpReq.send(null);
    
    function responseContent()
    {
        if(httpReq.readyState === 4)
        {
            if(httpReq.status === 200)
            {
                // Uncomment the line below to alert the results returned
                //alert(httpReq.responseText);
                //func(JSON.parse(httpReq.responseText), funcArgs);
                func();
            }
            else
            {
                alert('ERROR: there was a problem with the request');
            }
        }
    }
}

//var x = document.getElementById("resultsDiv");
//var lat = document.getElementById("lat");
//var lng = document.getElementById("lng");
function initialize() 
{
    geocoder = new google.maps.Geocoder();
    // var latlng = new google.maps.LatLng(40.730885,-73.997383);
    // var mapOptions = {
    // zoom: 8,
    // center: latlng,
    // mapTypeId: 'roadmap'
    // }
    // map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function codeAddress(address, callback) 
{
    //var lat;
    //var lng;
    //alert(address);
    var lat = document.getElementById("lat");
    var lng = document.getElementById("lng");    
    geocoder.geocode( 
        { 'address': address }, 
        function(results, status) 
        {
            if (status == google.maps.GeocoderStatus.OK) 
            {
                lat.value = results[0].geometry.location.lat();
                lng.value = results[0].geometry.location.lng();
                callback(lat.value, lng.value);
            } 
            else 
            {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        }
    );
    
//    alert('in codeAddress: '+lat.value);
//    alert('in codeAddress: '+lng.value);
}

function getPickupLocs(lat, lng)
{
    pickupX = lat;
    pickupY = lng;
    codeAddress(document.getElementById('dest_addr').value, getDestLocs);
}

function getDestLocs(lat, lng)
{
    destX = lat;
    destY = lng;
    makeRideshare();
}

google.maps.event.addDomListener(window, 'load', initialize);