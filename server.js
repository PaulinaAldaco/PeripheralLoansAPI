require("dotenv").config()
const express = require("express");
const ibmdb = require("ibm_db");
const async = require('async');
const cors = require('cors');

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


app.get('/checkLogin', function(request, response){
    const { username, password } = request.query;
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query(`SELECT * FROM QGJ93840.USER WHERE USERNAME = '${username}' and PASSWORD = '${password}'`, function (err, data) {
            if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                console.log(data)
                conn.close(function () {
                    return response.json({success:1, message:'Data Received!', data:data});
                });
            }
          });
        }
    });
});

app.get('/users', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query(`SELECT * FROM QGJ93840.USER`, function (err, data) {
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
                        ", DEFAULT, DEFAULT," +params[i]['return_date']+"),";
                var device_query = 
                        device_query + params[i]['device_id'] + ', '

            }
            var request_query = 
                    request_query + "(DEFAULT, " + params[params.length-1]['user_id'] + "," +
                    params[params.length-1]['device_id'] +
                    ", DEFAULT, DEFAULT," +params[params.length-1]['return_date']+")";
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
                    conn.close(function () {
                        console.log('done');
                        //return response.json({success:1, message:'Data entered!'});
                    });
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
            conn.query("SELECT * FROM QGJ93840.REQUESTS FULL INNER JOIN QGJ93840.DEVICES USING (DEVICE_ID) JOIN QGJ93840.USER USING (USER_ID) LIMIT "+ offset + "," + limit, function (err, data) {
                if (err){
                console.log(err);
                return response.json({success:-2, message:err});
            }
            else{
                conn.close(function () {
                    console.log("Using query: SELECT * FROM QGJ93840.REQUESTS FULL INNER JOIN QGJ93840.DEVICES USING (DEVICE_ID) JOIN QGJ93840.USER USING (USER_ID) LIMIT "+ offset + "," + limit)
                    console.log('done');
                    return response.json({success:1, message:'Data Received!', data:data});
                });
            }
          });
        }
    });
});

app.get('/countRequests', function(request, response){
    ibmdb.open(cn, async function (err,conn) {
        console.log("querying")
        if (err){
            //return response.json({success:-1, message:err});
            console.log("1")
            console.log(err)
            return response.json({success:-1, message:err});
        } else {
            conn.query("SELECT COUNT(*) FROM QGJ93840.REQUESTS", function (err, data) {
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