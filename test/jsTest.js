var should = require("should"),
    helpers = require("./helpers");


describe("javascript", function() {

    before(function(done) {
        return helpers.startServer(done);
    });

    describe("linter", function() {
        
        it("should detect good code", function(done) {
            helpers.get("js.js", function(err, resp, body) {
                return done();
            });
        });

        it("should detect bad code", function(done) {
            helpers.get("js-bad.js", function(err, resp, body) {
                return done();
            });
        });


        it("should skip bad code if contained in @lib block", function(done) {
            helpers.get("js-part-bad.js", function(err, resp, body) {
                return done();
            });
        });

    });
});
