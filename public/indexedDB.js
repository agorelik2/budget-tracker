      let databaseName = "budget";
      let db;
      let storeName = "pending";

      const request = window.indexedDB.open(databaseName, 1);
      
      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        db.createObjectStore(storeName, { autoIncrement: true });
      };
  
      request.onerror = function(e) {
        console.log("There was an error" + e.target.errorCode);
      };
  
      request.onsuccess = function(e) {
        db = e.target.result;

        // check if app is online before reading from db
        if (navigator.onLine) {
          checkDatabase();
        }
        //tx = db.transaction(storeName, "readwrite");
        //store = tx.objectStore(storeName);
  
        // db.onerror = function(e) {
        //   console.log("error");
        // };
        // if (method === "put") {
        //   store.put(object);
        // }
        // if (method === "clear") {
        //   store.clear();
        // }
        // if (method === "get") {
        //   const all = store.getAll();
        //   all.onsuccess = function() {
        //     resolve(all.result);
        //   };
        // }
        // tx.oncomplete = function() {
        //   db.close();
        // };
      };

      // if offline, then save transaction record in "pending" store
      function saveRecord(record) {
        // create a transaction on the pending db with readwrite access
        const transaction = db.transaction(["pending"], "readwrite");
      
        // access your pending object store
        const store = transaction.objectStore("pending");
      
        // add record to your store with add method.
        store.add(record);
      }
      
      // check if app is online, then save records from pending store
      function checkDatabase() {
        // open a transaction on your pending db
        const transaction = db.transaction(["pending"], "readwrite");
        // access your pending object store
        const store = transaction.objectStore("pending");
        // get all records from store and set to a variable
        const getAll = store.getAll();
      
        getAll.onsuccess = function() {
          if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
              method: "POST",
              body: JSON.stringify(getAll.result),
              headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
              }
            })
            .then(response => response.json())
            .then(() => {
              // if successful, open a transaction on your pending db
              const transaction = db.transaction(["pending"], "readwrite");
      
              // access your pending object store
              const store = transaction.objectStore("pending");
      
              // clear all items in your store
              store.clear();
            });
          }
        };
      }
      
      // listen for app coming back online
      window.addEventListener("online", checkDatabase);
    
  
  