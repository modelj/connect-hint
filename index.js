/*! * 
 * Lint - Connect Middleware
 * Copyright(c) 2014 Paper & Equator, LLC
 * Copyright(c) 2014 West Lane
 * MIT Licensed
 */

var lintCSS = require("./lib/css");
var lintJavascript = require("./lib/javascript");

/**
* Lint Middleware
*/
exports = module.exports = function(options){

    options = options || {};

    // based on content type, which lint tools will we use?
    var lint_map = {
        "application/javascript": lintJavascript,
        "text/css": lintCSS
    }

    return function LintMiddleware(req, res, next) {
        var write = res.write
            , end = res.end
            , lint_fn = null,
            content = "";

        req.on('close', function(){
            res.write = res.end = function(){};
        });

        // overload write() so we can scan what we're sending to browser
        res.write = function(chunk, encoding){
            if (!lint_fn) {
                var content_type = res.getHeader("content-type")
                    .match(/[a-z]*\/[a-z]*/)[0];
                lint_fn = lint_map[content_type];
            }

            // skip unspported content types
            if (lint_fn) {
                // otherwise, build this content into part of the scan
                content += String(chunk);
            }
            // now proceed as usual
            return write.call(res, chunk, encoding);
        };

        // overload end() to ensure we know when content sending is finished
        res.end = function(chunk, encoding){
            if (chunk) {
                this.write(chunk, encoding);
            }
            // skip unsupported content types
            if (typeof(lint_fn) == "function") {
                var path = req._parsedUrl.pathname;
                path = path.substr(1, path.length);
                // now execute linting and log results
                _lint(path, content, lint_fn);
            }
            return end.call(res);
        };
        next();
    }
};

function _lint(path, content, fn) {
    var line_offset = 0;
    // you can omit third-party code by surrounding it with an @lib block
    var matches = content.match(/\/\* @ignore:start(.)*\*\/(\n|.)*\/\* @ignore:end \*\//g);
    if (matches) {
        line_offset = -1;
        for (var idx in matches) {
            // don't scan this part
            var item = matches[idx];
            content = content.replace(item, "");
            line_offset += item.split(/\r\n|\r|\n/).length;
        }
    }

    fn(content, function(warnings) {
        if (warnings) {
            for (var idx in warnings) {
                var warn = warnings[idx];
                // make sure we account for scan offset from library code
                _log(path, warn.message, warn.line+line_offset, warn.col);
            }
        }
    });
}

function _log(path, message, line, col) {
    var msg = path + ": " + message;
    msg += " at line " + line + ", col " + col + ".";
    console.log(msg);
}
