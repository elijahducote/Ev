import { exec } from "child_process";
import liveServer from "live-server";
var count = 0;

function rebuild () {
  exec("esbuild automator.js --bundle --platform=browser --minify --tree-shaking=true --target=chrome112,firefox111,edge112,safari16 --outfile=./js/bundle.js", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
 });
}

liveServer.start({
    port: 8080,
    root: '.',
    file: 'index.html',
    open: false,
    wait: 1000,
    ignore:"js/*",
    middleware: [function(req, res, next) { next(); if (count & 1) rebuild();++count;if (count > 1) count = 0;}],
});