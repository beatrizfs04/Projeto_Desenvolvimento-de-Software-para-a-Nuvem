/* Requirements */
const path = require('path');
const express = require('express');
const app = express();

const api = require('./api');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* WEB */
app.get('/', function(req, res) { res.sendFile(path.join(__dirname, '/web/index.html')) });
app.get('/showBooks', function(req, res) { res.sendFile(path.join(__dirname, '/web/showBooks/index.html')) });
app.get('/showBook', function(req, res) { res.sendFile(path.join(__dirname, '/web/showBook/index.html')) });
app.get('/updateBook', function(req, res) { res.sendFile(path.join(__dirname, '/web/updateBook/index.html')) });
app.get('/insertBook', function(req, res) { res.sendFile(path.join(__dirname, '/web/insertBook/index.html')) });
app.get('/deleteBook', function(req, res) { res.sendFile(path.join(__dirname, '/web/deleteBook/index.html')) });

/* API */
app.use('/api/', api);
app.use('/styles', function(req, res) { res.sendFile(path.join(__dirname, '/web/styles.css')) });
app.use('/scripts', function(req, res) { res.sendFile(path.join(__dirname, '/web/scripts.js')) });

/* ON LOAD */
app.listen(5000, () => { console.log(`> http://localhost:5000`) });