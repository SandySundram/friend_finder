var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Sundram2327",
    database: "friendfinder_db"
});

router.get('/',function(req,res){
    var errorMessage;
    if (req.session == 'undefined'){
        res.render('pages/index');
    }else{
        errorMessage = req.session.error;
        delete req.session.error;
        res.render('pages/index',{error: errorMessage});
    }
    
})

router.post('/send-answers',function(req,res){
    console.log(req.body);
    connection.query('SELECT full_name FROM users WHERE full_name = ?',[req.body.full_name],
        function(error, results, fields){
            if(error){
                return (error);
            }
            // console.log(results.length);
            if (results.length != 0){
                console.log('Name already exists');
                req.session.error = 'Profile already exists. Please try a new match';
                res.redirect('/');
            }else{
                connection.query('SELECT full_name,(abs(question1-?)+abs(question2-?)+abs(question3-?)+abs(question4-?)+abs(question5-?)+abs(question6-?)+abs(question7-?)+abs(question8-?)+abs(question9-?)+abs(question10-?)) Summary FROM users ORDER BY Summary ASC',
                    [parseInt(req.body.question1),parseInt(req.body.question2),parseInt(req.body.question3),parseInt(req.body.question4),parseInt(req.body.question5),parseInt(req.body.question6),parseInt(req.body.question7),parseInt(req.body.question8),parseInt(req.body.question9),parseInt(req.body.question10)],
                function(error,results,fields){
                    console.log(results);
                    req.session.match={username:req.body.full_name, matchname:results[0].full_name};
                    res.redirect('/results');
                    connection.query('INSERT INTO users SET ?',req.body,function(error,results,fields){
                        if(error){
                            return (error);
                        }
                    });
                });
            }        
    });

})

router.get('/results', function(req,res){
    var userName = req.session.match.username;
    var matchName = req.session.match.matchname;
    delete req.session.match;
    res.render('pages/results',{userName: userName, matchName: matchName})
})


module.exports = router;