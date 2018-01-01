let fetch = require('node-fetch');
let cheerio = require('cheerio');
let fs = require('fs');


const link = 'https://mp3.zing.vn/bai-hat/Nguoi-Em-Mo-Vu-Thao-My/ZW8WC08I.html'


fetch(link)
.then(raw => raw.text())
.then(res => {
    let $ = cheerio.load(res, { decodeEntities: false });
    let p = $('.fn-wlyrics.fn-content').html()
    console.log(p)
    // fs.writeFile('test.txt', JSON.stringify(p.split(',').join('').split('\n').join('').split('<br>')))

})
