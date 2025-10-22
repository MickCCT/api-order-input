//Pulls Ebay .csv files from the downloads folder and converts them to Json
const XLSX = require("xlsx"); //Documentation = https://www.npmjs.com/package/xlsx?activeTab=readme
const fs = require("fs");

const path = require("path");
// Setting the path to the folder to be read
const folderPath = "c:/Users/mick.CROSSCREEK100/OneDrive/Documents/Downloads";

let mostRecentFile;
let lastFile;
//Runs the program over and over until ctrl c is pressed
setInterval(function() {
// Reading the directory using 'readdir' method from the 'fs' module
fs.readdir(folderPath, function(err, files) {
    // Checking if there was an error reading the directory
    if (err) {
        // Logging an error message and exiting the process with code 1 (failure)
        console.error("Could not list the directory.", err);
        process.exit(1);
    }
    // Setting a variable 'mostRecentFile' to null initially
    mostRecentFile = null;
    // Looping through each file in the directory
    files.forEach(function(file) {
    // Checking if the file name starts with "eBay-orders" and ends with ".csv"
    if (file.startsWith("eBay-awaiting-shipment-report") && file.endsWith(".csv")) {
      // If 'mostRecentFile' is null, set it to the current file
        if (!mostRecentFile) {
            mostRecentFile = file;
        } else {
        // If 'mostRecentFile' is not null, compare the modification times of both files
        const mostRecentFileStats = fs.statSync(path.join(folderPath, mostRecentFile));
        const fileStats = fs.statSync(path.join(folderPath, file));

        if (fileStats.mtime > mostRecentFileStats.mtime) {
          // If the current file is more recently modified, set it as the most recent file
            mostRecentFile = file;
            }
        }
    }
    });
  // Log the name of the most recently modified file
 if (mostRecentFile != lastFile) {
    lastFile = mostRecentFile;


//Read the Workbook(excel file)
const wb = XLSX.readFile(path.join(folderPath, mostRecentFile), {dateNF: "mm/dd/yyyy"});
//Target the Worksheet(tab in the Workbook)
const ws = wb.Sheets["Sheet1"]
//Remove spaces in excel heading labels so they can be read as the "key"(of the "key":"value" pair in JSON)
//XLSX.utils.sheet_add_aoa(ws, [["SalesRecordNumber"]], { origin: "A1" });

XLSX.utils.sheet_add_aoa(ws, [["SalesRecordNumber", "OrderNumber", "BuyerUsername", "BuyerName", "BuyerEmail", "BuyerNote", "BuyerAddress1", "BuyerAddress2",  "BuyerCity", "BuyerState", "BuyerZip", "BuyerCountry", "BuyerTaxIdentifierName", "BuyerTaxIdentifierValue", "ShipToName", "ShipToPhone", "ShipToAddress1", "ShipToAddress2", "ShipToCity", "ShipToState", "ShipToZip", "ShipToCountry", "ItemNumber", "ItemTitle", "CustomLabel", "SoldViaPromotedListings", "Quantity", "SoldFor", "ShippingAndHandling", "ItemLocation", "ItemZipCode", "ItemCountry", "EbayCollectAndRemitTaxRate", "EbayCollectAndRemitTaxType", "EbayReferenceName", "EbayReferenceValue", "TaxStatus", "SellerCollectedTax", "EbayCollectedTax", "ElectronicWasteRecyclingFee", "MattressRecyclingFee", "BatteryRecyclingFee", "WhiteGoodsDisopsal", "TireRecyclingFee", "AdditionalFee", "LumberFee", "PrepaidWirelessFee", "RoadImprovementAndFoodDeliveryFee", "EbayCollectedCharges", "TotalPrice", "EbayCollectedTaxAndFeesIncludedInTotal", "PaymentMethod", "SaleDate", "PayidOnDate", "ShipByDate", "MinimumEstimatedDeliveryDate", "MaximunEstimatedDeliveryDate", "ShippedOnDate", "FeedbackLeft", "FeedbackReceived", "MyItemNote", "PayPalTransactionID", "ShippingService", "TrackingNumber", "TransactionID", "VariationDetails", "GlobalShippingProgram", "GlobalShippingReferenceID", "ClickAndCollect", "ClickAndCollectReferenceNumber", "EbayPlus", "AuthenticityVerificationProgram", "AuthenticityVerificationStatus", "AuthenticityVerificationOutcomeReason", "EbayVaultProgram", "VaultFulfillmentType", "EbayFulfillmentProgram", "TaxCity", "TaxState", "TaxZip", "TaxCountry", "EbayInternationalShipping"]], { origin: "A1" });

//Convert to JSON
const data = XLSX.utils.sheet_to_json(ws, {raw: false});
//Write the data to a JSON file
const tempFilePath = "C:/Users/mick.CROSSCREEK100/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Ebay Order Input Program/temp-ebay-order-data.json";
    fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2));

console.log(mostRecentFile);

//console.log(data);
fs.readFile(tempFilePath, "utf8", function (err, data) {
    if (err) {
        console.error(err);
        return;
    }
    const orders = JSON.parse(data);
    const filteredOrders = orders.filter(function (order) {
        return order.BuyerUsername && order.BuyerUsername !== "Buyer Username";
    });
    const currentDate = new Date().toISOString();
        filteredOrders.forEach(obj => obj.MasterDate = currentDate);
    let masterData = [];
    try {
         const masterDataStr = fs.readFileSync('C:/Users/mick.CROSSCREEK100/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Ebay Order Input Program/master-ebay-order-data.json', 'utf8');
        masterData = JSON.parse(masterDataStr);
    } catch (err) {
        console.error(err);
    }
     // Compare each object in tempData with those in masterData
    filteredOrders.forEach(tempObj => {
        const match = masterData.find(masterObj =>
            masterObj.OrderNumber === tempObj.OrderNumber &&
            masterObj.CustomLabel === tempObj.CustomLabel
    );
        if (!match) {
         // If the object doesn't exist in masterData, append it to the end of the array
         masterData.push(tempObj);
        } else {
         // If the object already exists, update its "MasterDate"
        match.MasterDate = tempObj.MasterDate;
        }
    });
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
        masterData = masterData.filter(obj => obj.MasterDate >= fourDaysAgo);
    fs.writeFile("C:/Users/mick.CROSSCREEK100/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Ebay Order Input Program/master-ebay-order-data.json", JSON.stringify(masterData, null, 2), function (err) {
        if (err) {
             console.error(err);
        return;
        }
        console.log("File written successfully!");
    });
   });
        } else {
        console.log('Same file!')
        } 
        });
        }, 1000 * 15);

