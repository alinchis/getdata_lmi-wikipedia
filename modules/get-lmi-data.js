// get metadata from BAC server and save it in JSON files

// import libraries
const fs = require('fs-extra');
const axios = require('axios');
const cheerio = require('cheerio');


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// download html pages
async function getHtmlPages(pathsObj, logFile) {
    console.log('\x1b[33m%s\x1b[0m', `RO PROGRESS: GET HTML pages`);
    const returnArr = [];

    //for each county
    for(let i = 0; i < pathsObj.length; i += 1) {
        const countyItem = {
            countyName: pathsObj[i].countyName,
            htmlArray: [],
        };
        console.log(pathsObj[i].paths);
        // for each path in county
        for(let j = 0; j < pathsObj[i].paths.length; j += 1) {
            // get data from website
            try {
                let responseOk = false;
                do {
                    // get data
                    const response = await axios.get(pathsObj[i].paths[j]);
                    console.log(`${i}/${pathsObj.length - 1}::${pathsObj[i].county}: GET html page ${j}/${pathsObj[i].paths.length - 1} >>> ${response.status}`);
                    if(response.status === 200) {
                        responseOk = true;
                        fs.appendFileSync(logFile, `${pathsObj[i].paths[j]};${response.status}\n`);
                        countyItem.htmlArray.push(response.data);
                    } else {
                        fs.appendFileSync(logFile, `${pathsObj[i].paths[j]};${response.status}\n`);
                        throw `${pathsObj[i].countyName}:: ERROR retrieving LMI page #${i} !`;
                    }
                } while (!responseOk)
            } catch(err) {
                console.error(err.code);
            }

        }
        // add county to return array
        returnArr.push(countyItem);
    }
    // return data
    return returnArr;
}


// /////////////////////////////////////////////////////////////////////
// process HTML pages and return array of High Schools
function processHtml(countyName, htmlArray) {

    console.log(`\n${countyName}:: processHtml array START 222222222222222222222`);
    // create return array
    const returnArr = htmlArray.map((item, countyIndex) => {
        const countyArray = [];
        // load data in cheerio object
        const $ = cheerio.load(item.replace(/\n/g, ''));

        // select table.wikitable
        const tableArray = $('.wikitable')
            .children().first()
            .children();
        // console.log(tableArray);

        // for each item in list
        $(tableArray).slice(1).each((i, item) => {
            const codLmi = $(item)
                .children().first()
                .children().first().text()
                .trim().replace(/\[\d+\]/, '');
            console.log(`\n${countyIndex}:${i}:: codLmi = ${codLmi}`);
            const codRanTest = $(item)
                .children().first()
                .children().last().text()
                .trim().replace(/\[\d+\]/, '')
                .replace('(RAN: ', '').replace(')', '');
            const codRan = codRanTest === codLmi ? '' : codRanTest;
            console.log(`${countyIndex}:${i}:: codRan = ${codRan}`);
            const denumire = $(item)
                .children().eq(1).text()
                .trim().replace(/\[\d+\]/, '');
            console.log(`${countyIndex}:${i}:: denumire = ${denumire}`);
            const localitate = $(item)
                .children().eq(2).text()
                .trim().replace(/\[\d+\]/, '');
            console.log(`${countyIndex}:${i}:: localitate = ${localitate}`);
            const adresa = $(item)
                .children().eq(3).text()
                .trim().replace(/\[\d+\]/, '');
            console.log(`${countyIndex}:${i}:: adresa = ${adresa}`);
            const datare = $(item)
                .children().eq(4).text()
                .trim().replace(/\[\d+\]/, '');
            console.log(`${countyIndex}:${i}:: datare = ${datare}`);
            const coordonate = $(item)
                .children().eq(6).text()
                .trim().replace(/\[\d+\]/, '')
                .replace('°N ', ',').replace('°E', '');
            console.log(`${countyIndex}:${i}:: coordonate = ${coordonate}`);

            // return array
            countyArray.push({
                codLmi,
                codRan,
                denumire,
                localitate,
                adresa,
                datare,
                coordonate,
            })

        });

        // return county array
        return countyArray;

    });





    // return data
    console.log(`RO processHtml END 222222222222222222222`);
    return returnArr.flat();
}


