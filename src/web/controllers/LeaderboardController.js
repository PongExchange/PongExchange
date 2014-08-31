"use strict";

(function(exports) {
    var debug = require('neo-debug')('web.HomeController');
    var ratings = require('Ratings');

    function * indexGET() {
        yield this.render('leaderboard/index');
    }

    function * overallGET() {
        var overallRatings = yield ratings.getOverallRatings();
        var model = { ratings: overallRatings };
        yield this.render('leaderboard/overall', model);
    }

    exports.indexGET = indexGET;
    exports.overallGET = overallGET;
})(module.exports);