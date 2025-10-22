//Pulls Amazon Json files from the downloads folder
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const folderPath = "c:/Users/mick.CROSSCREEK100/OneDrive/Documents/Testing";
let mostRecentFile;
let lastFile;
setInterval(function() {
  fs.readdir(folderPath, function(err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    mostRecentFile = null;
    files.forEach(function(file) {
      if (file.endsWith(".txt")) {
        if (!mostRecentFile) {
          mostRecentFile = file;
        } else {
          const mostRecentFileStats = fs.statSync(path.join(folderPath, mostRecentFile));
          const fileStats = fs.statSync(path.join(folderPath, file));
          if (fileStats.mtime > mostRecentFileStats.mtime) {
            mostRecentFile = file;
          }
        }
      }
    });
    if (mostRecentFile != lastFile) {
      lastFile = mostRecentFile;
      const wb = XLSX.readFile(path.join(folderPath, mostRecentFile), {dateNF: "mm/dd/yyyy"});
      const ws = wb.Sheets["Sheet1"]
      const data = XLSX.utils.sheet_to_json(ws, {raw: false});
      fs.writeFileSync("test-amazon-order-data.json", JSON.stringify(data, null, 2));
      console.log(mostRecentFile + " - Amazon file written successfully!");
      fs.readFile('test-amazon-order-data.json', (err, data) => {
        if (err) throw err;
        let jsonData = JSON.parse(data);
        jsonData = jsonData.map(item => {
          return {
            OrderId: item['order-id'],
            RecipientName: item['recipient-name'],
            Sku: item['sku'],
            QuantityPurchased: item['quantity-purchased'],
            ItemPrice: item['item-price'],
            ShipAddress1: item['ship-address-1'],
            ShipAddress2: item['ship-address-2'],
            ShipCity: item['ship-city'],
            ShipState: item['ship-state'],
            ShipZip: item['ship-postal-code']
          };
        });
        const currentDate = new Date().toISOString();
        jsonData.forEach(obj => obj.MasterDate = currentDate);
        let masterData = JSON.parse(fs.readFileSync('test-master-amazon-order-data.json'));
        // Compare each object in tempData with those in masterData
 jsonData.forEach(tempObj => {
     const match = masterData.find(masterObj => 
       masterObj.OrderId === tempObj.OrderId && 
       masterObj.Sku === tempObj.Sku
     );
     if (!match) {
       // If the object doesn't exist in masterData, append it to the end of the array
       masterData.push(tempObj);
     } else {
       // If the object already exists, update its "MasterDate"
       match.MasterDate = tempObj.MasterDate;
     }
   });
 
       /*jsonData.forEach(tempObj => {
          const match = masterData.find(masterObj => masterObj.OrderId === tempObj.OrderId);
          if (!match) {
            // If the object doesn't exist in masterData, append it to the end of the array
            masterData.push(tempObj);
          } else {
            // If the object already exists, update its "MasterDate"
            match.MasterDate = tempObj.MasterDate;
          }
        });*/
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    masterData = masterData.filter(obj => obj.MasterDate >= fourDaysAgo);
    // Write the updated masterData back to master.Json
    fs.writeFileSync('test-master-amazon-order-data.json', JSON.stringify(masterData, null, 2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  });
} else {
  console.log('Same file!')
}
});
}, 15000);

//save all files to a temp file after key names have been changed
//add a key called "MasterDate" that contains the current date to all objects in the temp.Json file
//comapare objects in temp.Json with master.Json
//if an object from temp.Json does not exist in master.Json then append it to the end of master.Json
//if the "MasterDate" of the object is more than 4 days old delete the object

// Read the contents of temp.Json and parse it as a JSON array

/*const tempData = JSON.parse(fs.readFile('C:/Users/mick.CROSSCREEK100/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Amazon Order Input Program/temp-amazon-order-data.json'));
// Add a "MasterDate" key to each object in tempData that contains the current date
const currentDate = new Date().toISOString();
tempData.forEach(obj => obj.MasterDate = currentDate);
// Read the contents of master.Json and parse it as a JSON array
const masterData = JSON.parse(fs.readFileSync('C:/Users/mick.CROSSCREEK100/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Amazon Order Input Program/master-amazon-order-data.json'));
// Compare each object in tempData with those in masterData
tempData.forEach(tempObj => {
  const match = masterData.find(masterObj => masterObj.id === tempObj.id);
  if (!match) {
    // If the object doesn't exist in masterData, append it to the end of the array
    masterData.push(tempObj);
  } else {
    // If the object already exists, update its "MasterDate"
    match.MasterDate = tempObj.MasterDate;
  }
});
// Remove any objects from masterData with a "MasterDate" more than 4 days old
const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
masterData = masterData.filter(obj => obj.MasterDate >= fourDaysAgo);
// Write the updated masterData back to master.Json
fs.writeFileSync('C:/Users/mick.CROSSCREEK100/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Amazon Order Input Program/master-amazon-order-data.json', JSON.stringify(masterData, null, 2));*/
