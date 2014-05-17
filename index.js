/*! * 
 * Lint - Connect Middleware
 * Copyright(c) 2014 Paper & Equator, LLC
 * Copyright(c) 2014 West Lane
 * MIT Licensed
 */

var winston = require("winston");
var scanCSS = require("./lib/css");
var scanJavascript = require("./lib/javascript");


/**
* Lint Middleware
*/
exports = module.exports = function(options){

    options = options || {};

    // based on content type, which lint tools will we use?
    var scan_map = {
        "application/javascript": scanJavascript,
        "text/css": scanCSS
    }

    return function LintMiddleware(req, res, next) {
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
                var body = Buffer.concat(chunks).toString("utf8");
                // now execute linting and log results
                _scan(path, body, scanFn);
            }
        };
        next();
    }

    /* 
     *  Scans code for errors and warnings
     */
    function _scan(path, content, fn) {
        var offset = 0;
        // you can omit third-party code by surrounding it with an @lib block
        var matches = content.match(/\/\* @ignore:start(.)*\*\/(\n|.)*\/\* @ignore:end \*\//g);
        if (matches) {
            offset = -1;
            for (var idx in matches) {
                // don't scan this part
                var item = matches[idx];
                content = content.replace(item, "");
                offset += item.split(/\r\n|\r|\n/).length;
            }
        }
        if (content.length) {
            fn(content, function(err,type) {
                if (err) {
                    winston.warn("%s: %s at line %s, col %s.", 
                    path.substr(1, path.length), err.message, err.line+offset, err.col);
                }
                else {            
                    // success, no need to report any errors
                    winston.info("%s: Valid %s", path.substr(1, path.length), type);
                }
            }); 
        }
    }

};
