var should = require("should"),
    helpers = require("./helpers");


describe("stylesheet", function() {

    before(function(done) {
        return helpers.startServer(done);
    });

    describe("linter", function() {
        
        it("should detect good code", function(done) {
            helpers.get("css.css", function(err, resp, body) {
                return done();
            });
        });

        it("should detect bad code", function(done) {
            helpers.get("css-bad.css", function(err, resp, body) {
                return done();
            });
        });


        it("should skip bad code if contained in @lib block", function(done) {
            helpers.get("css-part-bad.css", function(err, resp, body) {
                return done();
            });
        });

    });
});
