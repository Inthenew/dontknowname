let express = require('express');
let path = require('path');
let app = express();
app.get('/', function (req, res) {
    res.send('<h1>Coming soon...</h1>');
})
app.get('/game', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'game.html'));
})
app.get('/signup', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
})
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
})
app.get('/*', function (req, res) {
    res.status(404);
    res.send('<h1>404 - Not Found</h1>')
})
let server = require('http').createServer(app).listen(8081);
let io = require('socket.io')(server);
let connectCounter = 0;
let db;
let MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://Jack:Ilovedaddy9@cluster238.mbgnw.mongodb.net/HONEY?retryWrites=true&w=majority', function (err, client) {
    if (err) throw err;
    db = client.db('HONEY').collection('HONEY');
    done2();
})
function done2() {
    let str = ``;
    let messages = [];
    let done = false;
    function serverMessage(message) {
        messages.push(message);
        str = `${messages.join('</br></br>')}`;
        io.sockets.emit('str', messages);
    }
    serverMessage('Server: chat started!');
    io.sockets.on('connection', function (socket) {
        connectCounter++;
        console.log(`connection`);
        let data = {};
        socket.on('message', function (message) {
            messages.push(message);
            str = `${messages.join('</br></br>')}`;
            io.sockets.emit('str', messages);
        })
        socket.on('signin', function (data2) {
            data = data2;
            if (data.username !== null || undefined) {
                serverMessage(`Server: ${data.username} joined!`);
            }
        })
        socket.on('signup', function (data) {
            db.findOne({ username: data.username, password: data.password }, function (err, doc) {
                if (err) throw err;
                else if (doc === null) {
                    /*can go ahead and sign up*/
                    db.insertOne(data, function (err, d) {
                        if (err) throw err;
                    })
                    app.get(`/users/${data.username}/${data.password}`, function (req, res) {
                        res.send('<h1>403 - Forbidden</h1>');
                    })
                    socket.emit('signupsuccses', data);
                } else {
                    /*username and password alredy exist*/
                    socket.emit('signuperr', 'username and password exist!')
                }
            })
        })
        socket.on('login', function (data) {
            db.findOne({ username: data.username, password: data.password }, function (err, doc) {
                if (err) throw err;
                else if (doc === null) {
                    socket.emit('loginerr', 'Please try agian!')
                } else {
                    app.get(`/users/${data.username}/${data.password}`, function (req, res) {
                        res.send('<h1>403 - Forbidden</h1>');
                    })
                    socket.emit('loginsuccses', data);
                }
            })
        })
        socket.once('disconnect', function () {
            console.log(`disconnect`);
            if (data.username !== (null || undefined)) {
            serverMessage(`Server: ${data.username} left!`);
            }
            connectCounter--;
        })
    })
}