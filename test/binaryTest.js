var should = require("should"),
    helpers = require("./helpers");


describe("binary", function() {

    before(function(done) {
        return helpers.startServer(done);
    });

    describe("linter", function() {
        
        it("should not attempt to scan a binary file", function(done) {
            helpers.get("bg.png", function(err, resp, body) {
                return done();
            });
        });
    });
});
