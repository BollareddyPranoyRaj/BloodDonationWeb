const VolunteerSchema = require('../../models/VolunteerSchema');

const VolunteerHandler = async (req, res) => {
    console.log("Volunteer handler processing...");
    let volunteerData = req.body;

    try {
        // Create and save the volunteer in the database
        let VolunteerDB = new VolunteerSchema(volunteerData);
        let savedVolunteer = await VolunteerDB.save();

        // Return the saved volunteer data in the response
        return res.status(200).json(savedVolunteer);
    } catch (error) {
        console.error("Error saving volunteer:", error);
        return res.status(500).json({ error: "An error occurred while saving the volunteer" });
    }
};

exports.VolunteerHandler = VolunteerHandler;