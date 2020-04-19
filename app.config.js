'use strict';
/*jshint -W101 */
module.exports = function () {
    var config = {
        env: {
            PORT: 6004,
            MONGO_DB: 'mongodb+srv://admin:passw0rd@cluster0-vzlo8.mongodb.net/c3-mock-blockchain'
        }
    };

    return config;
};
/*jshint +W101 */