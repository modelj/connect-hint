var jshint = require('jshint').JSHINT;

exports = module.exports = function(content, done) {
    jshint(content);
    if (!jshint.data().errors) {
        done();
    }
    else {
        var warnings = [];
        for (var idx in jshint.data().errors) {
            var warn = jshint.data().errors[idx];
            var msg = {
                message: warn.reason.substr(0, warn.reason.length-1),
                line: warn.line,
                col: warn.character
            }
            warnings.push(msg);
        }
        done(warnings); 
    }
}
