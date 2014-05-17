var CSSLint = require("csslint").CSSLint;
exports = module.exports = function(content,log) {
    var result = CSSLint.verify(content);
    if (!result.messages.length) {
        log(null, "CSS");
    }
    else { 
        for (var idx in result.messages) {
            var warn = result.messages[idx];
            var message = warn.message.split(" at line ")[0].replace(/\.$/, "");
            log({
                message: message,
                line: warn.line,
                col: warn.col
            }, "CSS");
        }
    }
}