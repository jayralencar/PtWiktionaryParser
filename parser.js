'use strict';
var request = require('request');
var cheerio = require('cheerio');

var $;
var type;

function Parser() {

}

Parser.prototype.$;
Parser.prototype.word;

Parser.prototype.fetch = function (word) {
    type = type;
    var self = this;
    return new Promise((resolve, reject) => {
        request('https://pt.wiktionary.org/wiki/' + word + '?printable=yes', function (error, response, html) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(html);
                var types = [];
                var el = $('.toclevel-1').first().find('ul').find('.toclevel-2').each(function (i, item) {
                    var name = $(item).children('a').children('span.toctext').text();
                    if (["Substantivo", "Verbo", "Adjetivo", "Artigo", "Pronome"].indexOf(name) > -1)
                        types.push(name);
                });
                resolve(self.get_data(types, word));
            } else {
                reject(error)
            }
        });
    })

}

Parser.prototype.get_data = function (types,word) {
    var promises = [];
    var self = this;
    types.forEach(element => {
        promises.push(new Promise((resolve, reject) => {
            var POS = getPOS(element);
            var method = null;
            switch (POS) {
                case 'n': method = self.get_noun; break;
                case 'v': method = self.get_verb; break;
            }
            if (method) {
                method(word).then(function (res) {
                    resolve(res)
                })
            }
        }))


    });
    return Promise.all(promises);
}

Parser.prototype.get_noun = function (word) {
    var self = this;
    return new Promise((resolve, reject) => {
        $('#Substantivo').parent().next().find('tr').each(function(i, el){
            if(word == $(el).find('td').first().next().children('a').text()){
                resolve({
                    post: 'n',
                    gender: $(el).find('td').first().children('b').children('a').text(),
                    singular: $(el).find('td').first().next().children('a').text(),
                    plural: $(el).find('td').first().next().next().children('a').text()
                })
            }
        });
    })
}

Parser.prototype.get_verb = function(word){
    return new Promise((resolve, reject)=>{
        var navFrame = $('#Conjugação').parent().next();
        var forms = navFrame.find('table').first();
        var conj = navFrame.find('table').eq(1);

        var verbForms = {
            infinitive: forms.find('tr').children('td').eq(1).text().trim(),
            gerundio: forms.find('tr').children('td').eq(3).text().trim(),
            participio: forms.find('tr').children('td').eq(5).text().trim()
        }


        var present = {
            singular:{
                first: conj.children('tbody').children('tr').eq(2).children('td').eq(2).text().trim(),
                second: conj.children('tbody').children('tr').eq(2).children('td').eq(3).text().trim(),
                third: conj.children('tbody').children('tr').eq(2).children('td').eq(4).text().trim(),
            },
            plural: {
                first: conj.children('tbody').children('tr').eq(2).children('td').eq(5).text().trim(),
                second: conj.children('tbody').children('tr').eq(2).children('td').eq(6).text().trim(),
                third: conj.children('tbody').children('tr').eq(2).children('td').eq(7).text().trim(),
            }
        }

        var past = {
            singular:{
                first: conj.children('tbody').children('tr').eq(4).children('td').eq(1).text().trim(),
                second: conj.children('tbody').children('tr').eq(4).children('td').eq(2).text().trim(),
                third: conj.children('tbody').children('tr').eq(4).children('td').eq(3).text().trim(),
            },
            plural: {
                first: conj.children('tbody').children('tr').eq(4).children('td').eq(4).text().trim(),
                second: conj.children('tbody').children('tr').eq(4).children('td').eq(5).text().trim(),
                third: conj.children('tbody').children('tr').eq(4).children('td').eq(6).text().trim(),
            }
        }

        var future = {
            singular:{
                first: conj.children('tbody').children('tr').eq(6).children('td').eq(1).text().trim(),
                second: conj.children('tbody').children('tr').eq(6).children('td').eq(2).text().trim(),
                third: conj.children('tbody').children('tr').eq(6).children('td').eq(3).text().trim(),
            },
            plural: {
                first: conj.children('tbody').children('tr').eq(6).children('td').eq(4).text().trim(),
                second: conj.children('tbody').children('tr').eq(6).children('td').eq(5).text().trim(),
                third: conj.children('tbody').children('tr').eq(6).children('td').eq(6).text().trim(),
            }
        }

        resolve({
            forms: verbForms,
            conjugation: {
                present: present,
                past: past,
                future: future
            }
        })
        
        // console.log(forms.html())
    })
}

function getPOS(name) {
    var names = ["Substantivo", "Verbo", "Adjetivo", "Artigo", "Pronome"];
    var POS = ['n', 'v', 'adj', 'a', 'pr']
    return POS[names.indexOf(name)];
}

module.exports = new Parser();