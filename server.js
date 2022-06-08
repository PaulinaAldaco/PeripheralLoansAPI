require("dotenv").config()
const express = require("express");
const ibmdb = require("ibm_db");
const async = require('async');
const cors = require('cors');
const bcrypt = require("bcrypt");

const bodyParser=require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT
const host = process.env.DB_HOST
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const dbname = process.env.DB_DATABASE
const dbport = process.env.DB_PORT


app.listen(port, 
    ()=> console.log(`Server Started on port ${port}...`))



let cn = "DATABASE="+dbname+";HOSTNAME="+host+";PORT="+dbport+";PROTOCOL=TCPIP;UID="+user+";PWD="+password+";Security=SSL;SSLServerCertificate=DigiCertGlobalRootCA.arm;";


ibmdb.open(cn, function (err,conn) {
    console.log("querying")
    if (err){
        //return response.json({success:-1, message:err});
        console.log("1")
        console.log(err)
    }
    conn.query("SELECT * FROM QGJ93840.USER ", function (err, data) {
        if (err){
            //return response.json({success:-2, message:err});
            console.log("2")
            console.log(err)
        }
        else{
            console.log("3")
            console.log(data)
      }
    })
});


app.get('/checkLogin', function(request, response) {
    const { username, password } = request.query;
    ibmdb.open(cn, async function (err,conn) {
        //console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query(`SELECT * FROM QGJ93840.USER WHERE USERNAME = '${username}'`, async(err, data) =>{
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    // encrypted password
                    // console.log(data[0]['PASSWORD']);
                    // check user password with hashed password stored in the database
                    if (data.length > 0) {
                        var validPassword = await bcrypt.compare(password, data[0]['PASSWORD']);
                    }
                    else {
                        var validPassword = false;
                    }
                    console.log(validPassword)
                    // console.log(validPassword)
                    conn.close(function () {
                        if(validPassword){
                            return response.json({success:1, message:'Data Received!', data: {valid: validPassword, USER_ID: data[0]['USER_ID'], USERNAME: data[0]['USERNAME'], ROLE: data[0]['ROLE']}});
                        }else{
                            return response.json({success:1, message:'Data Received!', data: {valid: validPassword}});
                        }
                });
                }
            });
        }
    });
});

app.post('/users', function(request, response){
    var params = request.body
    var limit = params['limit']
    var offset = (params['page']-1) * limit
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query('SELECT USER_ID, USERNAME, ROLE FROM QGJ93840.USER LIMIT '+ offset + "," + limit, function (err, data) {
            if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    return response.json({success:1, message:'Data Received!', data:data});
                });
            }
          });
        }
    });
});

app.get('/countUsers', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query("SELECT COUNT(*) FROM QGJ93840.USER", function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    console.log(data)
                    return response.json({success:1, message:'Data Received!', data:{"count": data[0]["1"]}});
                });
            }
          });
        }
    });
});


app.post('/newPeripheral', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body['device_params']
            var q = "INSERT INTO QGJ93840.DEVICES" +
                    " VALUES (DEFAULT, '" + params['device_type'] + "', '" + params['brand'] + "', '" +
                    params['model'] + "', " + params['serial_number'] + ", DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)";
            console.log(q);
            conn.query(q, function (err, data) {
            if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    return response.json({success:1, message:'Data entered!'});
                });
            
            }
          });
        }
    });
});

app.post('/getDevices', function(request, response){
    var params = request.body
    var limit = params['limit']
    var offset = (params['page']-1) * limit
    // var limit = 10
    // var offset = (1-1) * limit
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query("SELECT * FROM QGJ93840.DEVICES LIMIT "+ offset + "," + limit, function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log("Using query: SELECT * FROM QGJ93840.DEVICES LIMIT "+ offset + "," + limit)
                    console.log('done');
                    return response.json({success:1, message:'Data Received!', data:data});
                });
            }
          });
        }
    });
});

app.get('/countDevices', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query("SELECT COUNT(*) FROM QGJ93840.DEVICES", function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    console.log(data)
                    return response.json({success:1, message:'Data Received!', data:{"count": data[0]["1"]}});
                });
            }
          });
        }
    });
});

app.post('/userToID', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body
            console.log(params)
            
            // Build query
            q = "SELECT USER_ID FROM QGJ93840.USER WHERE USERNAME = " + "'" + params['username'] +"';";

            console.log(q);

            conn.query(q, function (err, data) {
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    conn.close(function () {
                        console.log('done');
                        console.log(data)
                        return response.json({success:1, message:'Data received!', data: data});
                    });
                }
            });
        }
    });
});

