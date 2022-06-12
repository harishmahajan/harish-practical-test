var user = require ('../controller/user.js');
var express = require ('express');
var jwt = require ('jsonwebtoken');
var apiRoutes = express.Router();
var config = require ('../config');

module.exports = function(app) {
    apiRoutes.use(function(req, res, next) {
        var token = req.body.token || req.query.token || req.headers.token;
        if (token) {
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.',
                        data: null
                    });
                } else {
                    req.user = decoded._doc;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.',
                data: null
            });
        }
    });

    app.use('/api', apiRoutes);

    app.post('/userLogin', user.login); // User Login
    app.post('/userRegister', user.register); // User Register
    app.get('/api/userList',user.usersList);
    app.get('/api/getSingleUser',user.getSingleUser);
    app.put('/api/updateUser',user.updateUser);
    app.delete('/api/deleteUser',user.deleteUser);
};