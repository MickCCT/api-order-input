//Final Node program file
//Fetch the JSON file and turn JSON into variables
let mainObj = {};

let showObj = function(){
    for (let prop in mainObj){
       // console.log(prop);
       // console.log(mainObj[prop]);
        let shipName = mainObj[prop].ShipToName;
       // console.log(myCount.length)
       let count = 0;

       //This does something but doesn't work yet
      // Object.keys(mainObj[prop].ShipToName).forEach(val => {
      // ++count
      //});

     for (const key in mainObj)
     if (mainObj.hasOwnProperty(key)) {
     console.log('${key}: ${mainObj}');
       //let count = 0;
      //for(let shipName in mainObj){
      //  ++count
     // }
    //  console.log(count);
     } };
}

fetch("http://127.0.0.1:5500/data.json")
.then(function(resp) {
    return resp.json();
})
.then(function(data) {
    mainObj = data;
    showObj();


    
 // let count = 0;
 // for(let mainObj[1].SalesRecordNumber in mainObj) {
 // ++count
//}
//console.log(count);


});
//Counts the number of objects to iterate through



//let shipToNameKeys = keys.filter(key => key.indexOf("SoldFor") !== -1);
//let objAmount = shipToNameKeys.length;//count the objects, minus objects without a shipName or salesRec;


//Writes the sales record number below the button
function jsonCall() {
let objIteration = 2;
let salesRec = mainObj[objIteration].SalesRecordNumber;
let orderNum = mainObj[objIteration].OrderNumber;
let shipName = mainObj[objIteration].ShipToName;
let shipAddress1 = mainObj[objIteration].ShipToAddress1;
let shipCity = mainObj[objIteration].ShipToCity;
let shipState = mainObj[objIteration].ShipToState;
let shipZip = mainObj[objIteration].ShipToZip;
let itemNum = mainObj[objIteration].ItemNumber;
let quantity = mainObj[objIteration].Quantity;
let soldFor = mainObj[objIteration].SoldFor;

//Testing this code
//This works if it's tabbed to the ship to page
///document.getElementById("shipto.ship_to_name").addEventListener("click", shipName);
//This works
///function shipName() {
    // Get the text field
   ///let copyText = 'Mick Kopp';
    // Copy the text inside the text field
   // document.querySelector("td.kendoCell-editable.p21-text-align-left.p21-drillable-td span").focus();
   /// navigator.clipboard.writeText(copyText);
    
///}
//End Testing this code

//Prints key values to the screen
document.getElementById("writeJSON").innerHTML = "<p>" + salesRec + "</p><p>" + orderNum + "</p><p>" + shipName + "</p>";
}//Need this
