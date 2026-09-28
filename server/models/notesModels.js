const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    notes:{
        type:String,
        required:true

    }
})

const Notes = mongoose.models.Notes || mongoose.model("Notes", notesSchema);

module.exports = Notes;
