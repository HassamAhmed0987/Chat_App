import mongoose from "mongoose";


async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo Db connect successfully");
    } catch (err) {
        console.log(err.message);
        process.exit(1)
    }
}


export default connectDB
