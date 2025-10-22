//This works
//This is the code to use
//No need for a live server, this runs in the background and updates in the folder
//To do: have the new JSON file added to the correct folder after conversion

const fs = require('fs');
fs.readFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-temp-data.json', 'utf8', (err, data) => {
  if (err) throw err;
  let jsonData = JSON.parse(data);
  // filter out objects that are missing the ShipToName key
  jsonData = jsonData.filter(obj => obj.hasOwnProperty('ShipToName'));
  fs.readFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-data.json', 'utf8', (err, data) => {
    if (err) throw err;
    let jsonData2 = JSON.parse(data);
    // check if there's no other SalesRecordNumber key with the same value in the file
    jsonData = jsonData.filter(obj => !jsonData2.some(o => o.SalesRecordNumber === obj.SalesRecordNumber));
    // add the remaining objects to the top of the ebay-order-data.json file
    jsonData2.unshift(...jsonData);
    fs.writeFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-data.json', JSON.stringify(jsonData2), (err) => {
      if (err) throw err;
      console.log('ebay-order-data.json has been updated');
    });
  });
});