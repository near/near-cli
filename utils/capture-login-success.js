const http = require('http');
const url = require('url');
const stoppable = require('stoppable'); // graceful, effective server shutdown
const tcpPortUsed = require('tcp-port-used'); // avoid port collisions

let server;

/**
    extract arbitrary collection of fields from temporary HTTP server
    server processes a single request and then shuts down gracefully

    @param fields array of fields to extract from req.url.query
    @param port the port the server should use
    @param hostname the hostname the server should use
 */
const payload = (fields, { port, hostname }, redirectUrl) => new Promise((resolve, reject) => {
    server = stoppable(http.createServer(handler)).listen(port, hostname);

    /**
        request handler for single-use node server
     */
    function handler(req, res){
        try {
            let parsedUrl = url.parse(req.url, true);
            let results = fields.map((field) => parsedUrl.query[field]);

            if (Object.keys(parsedUrl.query).length > 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                // TODO: Make code more specialized (vs handling generic fields) and only output this if login succeeded end to end
                res.end(renderWebPage('You are logged in. Please close this window.'), () => {
                    server.stop();
                    resolve(results);
                });
            } else {
                res.writeHead(302, { Location: redirectUrl });
                res.end();
            }
        } catch (e) {
            console.error('Unexpected error: ', e);
            res.statusCode = 400;
            res.end('It\'s a scam!');
            server.stop();
            reject(new Error('Failed to capture accountId'));
        }
    }
});


/**
    attempt to find the first suitable (open) port
    @param port the starting port on the computer to scan for availability
    @param hostname the hostname of the machine on which to scan for open ports
    @param range the number of ports to try scanning before giving up
 */
const callback = async (port = 3000, hostname = '127.0.0.1', range = 10) => {
    if (process.env.GITPOD_WORKSPACE_URL) {
        // NOTE: Port search interferes with GitPod port management
        return { port, hostname };
    }

    const start = port;
    const end = start + range;
    let inUse = true;

    for (;port <= end; port++) {
        try {
            inUse = await tcpPortUsed.check(port, hostname);
            if (!inUse) {
                break; // unused port found
            }
        } catch (e) {
            console.error('Error while scanning for available ports.', e.message);
        }
    }

    if(inUse) {
        throw new Error(`All ports in use: [ ${start} - ${end} ]`);
    }

    return { port, hostname };
};

const cancel = () => {
    if (server) server.stop();
};

module.exports = { payload, callback, cancel };


/**
    helper to render a proper success page
 */
function renderWebPage(message){
    const title = 'NEAR Account Authorization Success';

    // logo and font from https://near.org/brand/
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${title}</title>
  <link rel='stylesheet' href='https://use.typekit.net/pqx2pko.css?ver=5.3' type='text/css' media='all' />
  <style>
    body {
      font-family: benton-sans,sans-serif;
    }

    #container {
        display: flex;              /* establish flex container */
        flex-direction: column;     /* stack flex items vertically */
        justify-content: center;    /* center items vertically, in this case */
        align-items: center;        /* center items horizontally, in this case */
        height: 80vh;
    }

    .box {
        width: 400px;
        text-align: center;
    }
  </style>
</head>
<body>
    <div id="container">
      <div class="box">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 414 162"><defs><style>.cls-1{fill:url(#New_Gradient_Swatch_1);}.cls-2{fill:#24272a;}</style><linearGradient id="New_Gradient_Swatch_1" x1="39.01" y1="122.98" x2="122.98" y2="39.01" gradientUnits="userSpaceOnUse"><stop offset="0.21" stop-color="#24272a"/><stop offset="0.42" stop-color="#24272a" stop-opacity="0"/><stop offset="0.59" stop-color="#24272a" stop-opacity="0"/><stop offset="0.81" stop-color="#24272a"/></linearGradient></defs><title>near_logo</title><path class="cls-1" d="M46.29,126a10.29,10.29,0,0,0,7.79-3.57h0l70.35-81.61A10.29,10.29,0,0,0,115.71,36h0a10.28,10.28,0,0,0-7.75,3.53L37.27,120.66A10.27,10.27,0,0,0,46.29,126Z"/><path class="cls-2" d="M46.29,126A10.18,10.18,0,0,0,51,124.85V56.72l54.65,65.58a10.32,10.32,0,0,0,7.91,3.7h2.15A10.29,10.29,0,0,0,126,115.71V46.29A10.29,10.29,0,0,0,115.71,36h0A10.32,10.32,0,0,0,111,37.13v68.15L56.35,39.7A10.32,10.32,0,0,0,48.44,36H46.29A10.29,10.29,0,0,0,36,46.29v69.42A10.29,10.29,0,0,0,46.29,126Z"/><path class="cls-2" d="M207.21,54.75v52.5a.76.76,0,0,1-.75.75H201a7.49,7.49,0,0,1-6.3-3.43l-24.78-38.3.85,19.13v21.85a.76.76,0,0,1-.75.75h-7.22a.76.76,0,0,1-.75-.75V54.75a.76.76,0,0,1,.75-.75h5.43a7.52,7.52,0,0,1,6.3,3.42l24.78,38.24-.77-19.06V54.75a.75.75,0,0,1,.75-.75h7.22A.76.76,0,0,1,207.21,54.75Z"/><path class="cls-2" d="M281,108h-7.64a.75.75,0,0,1-.7-1L292.9,54.72A1.14,1.14,0,0,1,294,54h9.57a1.14,1.14,0,0,1,1.05.72L324.8,107a.75.75,0,0,1-.7,1h-7.64a.76.76,0,0,1-.71-.48l-16.31-43a.75.75,0,0,0-1.41,0l-16.31,43A.76.76,0,0,1,281,108Z"/><path class="cls-2" d="M377.84,106.79,362.66,87.4c8.57-1.62,13.58-7.4,13.58-16.27,0-10.19-6.63-17.13-18.36-17.13H336.71a1.12,1.12,0,0,0-1.12,1.12h0a7.2,7.2,0,0,0,7.2,7.2H357c7.09,0,10.49,3.63,10.49,8.87s-3.32,9-10.49,9H336.71a1.13,1.13,0,0,0-1.12,1.13v26a.75.75,0,0,0,.75.75h7.22a.76.76,0,0,0,.75-.75V87.87h8.33l13.17,17.19a7.51,7.51,0,0,0,6,2.94h5.48A.75.75,0,0,0,377.84,106.79Z"/><path class="cls-2" d="M258.17,54h-33.5a1,1,0,0,0-1,1h0A7.33,7.33,0,0,0,231,62.33h27.17a.74.74,0,0,0,.75-.75V54.75A.75.75,0,0,0,258.17,54Zm0,45.67h-25a.76.76,0,0,1-.75-.75V85.38a.75.75,0,0,1,.75-.75h23.11a.75.75,0,0,0,.75-.75V77a.75.75,0,0,0-.75-.75H224.79a1.13,1.13,0,0,0-1.12,1.13v29.46a1.12,1.12,0,0,0,1.12,1.12h33.38a.75.75,0,0,0,.75-.75v-6.83A.74.74,0,0,0,258.17,99.67Z"/></svg>
            <p>${message}</p>
        </div>
    </div>
</body>
</html>
    `;
}
