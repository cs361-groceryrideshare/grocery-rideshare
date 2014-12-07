var pickupX;
var pickupY;
var destX;
var destY;

window.onload = function(){ load_logname();};

function load_logname()
{  
    var log_div = document.getElementById("logdiv");
    var log_tbl = document.getElementById('logTbl');
    if(log_tbl)
    {
        log_div.removeChild(log_tbl);
    }
    
    log_tbl = document.createElement(('table'));
    
    var log_tbl_bdy = document.createElement('tbody');
    var log_tbl_row = document.createElement('tr');
    var log_tbl_td1 = document.createElement('td');   
    var log_tbl_td2 = document.createElement('td');
    
    var log_link = document.createElement('a');
    log_link.setAttribute('id', 'log_link');
    
    log_tbl.setAttribute('id', 'logTbl');
    
    log_tbl_td1.setAttribute('id', 'logTD1');
    log_tbl_td2.setAttribute('id', 'logTD2');
    
    log_tbl_row.appendChild(log_tbl_td1);
    log_tbl_row.appendChild(log_tbl_td2);
    log_tbl_bdy.appendChild(log_tbl_row);
    log_tbl.appendChild(log_tbl_bdy);
    
    if(sessionStorage.uname)
    {
        if(sessionStorage.uname === 'none')
        {
            log_link.setAttribute('href', 'Rideshare_Mainpage_HTML.html');
            log_link.innerHTML = 'LOG IN';
            log_tbl_td1.appendChild(log_link);
            document.getElementById('msgTblText').innerHTML = 'Not logged in, redirecting to main page...';
            var delay=2000;
            setTimeout(function(){window.location.href = 'Rideshare_Mainpage_HTML.html';}, delay);            
        }
        else
        {
            log_link.setAttribute('href', 'Rideshare_Mainpage_HTML.html');
            log_link.onclick = function(){ logOut(); };
            log_link.innerHTML = 'LOG OUT';
            log_tbl_td1.appendChild(log_link);
            log_tbl_td2.innerHTML = "Logged in as: "+sessionStorage.uname;
        }
    }
    else
    {       
        log_link.setAttribute('href', 'Rideshare_Mainpage_HTML.html');
        log_link.innerHTML = 'LOG IN';
        log_tbl_td1.appendChild(log_link);
        document.getElementById('msgTblText').innerHTML = 'Not logged in, redirecting to main page...';
        var delay=2000;
        setTimeout(function(){window.location.href = 'Rideshare_Mainpage_HTML.html';}, delay);     
    }      
    log_div.appendChild(log_tbl);
}

function logOut()
{
    sessionStorage.uname = 'none';
    sessionStorage.UID = -1;
    return true;
}

function makeRideshare()
{
    var ownerID = sessionStorage.UID;
    var p_addr = document.getElementById('pick_addr').value;
    var d_addr = document.getElementById('dest_addr').value;
    var d_name = document.getElementById('dest_name').value;
    var r_cap = document.getElementById('capacity').value;
    var r_date = document.getElementById('date').value;
    var r_time = document.getElementById('time').value;
    var r_date_time = r_date+' '+r_time;

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
            +"&ridedate="+r_date_time+"";
    
    //alert(q_str);
    connectDatabase(q_str, postMakeFunc, { distance: 1, pickup: 1, destination: 1, date_start: 1, date_end: 1});    
}

function postMakeFunc(resObj, argObj)
{
    var msg_div = document.getElementById("msgTblText");
    alert(resObj['result']);
    switch(resObj['result'])
    {
        case 'ADD_ERROR':
        case 'ADD_ERROR_DEST_INSERT':
        case 'ADD_ERROR_DEST_SELECT':
        case 'ADD_ERROR_RS_CHECK': 
        case 'ADD_ERROR_RS_INSERT':
        case 'ADD_ERROR_DATE_INSERT':
            msg_div.innerHTML = 'Error: rideshare creation failed';
            break;
        case 'RS_EXISTS':
            msg_div.innerHTML = 'Rideshare already exists';
            break;             
        case 'OK': 
            msg_div.innerHTML = 'Rideshare created!';
            break;       
    }    
    document.getElementById('pick_addr').value = "";
    document.getElementById('dest_addr').value = "";
    document.getElementById('dest_name').value = "";
    document.getElementById('capacity').value = "";
    document.getElementById('date').value = "";    
    document.getElementById('time').value = ""; 
    
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
                alert(httpReq.responseText);
                func(JSON.parse(httpReq.responseText), funcArgs);
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