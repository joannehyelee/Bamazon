var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "",
    database: "bamazon_db"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayItems();
});

function displayItems() {
    connection.query("SELECT id, product_name, price FROM products", function(err, results){
        if (err) throw err;

        console.log(JSON.stringify(results, null, 2));

        askCustomer();
    });
}

function askCustomer() {

    // Query the database for all products
    connection.query("SELECT * FROM products", function (err, results){

        if (err) throw err;

        // Once you have the products, ask the user what they would like to buy
        inquirer
            .prompt([
                {
                    name: "id",
                    type: "input",
                    message: "What is the ID of the product you would like to buy?"
                },
                {
                    name: "units",
                    type: "input",
                    message: "How many units of the product would you like to buy?"
                }
            ])
            .then(function(answer){
                var chosenItem;

                // Get information of the chosen item
                for (var i = 0; i < results.length; i++) {
                    if (results[i].id === parseInt(answer.id)) {
                        chosenItem = results[i];
                    }
                }
                // console.log(chosenItem);

                // Check if store has enough product
                if (chosenItem.stock_quantity >= answer.units) {
                    // If the item is in stock, update SQL database & show total cost to customer

                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity - parseInt(answer.units)
                            },
                            {
                                id: chosenItem.id
                            }
                        ],
                        function(error) {
                            if (error) throw err;

                            console.log("Your total cost is $" + chosenItem.price * answer.units);
                        }
                    );
                }
                else {
                    console.log("I'm sorry.. insufficient quantity!")
                }
            
            });
        });
    }