// /////////////////////////////////////////////////////////////////////
// Download & Process Exams Centers
async function getData(countiesObj, logFile) {
    console.log(`\nRO @extractData START 111111111111111111111`);

    // get counties home pages
    const countiesArr = countiesObj.counties.map((county) => {
        return {
            countyName: county.countyName,
            paths: [`${countiesObj.rootPath}/${county.href}`],
        }
    });
    const countiesHtmlArr = await getHtmlPages(countiesArr, logFile);
    // console.log(countiesHtmlArr.filter(item => item.countyName === 'CLUJ')[0].htmlArray[0]);

    // create paths array
    const pathsArr = countiesObj.counties.map((county) => {
        console.log(`${county.countyName}:: total monuments = ${county.total}`);
        if (Number(county.total) < 850) {
            return {
                countyName: county.countyName,
                paths: [`${countiesObj.rootPath}/${county.href}`],
            };
        } else if (county.countyName === 'BUCURESTI') {
            return {
                countyName: county.countyName,
                paths: [
                    `${countiesObj.rootPath}/${county.href},_sector_1`,
                    `${countiesObj.rootPath}/${county.href},_sector_2`,
                    `${countiesObj.rootPath}/${county.href},_sector_3`,
                    `${countiesObj.rootPath}/${county.href},_sector_4`,
                    `${countiesObj.rootPath}/${county.href},_sector_5`,
                    `${countiesObj.rootPath}/${county.href},_sector_6`,
                    `${countiesObj.rootPath}/${county.href}_cu_sector_necunoscut`,
                ],
            }
        } else {
            return {
                countyName: county.countyName,
                paths: [
                    `${county.href}_-_A`,
                    `${county.href}_-_B`,
                    `${county.href}_-_C`,
                    `${county.href}_-_D`,
                    `${county.href}_-_E`,
                    `${county.href}_-_F`,
                    `${county.href}_-_G`,
                    `${county.href}_-_H`,
                    `${county.href}_-_I`,
                    `${county.href}_-_J`,
                    `${county.href}_-_L`,
                    `${county.href}_-_M`,
                    `${county.href}_-_N`,
                    `${county.href}_-_O`,
                    `${county.href}_-_P`,
                    `${county.href}_-_R`,
                    `${county.href}_-_S`,
                    `${county.href}_-_%C8%98`, //Ș
                    `${county.href}_-_T`,
                    `${county.href}_-_#%C8%9A`, //Ț
                    `${county.href}_-_U`,
                    `${county.href}_-_V`,
                    `${county.href}_-_Z`,
                ].filter(str => countiesHtmlArr.filter(item => item.countyName === county.countyName)[0].htmlArray[0].includes(str)) // filter out bad links
                .map(item => `${countiesObj.rootPath}/${item}`),
            }
        }

    });

    // get all html pages
    const htmlArr = await getHtmlPages(pathsArr, logFile);

    // process html pages
    const returnArr = htmlArr.map((item) => {
        return {
            countyName: item.countyName,
            lmiArray: processHtml(item.countyName, item.htmlArray),
        }
    });

    // return the new array
    console.log(`@extractData END 111111111111111111111`);
    // console.log(returnArr)
    return returnArr;
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (countiesObj, saveFile, logFile) => {
    try {
        console.log('\x1b[36m%s\x1b[0m', `\n\nRO @LMI PROGRESS: Download Students list`);

        // start log file
        const logHeaderArr = [ 'request_path', 'response_status' ];
        fs.writeFileSync(logFile, `${logHeaderArr.join(',')}\n`);

        // get data
        const lmiArr =  await getData(countiesObj, logFile);
        console.log(`RO @LMI:: extractData done !!!!!!!!!!!!!!!!!!!!!!!!!!!`);

        // save data to JSON file
        fs.writeFileSync(`${saveFile}.json`, `${JSON.stringify(lmiArr)}`, 'utf8', () => console.log(`${year}:: RO @BAC::JSON File ${saveFile} closed!`));
        console.log(`RO @LMI:: JSON file write Done!`);

        // create csv array
        const csvHeader = ['cod_lmi', 'cod_ran', 'denumire', 'judet', 'localitate', 'adresa', 'datare', 'coordonate'];
        const csvArray = [];
        for (let i = 0; i < lmiArr.length; i += 1) {
            const item = lmiArr[i];
            for (let j = 0; j < item.lmiArray.length; j += 1) {
                const rowArray = [];
                rowArray.push(item.lmiArray[j].codLmi);
                rowArray.push(item.lmiArray[j].codRan);
                rowArray.push(item.lmiArray[j].denumire);
                rowArray.push(item.countyName);
                rowArray.push(item.lmiArray[j].localitate);
                rowArray.push(item.lmiArray[j].adresa);
                rowArray.push(item.lmiArray[j].datare);
                rowArray.push(item.lmiArray[j].coordonate);
                // add row to array
                csvArray.push(rowArray.join('#'));
                console.log(rowArray)
            }

        }
        // add header to array
        csvArray.unshift(csvHeader.join('#'));

        // save data to CSV file
        fs.writeFileSync(`${saveFile}.csv`, csvArray.join('\n'), 'utf8', () => console.log(`${year}:: RO @BAC::JSON File ${saveFile} closed!`));
        console.log(`RO @LMI:: CSV file write Done!`);


    } catch(err) {
        console.error(err);
    }

}
