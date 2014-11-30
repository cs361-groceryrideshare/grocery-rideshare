/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/

function submitData()
{
    var distance = document.forms["rshare-search-frm"].elements["distance"].value;
    var destination = document.forms["rshare-search-frm"].elements["destination"].value;
    //var owner = document.forms["rshare-search-frm"].elements["owner"].value;
    //var date_start = document.forms["rshare-search-frm"].elements["beg-date"].value;
    //var date_end = document.forms["rshare-search-frm"].elements["end-date"].value;
    var locationX = document.forms["rshare-search-frm"].elements["lat"].value;
    var locationY = document.forms["rshare-search-frm"].elements["lng"].value;
//    var q_str= 'Rideshare_DB.php?act=query&table_name=Rideshare&distance='+distance+'&destination='+destination+
//            '&date_start='+date_start+'&date_end='+date_end+'&locationX='+locationX+'&locationY='+locationY;
    var q_str= 'Rideshare_DB.php?act=query&table_name=Rideshare&distance='+distance+'&destination='+destination+
            '&locationX='+locationX+'&locationY='+locationY;
    connectDatabase(q_str, showResults, { distance: 1, pickup: 1, destination: 1, date_start: 1, date_end: 1});
    //alert(distance+' '+pickup+' '+destination+' '+date_start+' '+date_end);
}

function joinRideshare(table, button)
{
    
    var rid = table.getAttribute("data-rideshareID");
    //alert("joining rideshare: "+rid);
    var q_str= 'Rideshare_DB.php?act=join_rideshare&rideshare_ID='+rid;
    //alert(q_str);
    connectDatabase(q_str, updateCapacity, { rideshare_ID: rid});
    
    var c = table.firstChild;
    button.innerHTML = "Joined!";
    button.onclick = function(){};
}

function showResults(response, args)
{
    // Get the div that will contain the results
    var resultsParent = document.getElementById("resultsDiv");
    // If div containing results exists, delete it
    if (document.getElementById("results"))
    {
        var resultsNode = document.getElementById("results");
        resultsNode.parentNode.removeChild(resultsNode);
    }
    // Create a div for new results, set id to "results", and append to resultsDiv
    var newDiv = document.createElement("div");
    newDiv.className = "result-display";
    newDiv.setAttribute("id", "results");
    resultsParent.appendChild(newDiv);
    // Display results
    for(var i = 0; i < response.length; i++)
    {
        var newP = document.createElement("p");
        var resultsString = '';
        // Loop through keys, adding them and their values to the p element
        Object.keys(response[i]).forEach(function (element){
                      
            switch(element)
            {
                case "rideshare_ID":
                    newP.setAttribute("data-rideshareID", response[i][element]);
                    //alert(newP.getAttribute("data-rideshareID"));
                    break;
                case "ride_date":
                    resultsString = resultsString + "Date/Time: " + ' ' + response[i][element] + '<br />';
                    newP.setAttribute("data-rideDate", response[i][element]);
                    break;
                case "user_first_name":
                    resultsString = resultsString + "Owner: " + ' ' + response[i][element] + ' ' + response[i]['user_last_name'] + '<br />';                                    
                    break;
                case "user_last_name":
                    break;
                case "UID":
                    newP.setAttribute("data-UID", response[i][element]);
                    break;
                case "capacity":
                    resultsString = resultsString + "Room Left: " + ' ' + response[i][element] + '<br />';
                    newP.setAttribute("data-capacity", response[i][element]);                    
                    break;
                case "distance":
                    resultsString = resultsString + "Distance to Pickup: " + ' ' + response[i][element] + '<br />';
                    newP.setAttribute("data-distance", response[i][element]);                      
                    break;
                case "pickup_lat":
                    newP.setAttribute("data-plat", response[i][element]);  
                    break;
                case "pickup_lng":
                    newP.setAttribute("data-plng", response[i][element]);  
                    break;
                case "pickup_addr":
                    resultsString = resultsString + "Pickup Address: " + ' ' + response[i][element] + '<br />';
                    break;
            }
        });
       
        newP.innerHTML = resultsString;      
        document.getElementById("results").appendChild(newP);
        var join_button = document.createElement("BUTTON");
        newP.appendChild(join_button);
        join_button.onclick = function(){ joinRideshare(this.parentNode, this); };
        join_button.innerHTML = "Join Rideshare";
        if(newP.dataset.capacity <= 0)
        {
            join_button.disabled = true;
        }
        
    }
}

function updateCapacity(response, args)
{
    // intenionally left blank;
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

var x = document.getElementById("resultsDiv");
var lat = document.getElementById("lat");
var lng = document.getElementById("lng");
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

function lookupAddr() 
{
    var results = document.getElementById("resultsDiv");
    var address = document.getElementById("addr").value;
}

function getLocation() 
{
    if (navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition(showPosition);
    } 
    else 
    {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) 
{
    x.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
    lat.value = position.coords.latitude;
    lng.value = position.coords.longitude;
}

function codeAddress() 
{
    var address = document.getElementById('addr').value;
    var x = document.getElementById("resultsDiv");
    geocoder.geocode( 
        { 'address': address }, 
        function(results, status) 
        {
            if (status == google.maps.GeocoderStatus.OK) 
            {
                lat.value = results[0].geometry.location.lat();
                lng.value = results[0].geometry.location.lng();
            } 
            else 
            {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        }
    );
}

function codeLatLng(lat, lng, fill_form) {
    //var lat = document.getElementById("lat");
    //var lng = document.getElementById("lng");
    var address = document.getElementById("addr");
    var latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode(
        {'latLng': latlng}, 
        function(results, status) 
        {
            if (status == google.maps.GeocoderStatus.OK) 
            {
                if (results[0]) {
                    // address.value = results[1].formatted_address;
                    // alert(results[0].formatted_address);
                    if(fill_form === 1)
                    {
                        x.innerHTML = results[0].formatted_address;
                        address.value = results[0].formatted_address;
                    }
                    else 
                    {
                        return results[0];                   
                    }
                }
                else {
                    alert('No results found');
                }
 
            }
            else
            {
                alert('Geocoder failed due to: ' + status);
            }

        }
    );
}
google.maps.event.addDomListener(window, 'load', initialize);

