import mongoose from "mongoose";

const userSchema = mongoose.Schema({
     
    userName : {
        type : String, required : true
    },
    email : {
        type : String, required : true, unique : true
    },
    password : {
        type : String, required : true
    },
    profilePic : {
        type : String, defualt : ""
    },
    bio : {
        type : String, defualt : "Finding a plateform"
    } 
}, {
    timestamps : true
})

 const User = mongoose.model("User", userSchema);

 export default User;