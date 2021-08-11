const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
    name : {
        type: String
    },
    description : {
        type: String
    },
    admin : {
        type: Schema.Types.ObjectId,
        ref:'Member'
    },
    members : [{
        type: Schema.Types.ObjectId,
        ref:'Member'
    }],
    polls : [{
        type: Schema.Types.ObjectId,
        ref:'Poll'
    }],
    invitedUsers : [{
        type: Schema.Types.ObjectId,
        ref:'Member'
    }]
});

module.exports = mongoose.model('Team', TeamSchema);