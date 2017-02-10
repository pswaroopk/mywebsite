var http = require("http");
var express = require('express');
var path = require('path');
var request = require('request');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
// load aws sdk
var aws = require('aws-sdk');

var app = express();

// instruct the app to use the `bodyParser()` middleware for all routes
app.use(bodyParser());

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/download', function(req, res) {
  var bucketName = 'swaroop-resume';
  var fileName = 'SwaroopKPydisetty_Resume.pdf';
  var s3Url = 'https://s3-us-west-2.amazonaws.com/swaroop-resume/' + fileName;
  res.set('Content-Disposition', 'attachment; filename="'+ fileName + '"');
  res.set('Content-Type', 'application/pdf');
  request(s3Url).pipe(res);
});

app.get('*', function(req, res) {
  res.sendFile('./public/index.html', {
    root: __dirname
  });
});

app.post('/sendMail', function (req, res) {
  var fromMail = req.body.email;
  var phone = req.body.phone;
  var name = req.body.name;
  var message = req.body.message;
  // load aws config
  aws.config.loadFromPath('config.json');

  // load AWS SES
  var ses = new aws.SES({apiVersion: '2010-12-01'});

  // send to list
  var to = ['swaroopkpydisetty@gmail.com'];

  // this must relate to a verified SES account
  var from = 'swaroopkpydisetty@gmail.com'

  // this sends the email
  // @todo - add HTML version
  return ses.sendEmail({
    Source: from,
    Destination: { ToAddresses: to },
    Message: {
      Subject: {
        Data: 'Message from ' + name
      },
      Body: {
        Text: {
          Data: 'Email: ' + fromMail +
          '\nPhone: ' + phone +
           '\n\nMessage: \n' + message,
        }
      }
    }
  }, function(err, data) {
    if(err) {
      return res.status(500).send(err);
    }
    // console.log('Email sent:');
    // console.log(data);
    return res.send('Email sent')
  });
})

http.createServer(app)
.listen(port, function (err) {
  if (err) console.log(err);
  console.log("Server is running on port " + port);
});