app.post('/IDTouser', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body
            console.log(params)
            
            // Build query
            q = "SELECT USERNAME FROM QGJ93840.USER WHERE USER_ID = " + params['id'] +";";

            console.log(q);

            conn.query(q, function (err, data) {
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    conn.close(function () {
                        console.log('done');
                        console.log(data)
                        return response.json({success:1, message:'Data received!', data: data});
                    });
                }
            });
        }
    });
});


app.post('/newRequest', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body
            console.log(params)
            
            // Build queries
            request_query = "INSERT INTO QGJ93840.REQUESTS VALUES"
            device_query =  "UPDATE QGJ93840.DEVICES SET " + '"device_state"' + " = 'Requested' WHERE DEVICE_ID IN ("
            for (let i = 0; i < params.length-1; i++) {
                var request_query = 
                        request_query + "(DEFAULT, " + params[i]['user_id'] + "," +
                        params[i]['device_id'] +
                        ", DEFAULT, TIMESTAMP_FORMAT(" +"'"+params[i]['return_date']+"', 'YYYY-MM-DD HH24:MI:SS'), DEFAULT),";
                var device_query = 
                        device_query + params[i]['device_id'] + ', '

            }
            var request_query = 
                    request_query + "(DEFAULT, " + params[params.length-1]['user_id'] + "," +
                    params[params.length-1]['device_id'] +
                    ", DEFAULT, TIMESTAMP_FORMAT(" +"'"+params[params.length-1]['return_date']+"', 'YYYY-MM-DD HH24:MI:SS'), DEFAULT)";
            var device_query = device_query + params[params.length-1]['device_id'] + ');'
            console.log(request_query);
            console.log(device_query);

            // Create device requests
            conn.query(request_query, function (err, data) {
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    // conn.close(function () {
                    console.log('done');
                    //     //return response.json({success:1, message:'Data entered!'});
                    // });
                    conn.query(device_query, function (err, data) {
                        if (err){
                            console.log(err);
                            return response.json({success:-2, message:err});
                        }
                        else{
                            conn.close(function () {
                                console.log('done');
                                return response.json({success:1, message:'Data entered and updated!'});
                            });
                        }
                    });
                }
            });

            // Update device states
            
        }
    });
});

app.post('/checkDeviceAvailability', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body
            console.log(params)
            
            // Build query
            q = 'SELECT "DEVICE_ID", "serial_number", "device_state" FROM QGJ93840.DEVICES WHERE "DEVICE_ID" IN ('
            for (let i = 0; i < params.length-1; i++) {
                var q = q + params[i]['device_id'] + ",";
            }
            var q = q + params[params.length-1]['device_id'] + ");";

            console.log(q);

            conn.query(q, function (err, data) {
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    conn.close(function () {
                        console.log('done');
                        console.log(data)
                        var avail = []
                        var unavail = []
                        var avail_SN = []
                        var unavail_SN = []
                        for (let i = 0; i < params.length; i++) {
                            if (data[i]["device_state"] == "Available") {
                                avail.push(data[i]["DEVICE_ID"])
                                avail_SN.push(data[i]["serial_number"])
                            }
                            else {
                                unavail.push(data[i]["DEVICE_ID"])
                                unavail_SN.push(data[i]["serial_number"])
                            }
                        }
                        res = {
                            "available_SN": avail_SN,
                            "available": avail,
                            "unavailable": unavail,
                            "unavailable_SN": unavail_SN
                        }
                        console.log(res)
                        return response.json({success:1, message:'Data received!', data: res});
                    });
                }
            });
        }
    });
});

/**
 * seleccionar devices
 * picas request
 * llama check device availability -> regresar una lista de available devices y no available devices
 * llamar make request para availables
 * mostrar no availables
 * 
 * 
 * otra forma
 *  - si estan available -> make request
 *  - no estan available -> mensaje de error diciendo que devices estan unavailable
 * 
 * 
 */


 app.post('/getDeviceInfo', function(request, response){
    var params = request.body

    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query("SELECT * FROM QGJ93840.DEVICES WHERE DEVICE_ID = "+ params["deviceID"] + ";", function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log("Using query: SELECT * FROM QGJ93840.DEVICES WHERE DEVICE_ID = "+ params["deviceID"] + ";")
                    console.log('done');
                    // console.log(data)
                    return response.json({success:1, message:'Data Received!', data:data});
                });
            }
          });
        }
    });
});

