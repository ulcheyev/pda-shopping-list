import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

class LocalDB {
  constructor() {
    //FileSystem.deleteAsync(`${FileSystem.documentDirectory}/SQLite/pda-green-monkey.db`).then( () =>
    this.localdatabase = SQLite.openDatabase("pdagreenmonkey.db");

    this.createTables().then(() => console.log("Created tables"));
    //this.localdatabase = SQLite.openDatabase("pda-green-monkey.db");

    //setDbStorage(this.localdatabase)
  }

  async createTables() {
    const itemsQuery = `
      CREATE TABLE IF NOT EXISTS Items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          price REAL,
          quantity REAL,
          checked INTEGER,
          measure TEXT,
          name TEXT,
          photo TEXT,
          shopId INTEGER,
          FOREIGN KEY (shopId) REFERENCES lists(id)
      )
    `;
    const shopsQuery = `
     CREATE TABLE IF NOT EXISTS Shops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        listId INTEGER,
        FOREIGN KEY (listId) REFERENCES lists(id)

     )
    `;

    const listQuery = `
     CREATE TABLE IF NOT EXISTS Lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
     )
    `;

    const notificationsQuery = `
     CREATE TABLE IF NOT EXISTS Notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        header TEXT,
        text TEXT,
        date DATE
     )
    `;

    const purchaseQuery = `
    CREATE TABLE IF NOT EXISTS Purchase (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       shop TEXT,
       price INT default 0,
       date DATE
    )
   `;

    const insertNotification = `
    INSERT INTO Notifications (header, text, date) VALUES (?, ?, ?) 
    `;

    return new Promise(() =>
      this.localdatabase.transaction((tx) => {
        console.log("Initiating tables...");

        tx.executeSql(
          listQuery,
          null,
          (tx, r) => {
            console.log("Created list table");
          },
          console.error,
        );
        tx.executeSql(
          itemsQuery,
          null,
          (tx, r) => {
            console.log("Created items table");
          },
          console.error,
        );
        tx.executeSql(
          shopsQuery,
          null,
          (tx, r) => {
            console.log("Created shops table");
          },
          console.error,
        );
        tx.executeSql(
          purchaseQuery,
          null,
          (tx, r) => {
            console.log("Created purchase table");
          },
          console.error,
        );
        tx.executeSql(notificationsQuery, null, (tx, r) => {
          console.log("Created notifications table");
        });

        // tx.executeSql(
        //   insertNotification,
        //   ["Name", "This is a notification !!!!", "2024-08-02"],
        //   (tx, r) => {
        //     console.log("Created new notificaion");
        //   },
        // console.error,
        // );
        //console.log(FileSystem.documentDirectory);
      }),
    );
  }

  getListItems = async () => {
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql("SELECT * FROM Lists", null, (txObt, result) => {
          resolve(result);
        });
      }),
    );
  };

  getShopItems = async (shopId) => {
    return new Promise((resolve, reject) => {
      this.localdatabase.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM Items WHERE shopId = ?",
          [shopId],
          (txObj, result) => {
            console.log("Got items");
            resolve(result);
          },
          console.error,
        );
      });
    });
  };

  getShops = async (listId) => {
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM Shops WHERE listId = ?",
          [listId],
          (txObt, result) => {
            console.log("Got shops localDB");
            resolve(result);
          },
          console.error,
        );
      }),
    );
  };

  createShop = async (id, name) => {
    console.log("db is creating");
    console.log(`id is ${id} ${name}`);
    return new Promise((resolve, reject) => {
      this.localdatabase.transaction((tx) => {
        console.log("entered transaction");
        tx.executeSql(
          "INSERT INTO Shops (name, listId) VALUES (?, ?)",
          [name, id],
          (txObj, result) => {
            console.log("OK");
            resolve(result);
          },
          (txObj, error) => {
            console.error("Error", error);
            reject(error);
          },
        );
      });
    });
  };

  createList = async (name) => {
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        console.log("Created list!!!");
        tx.executeSql(
          "INSERT INTO Lists (name) VALUES (?)",
          [name],
          (txObt, result) => {
            resolve(result);
          },
          console.error,
        );
      }),
    );
  };

  changeItemChecked = async (itemId, checked) => {
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql(
          "UPDATE Items SET checked = ? WHERE id = ?",
          [checked, itemId],
          (txObt, result) => {
            console.log(`CHanged ${itemId} to ${checked}`);
            resolve(result);
          },
          console.error,
        );
      }),
    );
  };

  incrementPurchasePrice = async (shop, date, price) => {
    const selectQuery = "SELECT * FROM Purchase WHERE date = ? and shop = ?";
    console.log(date);
    console.log("Incrementing price");
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql(
          selectQuery,
          [date, shop],
          (txObt, result) => {
            console.log("Result is");
            console.log(result.rows._array);
            if (result.rows._array.length > 0) {
              this.updatePrice(shop, date, price);
            } else {
              this.insertPrice(shop, date, price);
            }
            resolve();
          },
          console.error,
        );
      }),
    );
  };

  insertPrice = async (shop, date, price) => {
    const insertQuery =
      "INSERT INTO Purchase (shop, date, price) VALUES (?, ?, ?)";
    console.log(shop);
    this.localdatabase.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        [shop, date, price],
        (r) => console.log("inserted"),
        console.error,
      );
    });
  };

  updatePrice = async (shop, date, price) => {
    const updateQuery =
      "UPDATE Purchase SET price = (price + ?) WHERE date = ? AND shop = ?";
    console.log(shop);
    this.localdatabase.transaction((tx) => {
      tx.executeSql(
        updateQuery,
        [price, date, shop],
        (tx, r) => {
          console.log(r);
          console.log("updatedd");
        },
        console.error,
      );
    });
  };

  saveItem = async (
    name,
    price,
    quantity,
    checked,
    measure,
    shopId,
    photo = "",
  ) => {
    console.log("saving item");
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO Items (name, price, quantity, checked, measure, shopId, photo) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, price, quantity, checked, measure, shopId, photo],
          (txObt, result) => {
            console.log("Added item :)");
            resolve(result);
          },
          console.error,
        );
      }),
    );
  };

  uncheckAllItems = async (listId) => {
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql(
          "UPDATE Items SET checked = ? WHERE shopId in ( SELECT id FROM Shops WHERE listID = ? ); ",
          [false, listId],
          (txObt, result) => {
            console.log("Unchecked all items");
            resolve(result);
          },
          console.error,
        );
      }),
    );
  };

  getNotifications = async () => {
    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql("SELECT * FROM Notifications", null, (txObt, result) => {
          resolve(result);
        });
      }),
    );
  };

  getPurchasesGroupedByShop = async (dateFrom, dateTo) => {
    console.log("Executiong query");
    console.log(dateFrom);
    console.log(dateTo);
    const sqlQuery =
      "SELECT shop, SUM(price) AS total_price FROM Purchase GROUP BY shop;";
    this.localdatabase.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Purchase",
        null,
        (txObt, result) => {
          console.log("success");
          console.log(result.rows._array);
        },
        console.error,
      );
    });

    return new Promise((resolve, reject) =>
      this.localdatabase.transaction((tx) => {
        tx.executeSql(
          sqlQuery,
          [dateFrom, dateTo],
          (txObt, result) => {
            console.log("success");
            resolve(result);
          },
          console.error,
        );
      }),
    );
  };
}

export default LocalDB;
