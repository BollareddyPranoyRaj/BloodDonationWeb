const ContactSchema = require('../../models/ContactSchema');

const ContactHandler = async (req, res) => {
    console.log("Contact handler processing...")
    let ContactData = req.body
    try {
        let ContactDB = new ContactSchema(ContactData);
        ContactDB.save();
        return res.status(200).json("Contact data stored successfully");
        
    } catch (error) {
        return res.status(500).json(error);
    }
   
} 

exports.ContactHandler = ContactHandler;