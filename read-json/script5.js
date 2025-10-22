//This works to update the JSON File

const fs = require('fs');
fs.readFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-temp-data.json', 'utf8', (err, data) => {
  if (err) throw err;
  let jsonData = JSON.parse(data);
  jsonData[0].ShipToName = null;
  fs.writeFile('C:/Users/mick.CROSSCREEK100/Documents/Order Input Project/Read Json/ebay-order-temp-data.json', JSON.stringify(jsonData), (err) => {
    if (err) throw err;
    console.log('The file has been updated.');
  });
});