var mongoose = require ('mongoose');
var config = require ('../config');
var jwt = require ('jsonwebtoken');
var async = require ('async');
var qs = require ('querystring');
var chalk = require ('chalk');

var register = mongoose.model("user");

exports.login = function(req, res) {
  try {
    var receivedValues = req.body;
    if (JSON.stringify(receivedValues) === '{}' || receivedValues === undefined || receivedValues === null) {
      console.log(chalk.red("### Error Message: User Not available"));
      res.json({
        "code": 403,
        "status": "Error",
        "message": "User Not available!"
      });
      return;
    } else {
    var usercolumns = ["mail", "password"];
      for (var iter = 0; iter < usercolumns.length; iter++) {
        var columnName = usercolumns[iter];
        if (receivedValues[columnName] === undefined && (columnName === 'mail' || columnName === 'password')) {
          console.log(chalk.red(columnName, " field is undefined"));
          res.json({
            "code": 403,
            "status": "Error",
            "message": columnName + " field is undefined"
          });
          return;
        }
      }
      var user = new register();
      user.mail = req.body.mail;
      user.password = req.body.password;
  
      register.findOne({
        'mail': req.body.mail
      }, function(err, userDetail) {
        if (userDetail !== null) {
          if (userDetail.validPassword(req.body.password)) {
            var authToken = jwt.sign(userDetail, config.secret, {
              expiresIn: 1440 * 60 * 30 // expires in 24 hours
            });
            var data = {
              email: userDetail.mail,
              address: userDetail.address,
              status: "success"
            };
            res.json({
              "code": 200,
              "token": authToken,
              "data": data
            });
          } else {
            console.log(chalk.red("### Error Message: Email or Password is Worng"));
            res.json({
              "code": 403,
              "status": "Error",
              "message": "Email or Password is Worng"
            });
          }
        } else {
          console.log(chalk.red("### Error Message: Email or Password is Worng"));
          res.json({
            "code": 403,
            "status": "Error",
            "message": "Email or Password is Worng"
          });
        }
      });
    }    
  } catch (error) {
    console.log(" Error ",error);
  }

};

exports.register = function(req, res) {
  try {
    var receivedValues = req.body;
    if (JSON.stringify(receivedValues) === '{}' || receivedValues === undefined || receivedValues === null) {
      console.log(chalk.red("### Error Message: Invalid Data Enter"));
      res.json({
        "code": 403,
        "status": "Error",
        "message": "Invalid Data Enter"
      });
      return;
    } else {
      register.findOne({
        'mail': req.body.mail
      }, function(err, user) {
        if (user === null) {
          var userdata = new register();
          userdata.password = userdata.generateHash(req.body.password);
          userdata.mail = req.body.mail;
          userdata.username = req.body.username;
          userdata.save(function(err, login) {
            if (!err) {
              var data = {
                mail: login.mail,
                username: login.username,
                status: "success"
              };
              var authToken = jwt.sign(userdata, config.secret, {
                expiresIn: 1440 * 60 * 30 // expires in 1440 minutes
              });
              res.json({
                "code": 200,
                "token": authToken,
                "data": data
              });
            } else {
              res.json(false);
            }
          });
        } else {
          console.log(chalk.red("### Error Message: Account already exiting"));
          res.json({
            "code": 403,
            "status": "Error",
            "message": "Account already exiting"
          });
        }
      });
    }
      
  } catch (error) {
    console.log("Error : ",error)    
  }
};


exports.usersList = function(req, res) {
   try {
    
    register.find({}, function(err, userDetail) {
      if (userDetail !== null) {
        console.log(userDetail);
        res.json({
          "code": 200,
          "status": "success",
          "message": "List is available",
          "data":userDetail
        });
      } else {
        console.log(chalk.red("### Error Message: Email or Password is Worng"));
        res.json({
          "code": 403,
          "status": "Error",
          "message": "Email or Password is Worng"
        });
      }
    });
   } catch (error) {
    console.log("Error : ",error)
   }
  
};

exports.getSingleUser = function(req, res){
  try {
    register.findOne({
      '_id': req.query.uid
    },function(err,userData){
      if(userData !== null){
        res.json({
          "code": 200,
          "status": "success",
          "message": "List is available",
          "data":userData
        });
      }
      else{
        res.json({
          "code": 403,
          "status": "success",
          "message": "User not found"
          });
      }
    })
  } catch (error) {
    console.log("Error : ",error);
  }
};

exports.updateUser = function(req, res){
  try {
    register.update({
      "_id": req.body.uid}, 
    {$set: {"_id":  req.body.uid,"username": req.body.username,"mail": req.body.mail}}, {upsert:true},function(err,userData){
      if(userData !== null){
        res.json({
          "code": 200,
          "status": "success",
          "message": "Data updated successfully",
          "data":userData
        });
      }
      else{
        res.json({
          "code": 403,
          "status": "success",
          "message": "User not found"
          });
      }
    })
  } catch (error) {
    console.log("Error: ",error)
  }
};

exports.deleteUser = function(req, res){
try {
  register.remove({
    "_id": req.body.uid},function(err,userData){
    if(userData !== null){
      res.json({
        "code": 200,
        "status": "success",
        "message": "Data deleted successfully",
        "data":userData
      });
    }
    else{
      res.json({
        "code": 403,
        "status": "success",
        "message": "User not found"
        });
    }
  })
} catch (error) {
  console.log("Error: ", error)
}
};