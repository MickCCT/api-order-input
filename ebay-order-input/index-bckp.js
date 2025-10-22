//Latest 2-8-23 working

//Order Info will not appear at the top without waiting for the page to load at least 3.1 seconds
setTimeout(()=> {
    //Checks to make sure it's the Order Entry page
   if(document.getElementById('ep-view-title').innerText.slice(0, 11) === "Order Entry" ){

       addOrderDiv();
       nextOrderBtn()
   }
}
,3100);

function addOrderDiv() {

   //Adds an ID to the body tag for the future    
   document.body.id = 'top';
   //Adds the order information to the top of the Order Entry page
   document.getElementById("top").insertAdjacentHTML("afterbegin","<div id='display-order' style='position: absolute; top: 5px; left: 300px; z-index: 50000'></div><div id='display-items' style='position: absolute; top: 5px; right: 45px; z-index: 50000'></div>")
   //document.getElementById("bottomSectionDiv").insertAdjacentHTML("afterbegin","<div id='display-items' style='position: absolute; top: -90px; left: 30px; z-index: 50000'></div>")
    
}

let salesRec, orderNum, shipName, shipAddressOne, shipAddressTwo, shipCity, shipState, shipZip, itemNumOne, quantityOne, soldFor;

let amazon = '110690';
let ebay = '109408';
let walmart = '127129';
let i = 0;//This iterates through the order numbers
let numOfOrders;//The number of orders
let orderCount;//Maybe later
let numOfItems;

let itemCustomLabel;//The item number for multiple items
let itemQuantity;//The item qty for multiple items



