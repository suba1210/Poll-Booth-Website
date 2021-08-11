const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongo = require('passport-local-mongoose');


const MemberSchema = new Schema ({
    email : {
        type:String
    },
    gender : {
        type:String
    },
    role : {
        type : String
    },
    teams : [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }],
    notify : {
        type : String
    },
    inviteGot : {
        type : Boolean,
        default : false
    },
    invites : [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }],
    joinedMembers : [{
        type: String
    }]
});

MemberSchema.plugin(passportLocalMongo); // it will check whether the user names are unique

module.exports = mongoose.model('Member', MemberSchema);