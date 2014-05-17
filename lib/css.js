var CSSLint = require("csslint").CSSLint;

exports = module.exports = function(content, done) {
    if (!content.length) {
        return done();
    }
    var result = CSSLint.verify(content);
    if (!result.messages.length) {
        done();
    }
    else {
        var warnings = [];
        for (var idx in result.messages) {
            var warn = result.messages[idx];
            var message = warn.message.split(" at line ")[0].replace(/\.$/, "");
            var msg = {
                message: message,
                line: warn.line,
                col: warn.col
            }
            warnings.push(msg);
        }
        done(warnings);
    }
}
