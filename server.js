var http = require('http'),
    express = require('express'),
    mysql = require('mysql'),
    parser = require('body-parser');

var debugmode = true;

// Database Connection
var connection = mysql.createConnection({
    host: '10.212.228.6',
    user: 'elad.zucker',
    password: 'KZK6yU9e',
    database: 'wmlive'
});

//debugmode Database Connection
var debugConnection = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    password: 'test1234',
    database: 'bookingsdashboard'
});

function connectDb() {

    if (debugmode) {
        try {
            debugConnection.connect();
        } catch (e) {
            console.log('Database Connection failed:' + e);
        }
    } else {
        try {
            connection.connect();
        } catch (e) {
            console.log('Database Connection failed:' + e);
        }
    }
}

connectDb();


// Setup express
var app = express();
var path = require('path');
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
var cors = require('cors');

// use it before all route definitions
app.use(cors({origin: '*'}));


app.get('/totalbooking/', function (req, res) {
    if (debugmode) {
        if (req.query.maxrecord == "true") {
            debugConnection.query('SELECT * from bookingsperday WHERE singleday between (CURDATE() - INTERVAL 1 MONTH ) and CURDATE() ORDER BY totalbookings DESC LIMIT 1', function (err, rows, fields) {
                if (!err) {
                    var response = null;
                    console.log("GET totalbooking/?maxrecord=true");
                    if (rows.length != 0) {
                        response = {'result': 'success', 'data': rows};
                    } else {
                        response = {'result': 'error', 'msg': 'No Results Found'};
                    }

                    if (debugmode) {
                        setTimeout(function () {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200).send(JSON.stringify(response));
                        }, 15000);
                    }
                    else {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(response));
                    }
                } else {
                    //connectDb();
                    res.status(400).send(err);
                }
            });
        } else {
            debugConnection.query('SELECT * from bookingsperday WHERE singleday between (CURDATE() - INTERVAL 1 MONTH ) and CURDATE()', function (err, rows, fields) {
                if (!err) {
                    var response = null;
                    console.log("GET totalbooking/");
                    if (rows.length != 0) {
                        response = {'result': 'success', 'data': rows};
                    } else {
                        response = {'result': 'error', 'msg': 'No Results Found'};
                    }
                    if (debugmode) {
                        setTimeout(function () {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200).send(JSON.stringify(response));
                        }, 5000);
                    }
                    else {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(response));
                    }

                } else {
                    //connectDb();
                    res.status(400).send(err);
                }
            });
        }
    } else {
        if (req.query.maxrecord == "true") {
            connection.query('select DATE(chb.create_date) AS day,count(*) AS totalbooking from wmlive.cwt_hotel_booking chb\n' +
                'JOIN wmlive.account s ON chb.account_id = s.id and (s.primary_email not like \'%@mobimate%\') and  (s.primary_email not like \'%mailinator%\') and (s.primary_email not like \'%@yopmail%\') and s.variant_id=3\n' +
                'where chb.status=\'SUCCESS\'\n' +
                'and DATE(chb.create_date)>= DATE(\'20170101\')\n' +
                'and chb.test_booking=0\n' +
                'group by DATE(chb.create_date)\n' +
                'order by count(*) desc;\n' +
                ' ', function (err, rows, fields) {
                if (!err) {
                    var response = null;

                    if (rows.length != 0) {
                        response = {'result': 'success', 'data': [rows[0]]};
                    } else {
                        response = {'result': 'error', 'msg': 'No Results Found'};
                    }

                    if (debugmode) {
                        setTimeout(function () {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200).send(JSON.stringify(response));
                        }, 15000);
                    }
                    else {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(response));
                    }

                } else {
                    //connectDb();
                    res.status(400).send(err);
                }
            });
        }
        else {
            connection.query('select DATE(chb.create_date) AS \'day\',count(*) AS \'totalbooking\' from wmlive.cwt_hotel_booking chb \n' +
                'JOIN wmlive.account s ON chb.account_id = s.id and (s.primary_email not like \'%@mobimate%\') and  (s.primary_email not like \'%mailinator%\') and (s.primary_email not like \'%@yopmail%\') and s.variant_id=3\n' +
                'where chb.status=\'SUCCESS\'\n' +
                'and DATE(chb.create_date)>= DATE_SUB(NOW(), INTERVAL 1 MONTH) \n' +
                'and chb.test_booking=0\n' +
                'group by DATE(chb.create_date) \n' +
                'order by DATE(chb.create_date) ASC;', function (err, rows, fields) {
                if (!err) {
                    var response = null;
                    if (rows.length != 0) {
                        response = {'result': 'success', 'data': rows};
                    } else {
                        response = {'result': 'error', 'msg': 'No Results Found'};
                    }
                    if (debugmode) {
                        setTimeout(function () {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200).send(JSON.stringify(response));
                        }, 15000);
                    }
                    else {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(response));
                    }

                } else {
                    //connectDb();
                    res.status(400).send(err);
                }
            });
        }
    }
});

