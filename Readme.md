# Hint Middleware

  Hint is a local development tool. With zero setup, it will keep
  you informed of possible problems in your CSS and JS code. 
  Any warning and errors will be reported automatically in your console,
  so you can iterate quickly and keep your code clean.
  

## How It Works

  This middleware evaluates only the code sent to your browser, 
  not the original content of your files. 
  As such, Hint plays nicely with most other middleware, including 
  compilers for Sass, LESS and CoffeeScript.

  Hint picks which code to scan based on requests to the server. For example, 
  if you request a page that includes a Javascript file 
  and two CSS files, only these three files will be scanned.

## Getting Started

  To ensure proper scanning, we recommend loading Hint above all other 
  middleware.

    var connect = require('connect')
      , http = require('http')
      , lint = require('connect-lint');

    var app = connect()
      .use(lint())
      .use(connect.logger('dev'))
      .use(connect.static('public'));

    http.createServer(app).listen(3000);


## Credits

This work rests on the shoulders of [JSHint](https://github.com/jshint/jshint/) and [CSSLint](https://github.com/stubbornella/csslint). Special thanks to Anton Kovalyov, Nicole Sullivan, Nicholas C. Zakas and all contributors to these great projects.

## License

View the [LICENSE](https://github.com/modelj/connect-hint/blob/master/LICENSE) file.
 