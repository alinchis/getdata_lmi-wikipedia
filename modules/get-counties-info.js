// get metadata from CNAS server and save it in JSON files

// import libraries
const fs = require('fs-extra');
const axios = require('axios');
const cheerio = require('cheerio');


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// extract counties data
function extractData(htmlData) {
	//   // remove unnecessary '\n' characters & load html
	console.log('extract data ####################\n');
	const $ = cheerio.load(htmlData.replace(/\\n/g, ''));
	// select all 'area' elements
	const tableArray = $('.wikitable')
		.children().first()
		.children();
	// console.log(tableArray);

	// create new array to hold counties info
	const returnArr = [];
	// if retrieval is successful
	if (tableArray && tableArray.length > 0) {
		console.log(`We have retrieved ${tableArray.length} county items`);
		// for each item in list
		$(tableArray).slice(1).each((i, item) => {
			const itemHref = $(item)
				.children().first()
				.children().first()
				.attr('href');
			console.log(`${i}:: ${itemHref}`);
			const itemTitle = $(item)
				.children().first()
				.children().first()
				.attr('title');
			console.log(`${i}:: ${itemTitle}`);
			const itemName = itemTitle.replace('Lista monumentelor istorice din ', '')
				.replace('București', 'municipiul București');
			console.log(`${i}:: ${itemName}`);
			const itemNameEn = itemName
				.replace('municipiul ', '')
				.replace('județul ', '')
				.replace(/ă/g, 'a')
				.replace(/â/g, 'a')
				.replace(/ș/g, 's')
				.replace(/ț/g, 't')
				.toUpperCase();
			console.log(`${i}:: ${itemNameEn}`);
			const itemCount = $(item)
				.children().eq(2).text()
				.replace('.', '');
			console.log(`${i}:: ${itemCount}\n`);

			// return array
			returnArr.push({
				title: itemTitle,
				fullName: itemName,
				countyName: itemNameEn,
				href: itemHref,
				total: itemCount,
			})

		});
	} else {
		throw "ERROR retrieving counties info!";
	}
	// return the new array
	return returnArr;
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (countiesPath, logFile) => {
	console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download Counties info`);
	console.log(countiesPath);

	// declare variables
	const countiesList = { counties: [] };
	// get counties info in HTML format
	try {
		// get first html page
		const response = await axios.get(countiesPath);
		// save log
		fs.appendFileSync(logFile, `${countiesPath};${response.status}\n`);
		// console.log(response.data);
		const countiesArr = extractData(response.data);
		console.log(`Found ${countiesArr.length} unique county items.`);
		// write json to file
		const returnObj = {
			href: countiesPath,
			counties: countiesArr,
		};

		// return the object
		return returnObj;

	} catch (err) {
		console.error(err)
	}
}