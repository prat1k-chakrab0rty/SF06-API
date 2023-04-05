const { ObjectId } = require('mongoose');
const mongoose=require('mongoose');

const transactionSchema=mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    for:{
        type:String,
        required:true,
    },
    timeStamp:{
        type:Date,
        required:true,
        default:Date.now()
    },
    isCredited:{
        type:Boolean,
        required:true,
        default:false
    },
    isPaidBack:{
        type:Boolean,
        required:true,
        default:false
    },
})

const Transaction=mongoose.model('Transaction',transactionSchema);

module.exports=Transaction;