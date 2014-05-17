var jshint = require('jshint').JSHINT;
exports = module.exports = function(content, log) {
    jshint(content);
    if (!jshint.data().errors) {
        log(null, "Javascript");
    }
    else {
        // prepare each warning for display by middleware
        for (var idx in jshint.data().errors) {
            var warn = jshint.data().errors[idx];
            // if there are too many errors, avoid null warnings
            if (warn !== null) {
                log({
                    message: warn.reason.substr(0, warn.reason.length-1),
                    line: warn.line,
                    col: warn.character
                }, "Javascript");
            }
        }
    }
}
