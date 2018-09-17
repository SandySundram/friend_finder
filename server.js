// npm packages
var path = require('path');
var express = require('express');
var session = require('express-session');
const fileUpload = require('express-fileupload');
var mysql = require('mysql')
var routes = require('./app/routes/routes.js')
// create an express app
var app = express();

app.use(session({ secret: 'app', cookie: { maxAge: 1*1000*60*60*24*365 }}));
// change default locations for views folder
app.set('views', path.join(__dirname, 'app/views'));
// use ejs templating
app.set('view engine', 'ejs');
app.use(fileUpload());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'app/public')));



app.use('/',routes);

app.listen(3000, function(){
    console.log('Listening on 3000');
});