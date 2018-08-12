# PtWiktionaryParser
A parser for PT wiktionary

# Install
´´´
    npm install git+https://github.com/jayralencar/PtWiktionaryParser
´´´

# Usage
´´´
var parser = require("ptwikiparser")

parser.fetch(process.argv[2]).then(function(res){
  console.log(res)
})
´´´
