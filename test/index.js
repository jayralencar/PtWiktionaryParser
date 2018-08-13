var parser = require("../parser")

parser.fetch(process.argv[2]).then(function(res){
  console.log(res[0].genders)
})