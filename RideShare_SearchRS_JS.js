/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/
window.onload = function(){ load_logname();};

prevTbl = 'none';
curTbl = 'none';

function setCSS()
{
//    document.getElementById('sb1').style.width = document.getElementById('row1').width + 'px';
//    document.getElementById('sb2').style.width = document.getElementById('row1').style.width;// + 'px';
//    document.getElementById('addr').style.width = document.getElementById('row1').style.width;// + 'px';
}

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
    }     
    log_div.appendChild(log_tbl);
}

function logOut()
{
    sessionStorage.uname = 'none';
    sessionStorage.UID = -1;
    return true;
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

function joinRideshare(elm)
{
    if(curTbl === 'none')
        return;
    
    var rid = curTbl.getAttribute("data-rideshareID");
    //alert("joining rideshare: "+rid);
    var q_str= 'Rideshare_DB.php?act=joinRideshare&rideshare_ID='+rid+'&user_ID=2';
    //alert(q_str);
    connectDatabase(q_str, updateCapacity, { rideshare_ID: rid});
}

function updateCapacity(response, args)
{
    if(response['result'] === 'IS_MEMBER')
    {
        document.getElementById("msgTblText").innerHTML = 'Already a member of this rideshare';
    }
    else if(response['result'] === 'JOIN_OK')
    {
        var cur_cap_node = curTbl.childNodes[0].childNodes[4].childNodes[1];
        cur_cap_node.innerHTML = cur_cap_node.innerHTML - 1;
        document.getElementById("msgTblText").innerHTML = 'Joined Rideshare';
    }
    else if(response['result'] === 'JOIN_ERROR')
    {
        document.getElementById("msgTblText").innerHTML = 'An error occured during joining the rideshare';
    }
    else
    {
        document.getElementById("msgTblText").innerHTML = 'Unknown state';
    }
    
    curTbl.style.background = "white";
    curTbl = 'none';

    setButton(document.getElementById("join_button"), 'setOFF');
}

function showResults(response, args)
{
    var msgTblText = document.getElementById("msgTblText");
    // Get the div that will contain the results
    var resultsParent = document.getElementById("resultsDiv");
    // If div containing results exists, delete it
    if (document.getElementById("results"))
    {
        var resultsNode = document.getElementById("results");
        resultsNode.parentNode.removeChild(resultsNode);
    }
    
    for(var i = 0; i < response.length; i++)
    {
        if(response[i]['result'] === 'FAIL')
        {
            msgTblText.innerHTML = 'An error occured with the search query';
            return;
        }
        else if(response[i]['result'] === 'NONE')
        {
            msgTblText.innerHTML = 'No results found';
            return;
        }
        else if(response[i]['result'] === 'OK')
        {
            msgTblText.innerHTML = 'Click on rideshare to select';
            break;
        }
        else
        {
            msgTblText.innerHTML = 'Unknown state';
            return;
        }    
    }    
    //alert(response);
    //alert(response['result']);
    
    // Create a div for new results, set id to "results", and append to resultsDiv
    var newDiv = document.createElement("div");
    newDiv.className = "result-display";
    newDiv.setAttribute("id", "results");
    resultsParent.appendChild(newDiv);
    
    var tcounter = 0;
    var tmax = 2;
    //var tdiv_idx = 0;
    // Display results
    //var tdivs = [ document.createElement("div") ];
    //tdivs[tdiv_idx].setAttribute("class", "tdiv");
    
    var rTbls = document.createElement("table");
    var rTbls_bdy = document.createElement('tbody');
    var rTbls_row = document.createElement('tr');
    rTbls.appendChild(rTbls_bdy);
    rTbls_bdy.appendChild(rTbls_row);
    for(var i = 0; i < response.length; i++)
    {
        if(response[i]["capacity"] === "0")
            continue;
 
        if(tcounter >= tmax)
        {
            //newDiv.appendChild(tdivs[tdiv_idx]);
            //tdiv_idx++;
            tcounter = 0;
            rTbls_row = document.createElement("tr");
            rTbls_bdy.appendChild(rTbls_row);
            //tdivs[tdiv_idx].setAttribute("class", "tdiv");
        }
        
        var rTbls_td = document.createElement('td');
        //var tbl = makeTable(response[i], tdivs[tdiv_idx]);
        var tbl = makeTable(response[i], rTbls_td);
        tbl.onclick = function(){ selectTable(curTbl, this); };
        
        rTbls_row.appendChild(rTbls_td);
        tcounter++;
    }
    newDiv.appendChild(rTbls);
//    if(tcounter !== 0)
//    {
//        newDiv.appendChild(tdivs[tdiv_idx]);
//    }   
}

function makeTable(responseObj, elementToAppendTo)
{
    var tbl = document.createElement('table');
    var tby = document.createElement('tbody');
    tbl.setAttribute("class", "resTbl");

    Object.keys(responseObj).forEach(function (element){
        switch(element)
        {
            case "rideshare_ID":
                tbl.setAttribute("data-rideshareID", responseObj[element]);
                break;
            case "dest_name":
                var tr = document.createElement('tr');
                var trh = document.createElement('td');
                var td = document.createElement('td');
                trh.innerHTML = "Destination:";
                td.innerHTML = responseObj[element];
                tbl.setAttribute("data-dest_name", responseObj[element]);  
                tr.appendChild(trh);
                tr.appendChild(td);
                tby.appendChild(tr);                                          
                break;  
            case "ride_date":
                var tr1 = document.createElement('tr');
                var trh1 = document.createElement('td');
                var td1 = document.createElement('td');
                var date_time = responseObj[element].split(" ");              
                trh1.innerHTML = "Date:";
                td1.innerHTML = date_time[0];
                tbl.setAttribute("data-rideDate", date_time[0]);
                tr1.appendChild(trh1);
                tr1.appendChild(td1);
                tby.appendChild(tr1);
                
                var tr2 = document.createElement('tr');
                var trh2 = document.createElement('td');
                var td2 = document.createElement('td');
                trh2.innerHTML = "Time:";
                td2.innerHTML = date_time[1];
                tbl.setAttribute("data-rideTime", date_time[1]);
                tr2.appendChild(trh2);
                tr2.appendChild(td2);
                tby.appendChild(tr2);                
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
                td.setAttribute("class", "r_cap")
                tby.appendChild(tr);                                               
                break;
            case "distance":
                var tr = document.createElement('tr');
                var trh = document.createElement('td');
                var td = document.createElement('td');
                var dist_temp = parseFloat(responseObj[element]).toFixed(2);
                var dist_temp_str = dist_temp.toString();                
                trh.innerHTML = "Distance to Pickup:";
                td.innerHTML = dist_temp_str+' km';
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

function selectTable(pTbl, cTbl)
{
    var jbutton = document.getElementById('join_button');
    
    if(jbutton.getAttribute('data-state') === 'off')
    {
        setButton(jbutton, 'setON');
    }
    
    if(pTbl !== 'none')
    {
        pTbl.style.background = 'white';        
    }
    
    cTbl.style.background = 'yellow';
    curTbl = cTbl;
}

function setButton(button, state)
{
    if(state === 'setON')
    {
        button.setAttribute('data-state', 'on');
        button.style.background = "lightgreen";
        button.style.border = "1px solid black";
        button.style.color = "black";
        button.onmouseover = function(){ 
            button.style.background = 'palegoldenrod'; 
            button.style.cursor = 'pointer';};
        button.onmouseout = function(){ 
            button.style.background = 'lightgreen'; 
            button.style.cursor = 'auto';};
        button.onclick = function(){joinRideshare(button);};
    }
    else if(state === 'setOFF')
    {
        button.onmouseout = function(){;};
        button.onmouseover = function(){;};
        button.onclick = function(){;};        
        button.setAttribute('data-state', 'off');
        button.style.background = "lightgrey";
        button.style.border = "1px solid darkgrey";
        button.style.color = "darkgrey";
    }
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
    var results = document.getElementById("msgTblText");
    var address = document.getElementById("addr").value;
}

function getLocation() 
{
    var x = document.getElementById("msgTblText");
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

