const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    passCode:{
        type:String,
        required:true,
        default:"0000"
    },
    isAdmin:{
        type:Boolean,
        required:true,
        default:false
    }
})

const User=mongoose.model('User',userSchema);

module.exports=User;