function nextOrderBtn() {
   // Assign the path of the JSON file to a variable
   var filePath = "http://127.0.0.1:3000/master-ebay-order-data.json";//"http://127.0.0.1:5502/master-ebay-order-data.json";//Testing address = http://127.0.0.1:5500/order-data.json
   // Use the fetch API to read the JSON file
   fetch(filePath)
   .then(function(response) {
      // Convert the response to a JSON object
   return response.json();
   })
   .then(function(jsonData) {

       //Clear items for the last multi item order
       document.getElementById("display-items").innerHTML = "";

       //Gets the number of objects(orders)
       numOfOrders = Object.keys(jsonData).length;
       
       if(i + 1 <= numOfOrders) {   
           
           //Looks to see if the order number is in local storage
           orderNum = jsonData[i].OrderNumber;  
           let findOrderNum = localStorage.getItem("Order-" + orderNum); 
           
           if(findOrderNum === null){

           salesRec = jsonData[i].SalesRecordNumber;
           shipName = jsonData[i].ShipToName;
           shipAddressOne = jsonData[i].ShipToAddress1;
           shipAddressTwo = jsonData[i].ShipToAddress2;
           shipCity = jsonData[i].ShipToCity;
           shipState = jsonData[i].ShipToState;
           shipZip = jsonData[i].ShipToZip;
           itemNumOne = jsonData[i].CustomLabel;
           quantityOne = jsonData[i].Quantity; //This also pulls the first quantity for an order
           soldFor = jsonData[i].SoldFor;
           
           //Creates a new object to add all json objects to
           let counts = {};
           //Loops through each object and adds it to counts if it's not already there
           jsonData.forEach(obj => {

               if (!counts[obj.OrderNumber]) {
                   //Adds these key value pairs to counts  
                   counts[obj.OrderNumber] = {
                   ShipToName: obj.ShipToName,
                   CustomLabels: [],
                   Quantities: [],
                   SoldFors: []
                   };
               }
               //Pushes these obj.keys and values to the counts arrays
               counts[obj.OrderNumber].CustomLabels.push(obj.CustomLabel);
               counts[obj.OrderNumber].Quantities.push(obj.Quantity);
               counts[obj.OrderNumber].SoldFors.push(obj.SoldFor);
           });
           
           // Check if the the OrderNumber has more than one CustomLabel
           let orderNumber = orderNum;
           console.log("order number is " + orderNumber);
           console.log(counts[orderNumber]);
           if (counts[orderNumber].CustomLabels.length >= 2) {
               //Delete the first item in the index because it is undefined
               counts[orderNumber].CustomLabels.shift();
               counts[orderNumber].Quantities.shift();
               counts[orderNumber].SoldFors.shift();
               //Count the number of customlabel keys the order has
               numOfItems = counts[orderNumber].CustomLabels.length;
               
                   //Iterate through the items
                   for (n = 0; n < numOfItems; n++){
                   //Sets the new variables for multiple items to be displayed   
                   itemCustomLabel = counts[orderNumber].CustomLabels[n];
                   let itemQuantity = counts[orderNumber].Quantities[n];
                   let itemSoldFor = counts[orderNumber].SoldFors[n];
                   let itemCount = n + 1;
                   
                   //Displays multiple items on the order entry page
                   document.getElementById("display-items").innerHTML += "<div style='margin-right: 15px'><ul style='list-style-type: none'><li style='display: inline'><div style='display: inline; padding: 5px 20px 3px 10px; font-weight: bold; color: green;'>*Item - " + itemCount + ":</div><div style='display: inline;padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>" + itemCustomLabel + "</div></li><li style='display: inline'><div style='display: inline; padding: 5px 20px 3px 10px; font-weight: bold'>Qty:</div><div style='display: inline;padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>" + itemQuantity + "</div></li><li style='display: inline'><div style='display: inline; padding: 5px 20px 3px 10px; font-weight: bold'>Sold For:</div><div style='display: inline;padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>" + itemSoldFor + "</div></li></li></ul></div>"
                   
                   }       

               } else {

                   //Displays a single item on order entry page
                   document.getElementById("display-items").innerHTML = "<div style='margin-right: 15px'><ul style='list-style-type: none'><li style='display: inline'><div style='display: inline; padding: 5px 20px 3px 10px; font-weight: bold; color: green;'>*Item</div><div  id='item-one' style='display: inline;padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>" + itemNumOne + "</div></li><li style='display: inline'><div style='display: inline; padding: 5px 20px 3px 10px; font-weight: bold'>Qty:</div><div id='quantity-one' style='display: inline;padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>" + quantityOne + "</div></li><li style='display: inline'><div style='display: inline; padding: 5px 20px 3px 10px; font-weight: bold'>Sold For:</div><div style='display: inline;padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>" + soldFor + "</div></li></ul></div>"
               }
               
               //Displays the order info at the top of the order entry page
               document.getElementById("display-order").innerHTML = "<table><tr><!--<td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>Orders:</td>--><td><button style='width: 100%' id='next-order'>Next</button></td><td class='cellone' style='padding: 5px 20px 3px 10px; font-weight: bold'>PO Number:</td><td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;' id='order-number'>" + orderNum + "</td><td class='cellone' style='padding: 5px 20px 3px 10px; font-weight: bold'>Name:</td><td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;' id='ship-name'>" + shipName + "</td><td class='cellone' style='padding: 5px 20px 3px 10px; font-weight: bold'>City:</td><td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;' id='ship-city'>" + shipCity + "</td><td class='cellone' style='padding: 5px 20px 3px 10px; font-weight: bold'>State:</td><td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;' id='ship-state'>" + shipState + "</td></tr><tr><!--<td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;'>" + numOfOrders + "  "+ i + "</td>--><td><button id='previous-order'>Previous</button></td><td class='cellone' style='padding: 5px 20px 3px 10px; font-weight: bold'>Address 1:</td><td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;' id='address-one'>" + shipAddressOne + "</td><td class='cellone' style='padding: 5px 20px 3px 10px; font-weight: bold'>Address 2:</td><td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;' id='address-two'>" + shipAddressTwo + "</td><td class='cellone' style='padding: 5px 20px 3px 10px; font-weight: bold'>Zip:</td><td class='celltwo' style='padding: 0 20px 0 5px; background-color: #cccccc; border-bottom: 1px solid white;' id='ship-zip'>" + shipZip + "</td></tr></table>" 
               
               //When clicked it reruns the entire function
               document.getElementById("next-order").addEventListener("click", nextOrderBtn);
               //Stores the order number and date in local storage
               document.getElementById("next-order").addEventListener("click", storeOrder); 
           
               //This stores the order number in local storage. 
               function storeOrder() { 
                   let inputTime = new Date();
                   let salesRecordObj = "Order-" + orderNum;
                   let objValue = {
                       "OrderNumber" : orderNum,
                       "Date" : inputTime
                   }

                   //Create a variable that is variable and then assigns an object to the new variable
                   window[salesRecordObj] = objValue;

                   localStorage.setItem(salesRecordObj, JSON.stringify(objValue))//This works

                   //console.log(orderNum)
               }

               //To delete local storage use this code
               /*
               const desiredDate = "2023-03-07T22:20:25.628Z";//Check where the orders stand. Then change this date.
               Object.keys(localStorage)
                .filter(key => key.includes("Order"))
                .forEach(key => {
                  const value = JSON.parse(localStorage.getItem(key));
                  if (value.Date <= desiredDate) {
                    localStorage.removeItem(key);
                  }
                });
               */

               // console.log(shipName, salesRec, orderNum, shipAddress1);
               //console.log(numOfOrders);
               // 

               copyText();

               function copyText() {

                   document.getElementById("order.customer_id").addEventListener("focus", custID);
                   function custID() {
                       document.getElementById("order.customer_id").value = ebay;
                   }

                   let copyText = orderNum;
                   navigator.clipboard.writeText(copyText);
               
                   addEventListener('paste', (event) => { 
               
                   if(copyText === ebay) {
               
                           copyText = orderNum; 
                           navigator.clipboard.writeText(copyText); 
               
                   } else if (copyText === orderNum) {
                       
                           //Tests to see if there are multiple items
                           if(numOfItems > 1){
                       
                               let items = 0;//Iterates through the number of items
               
                               //Run this function if copytext - orderNum
                               multiItems();

                               function multiItems(callback) {
                                 // Check if there are more items to process
                                 if (items < numOfItems) {
                                   // Get the label and quantity for the current item
                                    itemCustomLabel = counts[orderNumber].CustomLabels[items]; 
                                    itemQuantity = counts[orderNumber].Quantities[items]; 
                                   // Copy the label to the clipboard and wait for the user to paste it
                                    copyText = itemCustomLabel;
                                    navigator.clipboard.writeText(copyText);
                                    addEventListener('paste', (event) => {
                                     // When the label is pasted, copy the quantity to the clipboard and wait for the user to paste it
                                    if (copyText === itemCustomLabel) {
                                        copyText = itemQuantity;
                                        navigator.clipboard.writeText(copyText);
                                        addEventListener('paste', (event) => {
                                         // When the quantity is pasted, increment the item counter and call the multiItems function recursively
                                            if (copyText === itemQuantity) {
                                                 items++;
                                                multiItems(callback);
                                                }
                                                })
                                            }
                                        })
                                    } else {
                                   // If all items have been processed, call the callback function
                                    callback();
                                    }
                            }
               
                              
                           } else {
           
                           copyText = itemNumOne; // Item Number
                           navigator.clipboard.writeText(copyText);
                           document.getElementById("order-number").style.backgroundColor = "red";
           
                           addEventListener('paste', (event) => { 
                              
                               if (copyText === itemNumOne) {
                               copyText = quantityOne; // Item Quantity
                               navigator.clipboard.writeText(copyText);
                               document.getElementById("item-one").style.backgroundColor = "red";

                               addEventListener('paste', (event) => { 
                                   if(copyText === quantityOne) {
                                       document.getElementById("quantity-one").style.backgroundColor = "red";
                                   }

                               })   
                               }
                           })
           
                       }
                  }
                       });
       
                        let shipToBtn = document.querySelector("div#p21TabsetDir ul").childNodes[7];
                        shipToBtn.addEventListener('click', (event) => { 
                   
                        copyText = shipName; // Ship Name
                        navigator.clipboard.writeText(copyText);
                        //document.getElementById("quantity-one").style.backgroundColor = "red";
                        
                        addEventListener('paste', (event) => { 
               
                           if (copyText === shipName) {
                           copyText = shipAddressOne; // Ship Address
                           navigator.clipboard.writeText(copyText);
                           document.getElementById("ship-name").style.backgroundColor = "red";
                        } else if (copyText === shipAddressOne) {

                            if (shipAddressTwo === undefined || shipAddressTwo === null || shipAddressTwo === "undefined") {
                                shipAddressTwo = "";
                                copyText = shipAddressTwo;
                            } else {
                            copyText = shipAddressTwo; // Ship Address
                            }    
                           navigator.clipboard.writeText(copyText);
                           document.getElementById("address-one").style.backgroundColor = "red";
                        } else if (copyText === shipAddressTwo) {
                           copyText = shipCity; // Ship City
                           navigator.clipboard.writeText(copyText);
                           document.getElementById("address-two").style.backgroundColor = "red";
                           } else if (copyText === shipCity) {
                           copyText = shipState; // Ship State
                           navigator.clipboard.writeText(copyText);
                           document.getElementById("ship-city").style.backgroundColor = "red";
                           } else if (copyText === shipState) {
                           copyText = shipZip; // Ship Zip
                           navigator.clipboard.writeText(copyText);
                           document.getElementById("ship-state").style.backgroundColor = "red";

                           addEventListener('paste', (event) => { 
                               if(copyText === shipZip) {
                                   document.getElementById("ship-zip").style.backgroundColor = "red";
                               }

                           })   
                       } 
                   });    
             });
            }
               //After running through once, add one to iterate through the object in the JSON file
               i++

           } else {
               //If it finds a matching order number in local storage, do nothing and keep looking
               i++
               nextOrderBtn();

           }


       } else {
           //If all orders match up with an order number in local storage
           document.getElementById("display-order").innerHTML = "No more orders"
       }

   })

   .catch(function(error) {
      // Handle any errors
   console.error("Error reading JSON file: ", error);

   });
  
}

