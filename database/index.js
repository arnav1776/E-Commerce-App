module.exports.init = function()
{
  const mongoose = require('mongoose');
  mongoose.connect('mongodb+srv://arnav:1234@cluster0.oralr.mongodb.net/ecommerce?retryWrites=true&w=majority')
  .then(function()
  {
    console.log("Database is live")
  })
  .catch(function()
  {
    console.log("Error in connection")
  })
}