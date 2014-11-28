/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function submitData()
{
    var distance = document.forms["rshare-search-frm"].elements["distance"].value;
    var destination = document.forms["rshare-search-frm"].elements["destination"].value;
    var owner = document.forms["rshare-search-frm"].elements["owner"].value;
    var date_start = document.forms["rshare-search-frm"].elements["beg-date"].value;
    var date_end = document.forms["rshare-search-frm"].elements["end-date"].value;
    var locationX = document.forms["rshare-search-frm"].elements["locationX"].value;
    var locationY = document.forms["rshare-search-frm"].elements["locationY"].value;
    
    var q_str= 'Rideshare_DB.php?act=query&table_name=Rideshare&distance='+distance+'&destination='+destination+'&date_start='+date_start+'&date_end='+date_end+'&locationX='+locationX+'&locationY='+locationY;
    connectDatabase(q_str, showResults, { distance: 1, pickup: 1, destination: 1, date_start: 1, date_end: 1});
    //alert(distance+' '+pickup+' '+destination+' '+date_start+' '+date_end);
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
    // Create an array of keys and a string for results
    var keyArray = Object.keys(response[i]);
    var resultsString = '';
    
    // Loop through keys, adding them and their values to the p element
    for(var j = keyArray.length / 2; j < keyArray.length; j++)
    {
      resultsString = resultsString + keyArray[j] + ' ' + response[i][j - (keyArray.length / 2)] + '<br />';
    }
    
    // Create a new p element for individual results, insert the results, and append to the parent
    var newP = document.createElement("p");
    newP.innerHTML = resultsString;
    document.getElementById("results").appendChild(newP);
    
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
                // alert(httpReq.responseText);
                func(JSON.parse(httpReq.responseText), funcArgs);               
            }
            else
            {
                alert('ERROR: there was a problem with the request');
            }
        }
    }
}