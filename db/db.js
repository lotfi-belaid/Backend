const mongoose = require('mongoose')
module.exports.connectToMongoDB = async () => {
    mongoose.set('strictQuery', false);//It makes Mongoose more flexible, so you can search for data using any field, even if that field isn’t in your schema. This is sometimes useful, but can also make your queries less strict.
    mongoose.connect('mongodb+srv://lotfi_belaid:lotfibelaid@cluster0.yrdne1w.mongodb.net/').then(() => {
        console.log("connected to mongoDb successfully")
    }).catch((err) => {
        console.error("error connecting to mongoDb", err)
    })
}   