/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/
window.onload = setCSS();

function setCSS()
{
//    document.getElementById('sb1').style.width = document.getElementById('row1').width + 'px';
//    document.getElementById('sb2').style.width = document.getElementById('row1').style.width;// + 'px';
//    document.getElementById('addr').style.width = document.getElementById('row1').style.width;// + 'px';
}

function submitData()
{
    var distance = document.getElementById('distance').value;
    var destination = document.getElementById('destination').value;//document.forms["rshare-search-frm"].elements["destination"].value;
    var locationX = document.getElementById('lat').value;//document.forms["rshare-search-frm"].elements["lat"].value;
    var locationY = document.getElementById('lng').value;//document.forms["rshare-search-frm"].elements["lng"].value;
    //alert(distance+' '+destination+' '+locationX+' '+locationY);

    var q_str= 'Rideshare_DB.php?act=searchRideshare&table_name=Rideshare&distance='+distance+'&destination='+destination+
            '&locationX='+locationX+'&locationY='+locationY;
    //alert(q_str);
    connectDatabase(q_str, showResults, { distance: 1, pickup: 1, destination: 1, date_start: 1, date_end: 1});
    //alert(distance+' '+destination+' '+locationX+' '+locationY);
}

function makeRideshare()
{
    var q_str= 'Rideshare_DB.php?act=addRideshare';
    connectDatabase(q_str, tempfunc, { distance: 1, pickup: 1, destination: 1, date_start: 1, date_end: 1});    
}

function tempfunc()
{
    // intentionally left blank
}

function joinRideshare(table, button)
{
    
    var rid = table.getAttribute("data-rideshareID");
    //alert("joining rideshare: "+rid);
    var q_str= 'Rideshare_DB.php?act=joinRideshare&rideshare_ID='+rid;
    //alert(q_str);
    connectDatabase(q_str, updateCapacity, { rideshare_ID: rid});
    
    //var capElm = table.getElementsByClassName("d_cap").innerHTML = "FAIL";
    table.getElementsByClassName("d_cap").innerHTML = "FAIL";
    
    //capElm.innerHTML =  "FAIL";
    
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
        var tbl = makeTable(response[i], document.getElementById("results"));
        
        var join_button = document.createElement("BUTTON");
        tbl.appendChild(join_button);
        join_button.onclick = function(){ joinRideshare(this.parentNode, this); };
        join_button.innerHTML = "Join Rideshare";
        if(tbl.dataset.capacity <= 0)
        {
            join_button.disabled = true;
        }
        
    }
}

function makeTable(responseObj, elementToAppendTo)
{
    var tbl = document.createElement('table');
    var tby = document.createElement('tbody');

    Object.keys(responseObj).forEach(function (element){
        switch(element)
        {
            case "rideshare_ID":
                tbl.setAttribute("data-rideshareID", responseObj[element]);
                break;
            case "ride_date":
                var tr = document.createElement('tr');
                var trh = document.createElement('td');
                var td = document.createElement('td');
                trh.innerHTML = "Date/Time:";
                td.innerHTML = responseObj[element];
                tbl.setAttribute("data-rideDate", responseObj[element]);
                tr.appendChild(trh);
                tr.appendChild(td);
                tby.appendChild(tr);
                break;
            case "user_first_name":
                var tr = document.createElement('tr');
                var trh = document.createElement('td');
                var td = document.createElement('td');
                trh.innerHTML = "Rideshare Owner:";
                td.innerHTML = responseObj[element] + ' ' + responseObj['user_last_name'];
                tbl.setAttribute("data-rideOwnerFirstname", responseObj[element]);
                tr.appendChild(trh);
                tr.appendChild(td);
                tby.appendChild(tr);                
                break;
            case "user_last_name":
                tbl.setAttribute("data-rideOwnerLastname", responseObj[element]);
                break;
            case "UID":
                tbl.setAttribute("data-UID", responseObj[element]);
                break;
            case "capacity":
                var tr = document.createElement('tr');
                var trh = document.createElement('td');
                var td = document.createElement('td');
                trh.innerHTML = "Room Left:";
                td.innerHTML = responseObj[element];
                td.setAttribute("data-capacity", responseObj[element]); // <----
                td.setAttribute("class", "d_cap");
                tr.appendChild(trh);
                tr.appendChild(td);
                tby.appendChild(tr);                                               
                break;
            case "distance":
                var tr = document.createElement('tr');
                var trh = document.createElement('td');
                var td = document.createElement('td');
                trh.innerHTML = "Distance to Pickup:";
                td.innerHTML = responseObj[element];
                tbl.setAttribute("data-distance", responseObj[element]);
                tr.appendChild(trh);
                tr.appendChild(td);
                tby.appendChild(tr);                  
                break;
            case "pickup_lat":
                tbl.setAttribute("data-plat", responseObj[element]);
                break;
            case "pickup_lng":
                tbl.setAttribute("data-plng", responseObj[element]); 
                break;
            case "pickup_addr":
                var tr = document.createElement('tr');
                var trh = document.createElement('td');
                var td = document.createElement('td');
                trh.innerHTML = "Pickup Address:";
                td.innerHTML = responseObj[element];
                tbl.setAttribute("data-address", responseObj[element]);
                tr.appendChild(trh);
                tr.appendChild(td);
                tby.appendChild(tr);                 
                break;
        }          
    });
    tbl.appendChild(tby);
    elementToAppendTo.appendChild(tbl);
    return tbl;
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
                //alert(httpReq.responseText);
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

function lookupAddr() 
{
    var results = document.getElementById("msgDiv");
    var address = document.getElementById("addr").value;
}

function getLocation() 
{
    var x = document.getElementById("msgDiv");
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
    //var x = document.getElementById("resultsDiv");
    var lat = document.getElementById("lat");
    var lng = document.getElementById("lng");
    //x.innerHTML = "Latitude: " + position.coords.latitude +
    //"<br>Longitude: " + position.coords.longitude;
    //parseFloat(pickupX).toFixed(6)
    lat.value = parseFloat(position.coords.latitude).toFixed(6);
    lng.value = parseFloat(position.coords.longitude).toFixed(6);
}

function codeAddress() 
{
    var address = document.getElementById('addr').value;
    var lat = document.getElementById("lat");
    var lng = document.getElementById("lng");
    lat.value = "---";
    lng.value = "---";
    geocoder.geocode( 
        { 'address': address }, 
        function(results, status) 
        {
            if (status == google.maps.GeocoderStatus.OK) 
            {
                lat.value = parseFloat(results[0].geometry.location.lat()).toFixed(6);
                lng.value = parseFloat(results[0].geometry.location.lng()).toFixed(6);              
//                lat.value = results[0].geometry.location.lat();
//                lng.value = results[0].geometry.location.lng();
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

