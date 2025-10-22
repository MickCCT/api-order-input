const fs = require('fs')

fetch('http://127.0.0.1:5500/ebay-order-temp-data.json')
  .then(response => response.json())
  .then(data => {
    if (data.length > 0 && data[0].hasOwnProperty('ShipToName')) {
        data[0].ShipToName = null;
        // send PUT request to update the file
        return fetch('http://127.0.0.1:5500/ebay-order-temp-data.json', {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        console.log("No ShipToName key in the first object");
    }
  })
  .then(response => {
    if (response.ok) {
      console.log("Data updated successfully");
    } else {
      console.error("Error updating data");
    }
  })
  .catch(error => console.error(error));