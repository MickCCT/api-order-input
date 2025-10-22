fetch('http://127.00.1:5500/ebay-order-temp-data.json')
  .then(response => response.json())
 .then(data => {

     //Counts the number of objects that have the ShipToName key
     let count = 0;
     for (let item of data) {
         if (item.hasOwnProperty('ShipToName')) {
            count++;
         }
     }
     //Console.logs the first objects ShipToName value
   if (data.length > 0 && data[0].hasOwnProperty('ShipToName')) {
         console.log(data[0].ShipToName);
         } else {
             console.log("No ShipToName key in the first object");
         }
     console.log(count);

        

    //Finds all objects that are missing the ShipToName key and delets them
    let filteredData = data.filter(item => item.hasOwnProperty('ShipToName'));
    if(filteredData.length !== data.length) {
        console.log("Objects without ShipToName key deleted");
        console.log(filteredData);
    } else {
        console.log("All objects have ShipToName key");
    }



  // Append the remaining objects to eBay-order-data.json
  //  return fetch('http://127.00.1:5500/ebay-order-data.json', {
  //      method: 'POST',
  //      body: JSON.stringify(filteredData),
  //      headers: { 'Content-Type': 'application/json' },
  //  });
  //  })
  //  .then(response => {
  //  if (response.ok) {
   // console.log("Data appended to eBay-order-data.json successfully");
   // } else {
   // console.error("Error appending data to eBay-order-data.json");
   // }
    
   
    })
    .catch(error => console.error(error));