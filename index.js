const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const app = express()
const port = 3000
const User = require('./models/userModel');
const Transaction = require('./models/transactionModel');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to SF06 API!')
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.find({ _id: id });
    res.status(200).json(user);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/users/login/:passcode', async (req, res) => {
  try {
    const { passcode } = req.params;
    const user = await User.findOne({ passCode: passcode });
    if (user == null)
      res.status(404).json({ "isValid": false, "data": null });
    else
      res.status(200).json({ "isValid": true, "data": user });
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json(user);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body);
    const updatedUser = await User.findById(id);
    res.status(200).json(updatedUser);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User has been deleted!" });
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.post('/transactions/', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(200).json(transaction);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/filter/:type', async (req, res) => {
  try {
    const { type } = req.params;
    var transactions = await Transaction.find({ isCredited: false }).sort('timeStamp');
    if (type == "day") {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      var todayDate = yyyy + '-' + mm + '-' + dd;
      transactions = transactions.filter(t => {
        var tranD = new Date(t.timeStamp);
        return tranD.toISOString().split('T')[0] == todayDate
      })
    }
    else if (type == "week") {
      //Don't follow the DB timestamp time its not in local time it is 5.30 hours behind
      var date1 = new Date();
      var date2 = new Date();
      date1.setDate(date1.getDate() - date1.getDay() + 1);
      date2.setDate(date2.getDate() - date2.getDay() + 1);
      var startDayOfWeek = date1;
      date2.setDate(date2.getDate() + 7);
      var endDayOfWeek = date2;
      var ddS = String(startDayOfWeek.getDate()).padStart(2, '0');
      var mmS = String(startDayOfWeek.getMonth()).padStart(2, '0');
      var yyyyS = startDayOfWeek.getFullYear();
      var ddE = String(endDayOfWeek.getDate()).padStart(2, '0');
      var mmE = String(endDayOfWeek.getMonth()).padStart(2, '0');
      var yyyyE = endDayOfWeek.getFullYear();
      transactions = transactions.filter(t => {
        var start = new Date(yyyyS, mmS, ddS);
        var end = new Date(yyyyE, mmE, ddE);
        var tranD = new Date(t.timeStamp);
        return tranD > start && tranD < end
      })
    }
    else if (type == "month") {
      var today = new Date();
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      transactions = transactions.filter(t => {
        return t.timeStamp.toISOString().split('-')[1] == mm
      })
    }
    const transaction = JSON.parse(JSON.stringify(transactions));
    var updatedTransactions = transaction.map((t) => ({ ...t, firstName: "" }))
    for (let index = 0; index < updatedTransactions.length; index++) {
      const user = await User.findById(updatedTransactions[index].userId);
      updatedTransactions[index].firstName = user.firstName;

    }
    res.status(200).json(updatedTransactions);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/getBalance', async (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  try {
    var creditedTransaction = await Transaction.find({ isCredited: true });
    if (creditedTransaction.length > 0) {
      creditedTransaction = creditedTransaction.filter((c) => {
        return (Number(c.timeStamp.toISOString().split('-')[1]) == currentMonth)
      })
    }
    var totalAmount = 0;
    creditedTransaction.forEach(t => {
      totalAmount += t.amount;
    });
    const isPaidBackTransaction = await Transaction.find({ isPaidBack: true });
    isPaidBackTransaction.forEach(t => {
      if (Number(t.timeStamp.toISOString().split('-')[1]) == currentMonth)
        totalAmount -= t.amount;
    });
    console.log(totalAmount);
    res.status(200).json({ balance: totalAmount });
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/getTotalCreditedAmount', async (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  try {
    var creditedTransaction = await Transaction.find({ isCredited: true });
    if (creditedTransaction.length > 0) {
      creditedTransaction = creditedTransaction.filter((c) => {
        return (c.timeStamp.toISOString().split('-')[1] == currentMonth)
      })
    }
    var totalAmount = 0;
    creditedTransaction.forEach(t => {
      totalAmount += t.amount;
    });
    res.status(200).json({ amount: totalAmount });
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/getDuesDetail', async (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  try {
    var unPaidTransaction = await Transaction.find({ isPaidBack: false, isCredited: false });
    if (unPaidTransaction.length > 0) {
      unPaidTransaction = unPaidTransaction.filter((c) => {
        return (c.timeStamp.toISOString().split('-')[1] == currentMonth)
      })
    }
    var admin = await User.findOne({ isAdmin: true });
    var allUser = await User.find();
    var due;
    var result = [];
    allUser.forEach((u) => {
      due = 0;
      unPaidTransaction.forEach(t => {
        if (String(t.userId) == String(u._id))
          due += t.amount;
      });
      result.push({ admin: admin.firstName, user: u.firstName,userId:u._id, dueAmount: due });
    })
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})
app.put('/transactions/clearDues/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    var clearDuesForUser = await Transaction.updateMany({ isPaidBack: false, isCredited: false,userId },{"$set":{"isPaidBack": true}});
    res.status(200).json("Dues Cleared For The User");
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.find({ _id: id });
    res.status(200).json(transaction);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndUpdate(id, req.body);
    const updatedTransactions = await Transaction.findById(id);
    res.status(200).json(updatedTransactions);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

// app.put('/transactions/clearDues', async (req, res) => {
//   const currentMonth = new Date().getMonth() + 1;
//   try {
//     var unPaidTransaction = await Transaction.find({ isPaidBack: false, isCredited: false });
//     if (unPaidTransaction.length > 0) {
//       unPaidTransaction = unPaidTransaction.filter((c) => {
//         return (c.timeStamp.toISOString().split('-')[1] == currentMonth)
//       })
//     }
//     var admin = await User.findOne({ isAdmin: true });
//     var nonAdmin = await User.find({ isAdmin: false });
//     var due;
//     var result = [];
//     nonAdmin.forEach((u) => {
//       due = 0;
//       unPaidTransaction.forEach(t => {
//         if (String(t.userId) == String(u._id))
//           due += t.amount;
//       });
//       result.push({ admin: admin.firstName, user: u.firstName, dueAmount: due });
//     })
//     res.status(200).json(result);
//   }
//   catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: error.message });
//   }
// })

app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);
    res.status(200).json({ message: "Transaction has been deleted!" });
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/byDate/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const transactions = await Transaction.find();
    const transactionsByDate = transactions.filter(t => t.timeStamp.toISOString().split('T')[0] == date);
    res.status(200).json(transactionsByDate);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/byWeek/:startDay/:endDay', async (req, res) => {
  try {
    const { startDay } = req.params;
    const { endDay } = req.params;
    const actualDay = new Date(endDay + "T23:59:59.000Z");
    const transactions = await Transaction.find({ timeStamp: { $gte: startDay, $lte: actualDay } });
    res.status(200).json(transactions);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

app.get('/transactions/getCredits/currentMonth', async (req, res) => {
  try {
    const today=new Date();
    const firstDateOfMonth=new Date(today.getFullYear(),today.getMonth(),1);
    //issue with date time check the firstDayOfMonth in console log.
    const creditedTransactions = await Transaction.find({ isCredited:true , timeStamp:{$gte:firstDateOfMonth} });
    res.status(200).json(creditedTransactions);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

mongoose.connect('mongodb+srv://pratik:pratik123@deployments.yjqiwqf.mongodb.net/SF-06?retryWrites=true&w=majority'
).then(() => {
  console.log("The cloud DB is connected");
  app.listen(port, () => {
    console.log(`My app listening on port ${port}`);
  })
}).catch((error) => {
  console.log(error);
})