//This works to delete the objects missing the shiptoname keys, then takes the remaining objects and writes them to the new json file
//However, this overwrites the file
const fs = require('fs');
fs.readFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-temp-data.json', 'utf8', (err, data) => {
  if (err) throw err;
  let jsonData = JSON.parse(data);
  // filter out objects that are missing the ShipToName key
  jsonData = jsonData.filter(obj => obj.hasOwnProperty('ShipToName'));
  fs.readFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-data.json', 'utf8', (err, data) => {
    if (err) throw err;
    let jsonData2 = JSON.parse(data);
    // Append the remaining objects to ebay-order-data.json
    jsonData2.push(...jsonData);
    fs.writeFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-data.json', JSON.stringify(jsonData2), (err) => {
      if (err) throw err;
      console.log('ebay-order-data.json has been updated');
    });
  });
});