// app.get('/yearrecord/', function (req, res) {
//   connection.query('select count(*) as total from wmlive.cwt_hotel_booking chb\n' +
//     'JOIN wmlive.account s ON chb.account_id = s.id\n' +
//     'where chb.status=\'SUCCESS\'\n' +
//     'and DATE(chb.create_date)>= DATE(\'20170101\')\n' +
//     'and s.primary_email not like \'%@mobimate%\'\n' +
//     'and s.primary_email not like \'%mailinator%\'\n' +
//     'and s.primary_email not like \'%@yopmail% \'\n' +
//     'and s.variant_id=3\n' +
//     'and chb.test_booking=0;', function (err, rows, fields) {
//
//     var response = null;
//
//     if (!err) {
//
//       if (rows.length != 0) {
//         response = {'result': 'success', 'data': rows[0]};
//       } else {
//         response = {'result': 'error', 'msg': 'No Results Found'};
//       }
//
//       res.setHeader('Content-Type', 'application/json');
//       res.status(200).send(JSON.stringify(response));
//
//     } else {
//       connectDb();
//       res.status(400).send(err);
//     }
//
//   })
// });

app.get('/currentyearrecord/', function (req, res) {
    debugConnection.query('SELECT sum(totalbookings) FROM currentyearrecord', function (err, rows, fields) {
        if (!err) {
            var response = null;
            console.log("GET currentyearrecord/");
            if (rows.length != 0) {
                response = {'result': 'success', 'data': rows[0]};
            } else {
                response = {'result': 'error', 'msg': 'No Results Found'};
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
        }
        else{
            console.log("Error:" + err.toString());
            res.status(400).send(err);
        }
    })
});

app.get('/lastyearrecord/', function (req, res) {
    debugConnection.query('SELECT sum(totalbookings) FROM lastyearrecord', function (err, rows, fields) {
    if (!err) {
        var response = null;
        console.log("GET lastyearrecord/");
      if (rows.length != 0) {
        response = {'result': 'success', 'data': rows[0]};
      } else {
        response = {'result': 'error', 'msg': 'No Results Found'};
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(response));
    }
    else{
      console.log("Error:" + err.toString());
      res.status(400).send(err);
    }
  })
});

app.get('/registrations/', function (req, res) {
    console.log('GET registrations/')
    var response = {
        "bookings": [{
            "successfulbookings": "98.5",
            "successfulmobilebookings": "360",
            "successfulwebbookings": "199"
        },
            {
                "failedbookings": "2.5",
                "failedmobilebookings": "10",
                "failedwebbookings": "8"
            }],
        "registrations": [
            {
                "successfulregistrations": "165,225",
                "failedregistrations": "8,813"
            }
        ]
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(response));

});

// Create server
http.createServer(app).listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});

module.exports = app;
