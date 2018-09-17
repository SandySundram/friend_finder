var express = require('express');
var router = express.Router();
var path = require('path')
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
    console.log(req.files);

    var fullName = req.body.full_name.split(' ');
    for(var i=0; i < fullName.length; i++){
        fullName[i] = fullName[i].substr(0,1).toUpperCase()+fullName[i].substr(1);
    }
    req.body.full_name = fullName.join(' ');
    connection.query('SELECT full_name FROM users WHERE full_name = ?',[req.body.full_name],
        function(error, results, fields){
            if(error){
                return (error);
            }
            console.log(results.length);
            if (results.length != 0){
                console.log('Name already exists');
                req.session.error = 'Profile already exists. Please try a new match';
                res.redirect('/');
            }else{

                //upload image
                fullName = req.body.full_name.split(' ');
                var fileName = ""
                if (req.files.photourl) {
                    var ext = req.files.photourl.mimetype.split('/')[1]
                    var photoFile = req.files.photourl
                    fileName = fullName.join('_')+"."+ext;
                    photoFile.mv(path.join(__dirname,'../public/assets/images/')+fileName, function(err) {
                        if (err) {
                            throw (err)
                        }
                    });
                }


                connection.query('SELECT full_name,photourl,(abs(question1-?)+abs(question2-?)+abs(question3-?)+abs(question4-?)+abs(question5-?)+abs(question6-?)+abs(question7-?)+abs(question8-?)+abs(question9-?)+abs(question10-?)) Summary FROM users ORDER BY Summary ASC',
                    [parseInt(req.body.question1),parseInt(req.body.question2),parseInt(req.body.question3),parseInt(req.body.question4),parseInt(req.body.question5),parseInt(req.body.question6),parseInt(req.body.question7),parseInt(req.body.question8),parseInt(req.body.question9),parseInt(req.body.question10)],
                function(error,results,fields){
                    if(error){
                        console.log(error,fields);
                        return (error);
                    }
                    console.log(results);
                    req.session.match={username:req.body.full_name, 
                                        matchname:results[0].full_name,
                                        matchphoto: results[0].photourl,
                                        userphoto: fileName};
                    res.redirect('/results');
                    connection.query('INSERT INTO users SET ?',
                                        {full_name: req.body.full_name,
                                         question1: req.body.question1,
                                         question2: req.body.question2,
                                         question3: req.body.question3,
                                         question4: req.body.question4,
                                         question5: req.body.question5,
                                         question6: req.body.question6,
                                         question7: req.body.question7,
                                         question8: req.body.question8,
                                         question9: req.body.question9,
                                         question10: req.body.question10,
                                         photourl: fileName},
                                        function(error,results,fields){
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
    var userPhoto = req.session.match.userphoto;
    var matchPhoto = req.session.match.matchphoto;
    delete req.session.match;
    req.session.destroy( function (err) {
        if (err) {
          return next(err)
        }
    });
    res.render('pages/results',{userName: userName, 
                                matchName: matchName,
                                userPhoto: userPhoto,
                                matchPhoto: matchPhoto});
})


module.exports = router;