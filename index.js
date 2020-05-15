// get LMI data from wikipedia [https://ro.m.wikipedia.org/wiki/Lista_monumentelor_istorice_din_Rom%C3%A2nia]

const fs = require('fs-extra');

// import local modules
const createFolder = require('./modules/create-folder.js');
const getCountiesInfo = require('./modules/get-counties-info.js');
const getLmiData = require('./modules/get-lmi-data.js');

// local paths
const dataPath = './data';
const localPaths = {
  metadata: 'metadata',
  tables: 'tables',
  exports: 'exports',
  logs: 'logs',
};

// remote paths @july
const rootPath = 'https://ro.m.wikipedia.org';
const countiesListPath = '/wiki/Lista_monumentelor_istorice_din_Rom%C3%A2nia';


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// get current date - formatted
function getCurrentDate() {
  const today = new Date().toISOString();
  const regex = /^(\d{4}-\d{2}-\d{2})/g;
  // return formatted string
  return today.match(regex)[0];
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN function
async function main() {
  // get current date
  const today = getCurrentDate();
  // create folder paths variables
  const metadataPath = `${dataPath}/${today}/${localPaths['metadata']}`;
  const tablesPath = `${dataPath}/${today}/${localPaths['tables']}`;
  const exportsPath = `${dataPath}/${today}/${localPaths['exports']}`;
  const logsPath = `${dataPath}/${today}/${localPaths['logs']}`;
  // create save files paths variables
  const lmiFilePath = `${tablesPath}/lmi_list`;
  const logFilePath = `${logsPath}/download_log.csv`;

  // help text
  const helpText = `\n Available commands:\n\n\
  1. -h : display help text\n\
  2. -d : download data\n`;

  // get command line arguments
  const arguments = process.argv;
  console.log('\x1b[34m%s\x1b[0m', '\n@START: CLI arguments >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  console.table(arguments);
  console.log('\n');

  // get third command line argument
  // if argument is missing, -h is set by default
  const mainArg = process.argv[2] || '-h';
  // manual select list of counties for download, leave active only the ones you want to download
  const countiesList = [
    // 'ALBA',
    // 'ARAD',
    // 'ARGES',
    // 'BACAU',
    // 'BIHOR',
    // 'BISTRITA-NASAUD',
    // 'BOTOSANI',
    // 'BRAILA',
    // 'BRASOV',
    // 'BUCURESTI',
    // 'BUZAU',
    // 'CALARASI',
    // 'CARAS-SEVERIN',
    // 'CLUJ',
    // 'CONSTANTA',
    // 'COVASNA',
    // 'DAMBOVITA',
    // 'DOLJ',
    // 'GALATI',
    // 'GIURGIU',
    // 'GORJ',
    // 'HARGHITA',
    // 'HUNEDOARA',
    // 'IALOMITA',
    // 'IASI',
    // 'ILFOV',
    // 'MARAMURES',
    // 'MEDEDINTI',
    // 'MURES',
    // 'NEAMT',
    // 'OLT',
    // 'PRAHOVA',
    // 'SALAJ',
    // 'SATU MARE',
    // 'SIBIU',
    // 'SUCEAVA',
    // 'TELEORMAN',
    // 'TIMIS',
    // 'TULCEA',
    // 'VALCEA',
    // 'VASLUI',
    // 'VRANCEA',
  ];

  // run requested command
  // 1. if argument is 'h' or 'help' print available commands
  if (mainArg === '-h') {
    console.log(helpText);

  // 2. else if argument is 'm'
  } else if (mainArg === '-d') {

    // prepare folders // folders are not written over
    createFolder(1, metadataPath);
    createFolder(2, tablesPath);
    createFolder(3, exportsPath);
    createFolder(4, logsPath);

    // stage 1: get counties info
    console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('STAGE 1: get counties info\n');

    // start log file
    const logHeaderArr = [ 'request_path', 'response_status' ];
    fs.writeFileSync(logFilePath, `${logHeaderArr.join(';')}\n`);

    // console.log(rootPath);
    try {
      const countiesPath = `${rootPath}/${countiesListPath}`;
      const countiesObj = await getCountiesInfo(countiesPath, logFilePath);

      // stage 2: filter counties, only download data for counties in countiesList
      // if countiesList is empty, download all
      const filteredCounties = {
        href: countiesObj.href,
        counties: countiesObj.counties.filter( item => countiesList.length > 0 ? countiesList.includes(item.countyName) : true ),
        rootPath,
        countiesListPath,
      }


      // stage 3: get exam centers with assigned high schools
      console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log('STAGE 3: get data for county\n');
      await getLmiData(filteredCounties, lmiFilePath, logFilePath);


    } catch (err) {
      console.error(err);
    }


    // else print help
  } else {
    console.log(helpText);
  }

}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN
main();
