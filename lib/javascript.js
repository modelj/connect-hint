var jshint = require('jshint').JSHINT;

exports = module.exports = function(content, done) {
    if (!content.length) {
        return done();
    }
    jshint(content);
    if (!jshint.data().errors) {
        // success, no need to report any errors
        done();
    }
    else {
        var warnings = [];
        // prepare each warning for display by middleware
        for (var idx in jshint.data().errors) {
            var warn = jshint.data().errors[idx];
            // if there are too many errors, avoid null warnings
            if (warn !== null) {
                var msg = {
                    message: warn.reason.substr(0, warn.reason.length-1),
                    line: warn.line,
                    col: warn.character
                }
                warnings.push(msg);
            }
        }
        // let's send back a list of all the warnings
        done(warnings); 
    }
}
