const mongoose = require('mongoose');

// Company schema and model
var companySchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    },
    employees: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String,
        status: String,
        from: Date,
        to: Date
    }]
});

var Company = mongoose.model("Company", companySchema);

module.exports = Company;
