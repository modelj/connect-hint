/*! * 
 * Hint - Connect Middleware
 * Copyright(c) 2014 Paper & Equator, LLC
 * Copyright(c) 2014 West Lane
 * MIT Licensed
 */

var scanCSS = require("./lib/css");
var scanJavascript = require("./lib/javascript");

/**
* Hint Middleware
*/
exports = module.exports = function(options){

    options = options || {};

    /* 
     *  Logs errors and warnings to console by default
     */
    var _onError = options.error || function (path, message, line, col) {
        var msg = path + ": " + message;
        msg += " at line " + line + ", col " + col + ".";
        console.log(msg);
    }
    
    /* 
     *  Logs success messages to console by default
     */
    var _onSuccess = options.success || function(path) {
        console.log(path + ": valid");
    }

    // based on content type, which hint tools will we use?
    var scan_map = {
        "application/javascript": scanJavascript,
        "text/css": scanCSS
    }

    return function HintMiddleware(req, res, next) {
        if ('GET' != req.method) return next();

        var write = res.write
            , end = res.end
            , scanFn = null,
            chunks = [];
        // overload write() so we can scan what we're sending to browser
        res.write = function(chunk, encoding){
            // never alter or delay the planned response
            write.apply(res, arguments);
            
            if (res.getHeader("content-type")) {
                // run this only once to find applicable scanner
                if (scanFn === null) {
                    var content_type = res.getHeader("content-type")
                        .match(/[a-z]*\/[a-z]*/)[0];
                    scanFn = scan_map[content_type];
                }
            }

            // did we find a scan function to execute?
            if (scanFn) {
                chunks.push(chunk);
            }
        };

        // overload end() to ensure we know when content sending is finished
        res.end = function(chunk, encoding){
            // never alter or delay the planned response
            if (chunk) {
                this.write(chunk, encoding);
            }
            end.call(res);
            // now execute the scan function, if available
            if (scanFn) {
                var path = req._parsedUrl.pathname;
                path = path.substr(1, path.length);
                var body = Buffer.concat(chunks).toString("utf8");
                // now execute hinting and log results
                _scan(path, body, scanFn);
            }
        };

        next();
    }

    /* 
     *  Scans code for errors and warnings
     */
    function _scan(path, content, fn) {
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
                    _onError(path, warn.message, warn.line+line_offset, warn.col);
                }
            }
            else {
                _onSuccess(path);
            }
        });
    }

};
