fetch('http://127.00.1:5500/ebay-order-data.json', {
  method: 'HEAD'
})
.then(response => {
    if (response.ok) {
        return updateFile();
    }
    else {
        return createFile();
    }
  })
  .catch(error => console.error(error));
function updateFile(){
    fetch('http://127.00.1:5500/ebay-order-temp-data.json')
    .then(response => response.json())
    .then(data => {
        let filteredData = data.filter(item => item.hasOwnProperty('ShipToName'));
        if(filteredData.length !== data.length) {
            console.log("Objects without ShipToName key deleted");
        } else {
            console.log("All objects have ShipToName key");
        }
        // Append the remaining objects to eBay-order-data.json
        return fetch('http://127.00.1:5500/ebay-order-data.json', {
            method: 'PUT',
            body: JSON.stringify(filteredData),
            headers: { 'Content-Type': 'application/json' },
        });
    })
    .then(response => {
        if (response.ok) {
            console.log("Data appended to eBay-order-data.json successfully");
        } else {
            console.error("Error appending data to eBay-order-data.json");
        }
    })
    .catch(error => console.error(error));
}
function createFile(){
    fetch('http://127.00.1:5500/ebay-order-temp-data.json')
    .then(response => response.json())
    .then(data => {
        let filteredData = data.filter(item => item.hasOwnProperty('ShipToName'));
        if(filteredData.length !== data.length) {
            console.log("Objects without ShipToName key deleted");
        } else {
            console.log("All objects have ShipToName key");
        }
        // create eBay-order-data.json
        return fetch('http://127.00.1:5500/ebay-order-data.json', {
            method: 'POST',
            body: JSON.stringify(filteredData),
            headers: { 'Content-Type': 'application/json' },
        });
    })
    .then(response => {
        if (response.ok) {
     console.log("Data appended to eBay-order-data.json successfully");
    } else {
      console.error("Error appending data to eBay-order-data.json");
    }
  })
  .catch(error => console.error(error))}