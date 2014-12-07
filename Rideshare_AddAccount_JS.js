window.onload = function(){ load_logname();};
var acctObj = { 'UID': -1, 'UNAME': 'none' };

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
    var uname = document.getElementById('username').value;
    var pword = document.getElementById('pword').value;
    var fname = document.getElementById('firstname').value;
    var lname = document.getElementById('lastname').value;
  
    var q_str = "Rideshare_DB.php?act=addAccount&username="+uname+"&password="+pword+"&firstname="+fname+"&lastname="+lname;
    //alert(q_str);
    connectDatabase(q_str, makeAccountResult, { distance: 1, pickup: 1, destination: 1, date_start: 1, date_end: 1});    
}

function makeAccountResult(resObj, argObj)
{      
    var mdiv = document.getElementById('msgTblText');
    //alert(resObj['result']);
    switch(resObj['result'])
    {
        case 'UNAME_EXISTS':
            mdiv.innerHTML = 'Username exists! Please reenter username';
            document.getElementById('username').value = '';
            document.getElementById('pword').value = '';
            break;
        case 'ADD_OK':
            mdiv.innerHTML = 'Account creation successful! Returning to login...';
            acctObj['UID'] = resObj['UID'];
            acctObj['UNAME'] = resObj['UNAME'];
            var delay=2000;
            setTimeout(function(){window.location.href = 'Rideshare_Mainpage_HTML.html';}, delay);         
            break;
        case 'ADD_FAIL':
            mdiv.innerHTML = 'Error: account creation failed';
            clearFields();
            break;
    }   
}

function clearFields()
{
    document.getElementById('username').value = '';
    document.getElementById('pword').value = '';
    document.getElementById('firstname').value = '';
    document.getElementById('lastname').value = '';    
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
                //func();
            }
            else
            {
                alert('ERROR: there was a problem with the request');
            }
        }
    }
}


