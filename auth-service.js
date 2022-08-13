const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var schema = mongoose.schema;
var userSchema = new schema({
    userName:{
        type: String,
        unique: true,},
    password: String,
    email: String,
    loginHistory:
    [{
        dateTime: Date,
        userAgent: String,
    }]    
});
let User;
module.exports.initialize= function()
{
    return new Promise(function(resolve, reject)
    {
        let db = mongoose.createConnection("mongodb+srv://sharmilenn12:sharmilenn12@cluster0.ihvxk.mongodb.net/?retryWrites=true&w=majority");

        db.on("error", (err)=>{
            reject(err);
        });
        db.once("open", ()=>{
            User = db.model("users",userSchema);
            resolve();
        })
    })
    
};
module.exports.registerUser = function(Data)
{
    return new Promise(function(resolve,reject)
    {
        if(Data.password != Data.password2)
        {
            reject("Password do no match");
        }
        else {
            bcrypt.hash(Data.password, 10).then((hash,err)=>
            {
                if(err)
                {
                    reject("There was an error encrypting the password!");
                }
                else {
                    Data.password = hash;
                    let newUser = User(Data);

                    newUser.save((err)=>
                    {
                        if(err)
                        {
                            if (err.code == 11000)
                            {
                                reject("User Name already taken");
                            }
                            else {
                                reject("There was an error creating the user: " + err);
                            }
                        }
                        else {
                            resolve();
                        }
                    })

                }
            })
        }
    })

}
module.exports.checkUser = function(Data)
{
    return new Promise(function(resolve,reject)
    {
        User.find(
            {
                userName: Data.userName
            }
        )
        .exec()
        .then((users)=>{
            if (users.length == 0)
            {
                reject("Unable to find user: " + Data.userName);
            }
            else{
                bcrypt.compare(Data.password, users[0].password).then((ref)=>{
                    if (ref == true)
                    {
                        users[0].loginHistory.push(
                            {
                                userAgent: Data.userAgent,
                                dateTime: new Data().toString(),
                            }
                        )
                        User.update(
                            {
                                userName: users[0].userName
                            },
                            {
                                $set:{
                                    loginHistory: users[0].loginHistory
                                }
                            }
                        )
                        .exec()
                        .then(()=>
                        {
                            resolve(users[0]);
                        })

                    }
                    else{
                        reject("Incorrect Password for user: "+ Data.userName);
                    }
                })
            }
        })
    })
}