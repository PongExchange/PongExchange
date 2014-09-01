"use strict";

(function(exports) {
    var debug = require('neo-debug')('web.HomeController');
    var recentgames = require('RecentGames');

    function * indexGET() {
        var recentGames = yield recentgames.getRecentGames();
        var model = { recentGames: recentGames }
        yield this.render('games/recent', model);
    }

    //function * allGET() {
    //    var allGames = yield recentgames.getAllGames();
    //    var model = { games: allGames };
    //    yield this.render('recentgames/all', model);
    //}

    exports.indexGET = indexGET;
    //exports.allGET = allGET;
})(module.exports);
