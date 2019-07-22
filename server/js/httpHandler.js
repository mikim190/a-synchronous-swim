const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
var {dequeue} = require('./messageQueue.js');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);
  res.writeHead(200, headers);
  
  //GET method
  if(req.method === 'GET' ){
    if(req.url === '/'){
      res.writeHead(200, headers);
      res.end(dequeue());
    }

    if(req.url === '/background.jpg'){
      fs.readFile(module.exports.backgroundImageFile, (err, data) => {
        if(err) {
          res.writeHead(404, headers);
        } else {
          res.writeHead(200, headers);
          res.write(data, 'binary');
        }
        res.end();
        next();
      });
    }

    if(req.url === '/?command=random'){
      res.writeHead(200, headers);
      res.end(randomCommand());
    }
  }

  //POST method
  if(req.method === 'POST' && req.url === '/background.jpg') {
    var body = Buffer.alloc(0);
    req.on('data', (chunk) => {
      body = Buffer.concat([body, chunk]);
    });

    req.on('end', () => {
      var imageData = multipart.getFile(body);
      fs.writeFile(module.exports.backgroundImageFile, imageData, () => {
        res.writeHead(201, headers); 
        res.write(module.exports.backgroundImageFile); 
        res.end();
        next();
      });

    });
  }
  
  res.end();
};



function randomCommand() {
  //init commands array
  var commands = ['up', 'down', 'left', 'right'];
  //get randomNum between 0 and 3
  var randomIndex = Math.floor(Math.random() * commands.length);
  //return random value in commands array
  return commands[randomIndex];
}