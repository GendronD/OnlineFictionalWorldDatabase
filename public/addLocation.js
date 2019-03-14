module.exports = function(){
    var express = require('express');
    var router = express.Router();
  
    // Functions Here
    function getChaptersForUniv(req, res, mysql, context, complete){
        var inserts = [req.params.univID];
        var query = "SELECT chapterID, chapterNum, chapterTitle, chapterSummary, univID FROM Chapter "
        + "INNER JOIN Universe u ON u.universeID = univID "
        + "WHERE u.universeID = ? "
        + "ORDER BY chapterNum";
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.chapters = results;
            complete();
        })
    }
 
    function getEventsForUniv(req, res, mysql, context, complete){
        var inserts = [req.params.univID];
        var query = "SELECT eventID, eventName, eventDescription, eventTime, eventLocation, univID FROM Event "
        + "WHERE univID = ?";
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.events = results;
            complete();
        })
    }
    
    function getLocationsforUniv(req, res, mysql, context, complete){
        var inserts = [req.params.univID];
        var query = "SELECT locID, locName, locDescription, univID FROM Location "
        + "INNER JOIN Universe u ON u.universeID = univID "
        + "WHERE u.universeID = ?";
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.locations = results;
            complete();
        })
    }
    
    function getCharactersForUniv(req, res, mysql, context, complete){
        var inserts = [req.params.univID];
        var query = "SELECT charID, CONCAT(firstName, ' ', lastName) as charName, description, univID FROM Characters "
        + "INNER JOIN Universe u ON u.universeID = univID "
        + "WHERE u.universeID = ?";
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.characters = results;
            complete();
        })
    }

        // Insert Location
  router.post('/addLocation', function(req,res){
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO Locations (`locName`, `locDescription`, `univID`) VALUES (?, ?, ?)';
    var inserts = [req.body.locName, req.body.locDescription, req.body.univID];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }else{
        res.redirect('/manageuniverse');
      }
    });
  });

    router.get('/:univID', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getChaptersForUniv(req, res, mysql, context, complete);
        getEventsForUniv(req, res, mysql, context, complete);
        getLocationsforUniv(req, res, mysql, context, complete);
        getCharactersForUniv(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                res.render('manageuniverse', context);
            }
        }
    })
  
    return router;
}();
