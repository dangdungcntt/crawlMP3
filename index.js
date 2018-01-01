let fetch = require('node-fetch');
let cheerio = require('cheerio');
let fs = require('fs');

const link = 'https://mp3.zing.vn/bai-hat/Buon-Cua-Anh-K-ICM-Dat-G-Masew/ZW8WD9BE.html'

let mapLyric = new Map();
let mapSingers = new Map();
let mapSongs = new Map();

let iSinger = 1
let iSong = 1

const clearString = (s) => {
    return s.replace(new RegExp(/\(|\)|\"|\'|\?|\,|(ĐK:)|(Chorus:)|\n/, 'g'), '')
}

const parseLink = async (link) => {
    console.log('Parsing ' + link);
    return fetch(link)
        .then(raw => raw.text())
        .then(res => {
            let $ = cheerio.load(res, { decodeEntities: false });
            let lyrics = $('.fn-wlyrics.fn-content').html();
            if (!lyrics) return;
            lyrics = clearString($('.fn-wlyrics.fn-content').html());
            let songName = clearString($('.fn-wlyrics.title .fn-name')[0].children[0].data.trim());
            // console.log("SONG NAME " + songName)
            let singer = clearString($('.artist-info h2 a').text().trim());
            if (!mapSingers.has(singer))mapSingers.set(singer, iSinger++);
            mapSongs.set(link, { id: iSong++, singer: mapSingers.get(singer), name: songName });
            let arrLyrics = lyrics.split('\n').join('').split('<br>');
            // console.log(arrLyrics)
            arrLyrics.forEach((cur) => {
                cur = cur.trim()
                if (cur.length == 0) return;
                const key = cur[0].toLowerCase();
                // console.log(mapLyric.has(key))
                if (!mapLyric.has(key)) {
                    let mm = new Map()
                    mm.set(cur, mapSongs.get(link).id)
                    mapLyric.set(key, mm);
                } else {
                    if (!mapLyric.get(key).has(cur)) {
                        mapLyric.set(key, mapLyric.get(key).set(cur, mapSongs.get(link).id));
                    }
                }
            })
        })
}

const data = fs.readFileSync('inputlink.txt', 'utf8');
const listLinks = JSON.parse(data.toString());
// const listLinks = ['https://mp3.zing.vn/bai-hat/Dem-Ngay-Xa-Em-OnlyC-Lou-Hoang/ZW7UUWC9.html'];
// const listLinks = ['https://mp3.zing.vn/bai-hat/Anh-Nang-Cua-Anh-Cho-Em-Den-Ngay-Mai-OST-Duc-Phuc/ZW78BW9D.html'];
// const listLinks = ['https://mp3.zing.vn/bai-hat/Cho-Em-Gan-Anh-Them-Chut-Nua-Cho-Em-Gan-Anh-Them-Chut-Nua-OST-Huong-Tram/ZW7898I6.html'];
const listActions = []
listLinks.forEach(link => {
    // console.log(link)
    listActions.push(parseLink(link))
})
Promise.all(listActions).then(() => {
    fs.writeFileSync('singers.txt', Array.from(mapSingers).reduce((res, cur) => {
        res += `("${cur[0]}"),`;
        return res
    }, ''))
    fs.writeFileSync('songs.txt', Array.from(mapSongs).reduce((res, cur) => {
        console.log(cur[1].name)
        res += `("${cur[1].name}","${cur[0]}", ${cur[1].singer}),`;
        return res
    }, ''))
    fs.writeFileSync('lyrics.txt', Array.from(mapLyric).reduce((res, cur) => {
        // console.log(cur);
        res += Array.from(cur[1]).reduce((r, c) => {
            r += `("${cur[0]}", "${c[0]}", ${c[1]}),`
            return r
        }, '')
        return res
    }, ''))
})
