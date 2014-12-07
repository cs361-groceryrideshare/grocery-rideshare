window.onload = function(){ load_logname();};

function login()
{
    var uname = document.getElementById("uname").value;
    var pw = document.getElementById("pw").value;
    
    var q_str= 'Rideshare_DB.php?act=login&uname='+uname+'&pw='+pw;
    //alert(q_str);
    connectDatabase(q_str, logResultFunc, { 'blank': 'blank' } );
}

function logResultFunc(repObj, argObj)
{
    var result = repObj['result'];
    var msgTD = document.getElementById('msgTblText');
    
    switch(result)
    {
        case 'OK':
            msgTD.innerHTML = 'login successful';
            sessionStorage.UID = repObj['UID'];
            sessionStorage.uname = repObj['uname'];
            window.location.href = 'Rideshare_SearchRS_HTML.html';
            //alert(sessionStorage.UID);
            //alert(sessionStorage.uname);
            break;
        case 'LOGIN_FAIL':
            msgTD.innerHTML = 'Username/password does not exist';
            break;
        case 'ERROR':
            msgTD.innerHTML = 'LOGIN ERROR';
            break;
    }
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