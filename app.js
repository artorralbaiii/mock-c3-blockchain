'use strict'

const userFiles = './user_upload/';

// Vendor
let bodyParser = require('body-parser')
let cfenv = require('cfenv')
let express = require('express')
let cors = require('cors')
let mongoose = require('mongoose')

// Mongo DB Connection 
// mongoose.connect('mongodb://admin:passw0rd@ds061681.mlab.com:61681/fnoldb',
//     {}, (err) => (err) ? console.log(err) : console.log('Connected to database...'))
mongoose.connect('mongodb+srv://admin:passw0rd@cluster0-vzlo8.mongodb.net/c3-mock-blockchain',
    {}, (err) => (err) ? console.log(err) : console.log('Connected to database...'))

// express server
let app = express()
// const server = require('http').createServer(app)

// Parse incoming request as JSON.
app.use(bodyParser.urlencoded({ extended: false, keepExtensions: true }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors())
app.use('/files', express.static(userFiles))

// Allow access to static files in Public folder
app.use(express.static('public'))

// API Router
let api = require('./router')(app, express)
app.use('/api', api)

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// get the app environment from Cloud Foundry
let appEnv = cfenv.getAppEnv();


// const io = require('socket.io')(server);
// io.on('connection', () => {
//     console.log('SOCKET SERVER: Client is connected')
// });
// server.listen(3000);

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', () => {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url)
})