app.post('/getRequests', function(request, response){
    var params = request.body
    var limit = params['limit']
    var offset = (params['page']-1) * limit
    // var limit = 10
    // var offset = (1-1) * limit
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query('SELECT REQUEST_ID, USERNAME, "device_type", "brand", "model", "serial_number", "device_state", "conditions_accepted", "in_campus", "Security_Auth", "last_admission_date", "last_exit_date", DATE as REQUEST_DATE,  RETURN_DATE, DEVICE_ID, USER_ID, STATUS FROM QGJ93840.REQUESTS FULL INNER JOIN QGJ93840.DEVICES USING (DEVICE_ID) JOIN QGJ93840.USER USING (USER_ID) WHERE STATUS ='+ "'" + params["STATUS"] + "' ORDER BY REQUEST_DATE LIMIT " + offset + ", " + limit, function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('Using query: SELECT REQUEST_ID, USERNAME, "device_type", "brand", "model", "serial_number", "device_state", "conditions_accepted", "in_campus", "Security_Auth", "last_admission_date", "last_exit_date", DATE as REQUEST_DATE,  RETURN_DATE, DEVICE_ID, USER_ID, STATUS FROM QGJ93840.REQUESTS FULL INNER JOIN QGJ93840.DEVICES USING (DEVICE_ID) JOIN QGJ93840.USER USING (USER_ID) WHERE STATUS ='+ "'" + params["STATUS"] + "' ORDER BY REQUEST_DATE LIMIT "+ offset + ", " + limit)
                    console.log('done');
                    return response.json({success:1, message:'Data Received!', data:data});
                });
            }
          });
        }
    });
});

app.post('/countRequests', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        var params = request.body
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query("SELECT COUNT(*) FROM QGJ93840.REQUESTS WHERE STATUS = '"+ params["STATUS"]+"'", function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    console.log(data)
                    return response.json({success:1, message:'Data Received!', data:{"count": data[0]["1"]}});
                });
            }
          });
        }
    });
});

app.post('/acceptRequest', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body
            console.log(params)
            
            // Build queries
            change_accepted_Con =  'UPDATE QGJ93840.DEVICES SET "conditions_accepted" = 1 WHERE DEVICE_ID = ' + params['device_id']
            update_REQ_status =  "UPDATE QGJ93840.REQUESTS SET STATUS = 'Accepted' WHERE REQUEST_ID = " + params['request_id']


            // Create device requests
            conn.query(change_accepted_Con, function (err, data) {
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    // conn.close(function () {
                    console.log('done');
                    //     //return response.json({success:1, message:'Data entered!'});
                    // });
                    conn.query(update_REQ_status, function (err, data) {
                        if (err){
                            console.log(err);
                            return response.json({success:-2, message:err});
                        }
                        else{
                            conn.close(function () {
                                console.log('done');
                                return response.json({success:1, message:'Data entered and updated!'});
                            });
                        }
                    });
                }
            });
        }
    });
});


app.post('/rejectRequest', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body
            console.log(params)
            
            // Build queries
            change_device_State =  'UPDATE QGJ93840.DEVICES SET "device_state" = '+"'Available'"+' WHERE DEVICE_ID = ' + params['device_id']
            update_REQ_status =  "UPDATE QGJ93840.REQUESTS SET STATUS = 'Denied' WHERE REQUEST_ID = " + params['request_id']


            // Create device requests
            conn.query(update_REQ_status, function (err, data) {
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    // conn.close(function () {
                    console.log('done');
                    //     //return response.json({success:1, message:'Data entered!'});
                    // });
                    conn.query(change_device_State, function (err, data) {
                        if (err){
                            console.log(err);
                            return response.json({success:-2, message:err});
                        }
                        else{
                            conn.close(function () {
                                console.log('done');
                                return response.json({success:1, message:'Data entered and updated!'});
                            });
                        }
                    });
                }
            });
        }
    });
});

app.post('/newUser', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body['user_params']
            var q = "INSERT INTO QGJ93840.USER" +
                    " VALUES (Default, '"+params['username']+"', '"+params['password']+"', "+
                    params['role']+")";
            console.log(q);
            conn.query(q, function (err, data) {
            if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    return response.json({success:1, message:'Data entered!'});
                });
            
            }
          });
        }
    });
});

