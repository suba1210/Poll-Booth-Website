const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    title : {
        type:String
    },
    question : {
        type : String
    },
    options : [{
        type : String
    }],
    startTime : {
        type : Date 
    },
    deadline : {
        type : Date
    },
    team : {
        type: Schema.Types.ObjectId,
        ref: 'Team'        
    },
    isPresent : {
        type : Boolean,
        default : true
    },
    responded : [{
        type: Schema.Types.ObjectId,
        ref : 'Member'
    }],
    results : [{
        type:String
    }]
},{
    timestamps: true
});

module.exports = mongoose.model('Poll', PollSchema);