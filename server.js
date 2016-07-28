var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";
var SCOUTS_COLLECTION = "scouts";
var CUSTOMERS_COLLECTION = "customers";
var SALESHEETS_COLLECTION = "salesheets";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function () {
        var port = server.address().port;
        console.log("App now running on port", port);
    });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.post("/addscout", function(req, res) {
    var newScout = req.body;
    newScout.createDate = new Date();

    if (!req.body.name) {
        handleError(res, "Invalid user input", "Must provide a name.", 400);
    }
    db.collection(SCOUTS_COLLECTION).insertOne(newScout, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new scout.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
});

app.get("/scouts/sales", function (req, res) {
    db.collection(SALESHEETS_COLLECTION).findOne({scoutId: new ObjectID(req.params.id), year: req.params.id}, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get sales spreadsheet data.");
        } else {
            res.status(204).json(doc);
        }
    });
});

app.post("/scouts/sales/add", function (req, res) {
    var sale = req.body;

    db.collection(SALESHEETS_COLLECTION).insertOne(sale, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new spreasheet.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
});

app.get("/contacts", function(req, res) {
    db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(docs);
        }
    });
});

app.get("/scouts", function (req, res) {
    db.collection(SCOUTS_COLLECTION).find({name: req.params.name}).toArray(function (err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get scouts.");
        } else {
            res.status(200).json(docs);
        }
    })
});

app.get("/customers", function (req, res) {
    db.collection(CUSTOMERS_COLLECTION).find({}).toArray(function (err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get customers.");
        } else {
            res.status(200).json(docs);
        }
    })
});

app.get("/clearall", function(req, res) {
    db.collection(SCOUTS_COLLECTION).removeMany({}, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get contact");
        } else {
            res.status(200).json(doc);
        }
    });
});

app.post("/customers", function(req, res) {
    var newCustomer = req.body;

    if (!req.body.name) {
        handleError(res, "Invalid user input", "Must provide a name", 400);
    }

    db.collection(CUSTOMERS_COLLECTION).insertOne(newCustomer, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new customer.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    })
});

app.post("/contacts", function(req, res) {
    var newContact = req.body;
    newContact.createDate = new Date();

    if (!(req.body.firstName || req.body.lastName)) {
        handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
    }

    db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new contact.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {
    db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get contact");
        } else {
            res.status(200).json(doc);
        }
    });
});

app.put("/contacts/:id", function(req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to update contact");
        } else {
            res.status(204).end();
        }
    });
});

app.delete("/contacts/:id", function(req, res) {
    db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
        if (err) {
            handleError(res, err.message, "Failed to delete contact");
        } else {
            res.status(204).end();
        }
    });
});