app.post('/getUserRequests', function(request, response){
    var params = request.body

    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query('SELECT REQUEST_ID, "device_type", "brand", "model", "serial_number", "device_state", "conditions_accepted", "in_campus", "Security_Auth", "last_admission_date", "last_exit_date", DATE as REQUEST_DATE,  RETURN_DATE, DEVICE_ID, STATUS FROM QGJ93840.REQUESTS FULL INNER JOIN QGJ93840.DEVICES USING (DEVICE_ID) WHERE STATUS = '+"'Accepted'"+ 'AND USER_ID ='+  params["userID"], function (err, data) {
            // conn.query("SELECT * FROM QGJ93840.REQUESTS WHERE STATUS = 'Accepted' AND USER_ID = "+ params["userID"] + ";", function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('Using query: SELECT REQUEST_ID, "device_type", "brand", "model", "serial_number", "device_state", "conditions_accepted", "in_campus", "Security_Auth", "last_admission_date", "last_exit_date", DATE as REQUEST_DATE,  RETURN_DATE, DEVICE_ID, STATUS FROM QGJ93840.REQUESTS FULL INNER JOIN QGJ93840.DEVICES USING (DEVICE_ID) WHERE STATUS = '+"'Accepted'"+ 'AND USER_ID ='+  params["userID"])
                    console.log('done');
                    // console.log(data)
                    return response.json({success:1, message:'Data Received!', data:data});
                });
            }
          });
        }
    });
});


app.post('/editUserInfo', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body['user_params']
            if(params['column'] == "USERNAME" || params['column'] == "PASSWORD"){
                var q = "UPDATE QGJ93840.USER SET "+params['column']+" = '"+params['change']+"' WHERE USER_ID = "+params['userID'];
            }else if(params['column'] == "ROLE"){
                var q = "UPDATE QGJ93840.USER SET "+params['column']+" = "+params['change']+" WHERE USER_ID = "+params['userID'];
            }
            console.log(q);
            conn.query(q, function (err, data) {
            if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    return response.json({success:1, message:'Data entered!'});
                });
            
            }
            });
        }
    });
});

app.get('/countDevicesPanel', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query('SELECT * FROM (SELECT COUNT (*) as devicesNo FROM QGJ93840.DEVICES), (SELECT COUNT(*) as devicesIn FROM QGJ93840.DEVICES WHERE "in_campus" = true), (SELECT COUNT(*) as devicesOut FROM QGJ93840.DEVICES WHERE "in_campus" = false);', function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log('done');
                    console.log(data)
                    return response.json({success:1, message:'Data Received!', data:data[0]});
                });
            }
          });
        }
    });
});


app.post('/registerExit', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("posting")
        if (err){
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            var params = request.body
            console.log(params)
            
            // Build queries
            change_Sec =  'UPDATE QGJ93840.DEVICES SET "Security_Auth" = 1 WHERE DEVICE_ID = ' + params['device_id']
            update_in_camp=  'UPDATE QGJ93840.DEVICES SET  "in_campus" = 0 WHERE DEVICE_ID = ' + params['device_id']
            update_last_exit = 'UPDATE QGJ93840.DEVICES SET  ""last_exit_date" " = CURRENT_TIMESTAMP WHERE DEVICE_ID = ' + params['device_id']
            update_availability = 'UPDATE QGJ93840.DEVICES SET  "device_state" = '+"'Checked Out'"+' WHERE DEVICE_ID = ' + params['device_id']
            // Create device requests
            conn.query(change_Sec, function (err, data) {
                if (err){
                    console.log(err);
                    return response.json({success:-2, message:err});
                }
                else{
                    // conn.close(function () {
                    console.log('done');
                    //     //return response.json({success:1, message:'Data entered!'});
                    // });
                    conn.query(update_in_camp, function (err, data) {
                        if (err){
                            console.log(err);
                            return response.json({success:-2, message:err});
                        }
                        else{
                            conn.query(update_last_exit, function (err, data) {
                                if (err){
                                    console.log(err);
                                    return response.json({success:-2, message:err});
                                }
                                else{
                                    conn.query(update_availability, function (err, data) {
                                        if (err){
                                            console.log(err);
                                            return response.json({success:-2, message:err});
                                        }
                                        else{
                                            conn.close(function () {
                                                console.log('done');
                                                return response.json({success:1, message:'Data entered and updated!'});
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});