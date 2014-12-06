
var acctObj = { 'UID': -1, 'UNAME': 'none' };

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
    var mdiv = document.getElementById('msgDiv');
    switch(resObj['result'])
    {
        case 'UNAME_EXISTS':
            mdiv.innerHTML = 'Username exists! Please reenter username';
            document.getElementById('username').value = '';
            document.getElementById('pword').value = '';
            break;
        case 'ADD_OK':
            mdiv.innerHTML = 'Account creation successful!';
            acctObj['UID'] = resObj['UID'];
            acctObj['UNAME'] = resObj['UNAME'];                    
            clearFields();
            break;
        case 'ADD_FAIL':
            mdiv.innerHTML = 'Error: account creation failed';
            clearFields();
            break;
    }
    //alert(resObj);
    
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


