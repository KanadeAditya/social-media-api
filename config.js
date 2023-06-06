const mongoose = require('mongoose');

const connection = mongoose.connect(process.env.DBurl);

module.exports = {connection}