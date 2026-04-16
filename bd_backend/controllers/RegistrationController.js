const axios = require("axios");
const Register = require("../models/RegistrationSchema");

const getDayBounds = (dateValue) => {
  const date = new Date(dateValue);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const findRegistrationByRollAndDate = async (rollno, eventDate) => {
  const { start, end } = getDayBounds(eventDate);

  return Register.findOne({
    rollno,
    EventDate: { $gte: start, $lte: end },
  });
};

const buildRegistrationFromStudentData = async ({
  RollNumber,
  PhoneNumber,
  EventDate,
  SelectedEventId = "",
  SelectedEventName = "",
  donated = false,
}) => {
  const studentApiData = await axios.get(
    `https://adityauniversity.in/latecomersbackendapi/get-Student-Data/${RollNumber}`
  );

  const student = studentApiData.data?.[0];

  if (!student) {
    return null;
  }

  return {
    studentname: student.studentName,
    rollno: RollNumber,
    mobilenumber: PhoneNumber,
    emailid: student.email || `${RollNumber}@adityauniversity.in`,
    college: student.college,
    collegeCode: student.collegeCode,
    branch: student.branch,
    gender: student.gender || "Unknown",
    EventDate,
    SelectedEventId,
    SelectedEventName,
    donated,
    donatedAt: donated ? new Date() : null,
  };
};

// Create a new registration
const createRegistration = async (req, res) => {
  try {
    const isSimpleRegistration = req.body.RollNumber || req.body.PhoneNumber;

    let registrationData;

    if (isSimpleRegistration) {
      const { RollNumber, PhoneNumber, EventDate, SelectedEventId, SelectedEventName } = req.body;

      if (!RollNumber || !PhoneNumber || !EventDate) {
        return res.status(400).json({ message: "RollNumber, PhoneNumber and EventDate are required" });
      }

      const existingRegistration = await findRegistrationByRollAndDate(
        RollNumber,
        EventDate
      );

      if (existingRegistration) {
        return res.status(200).json({ message: "Student is already registered for this event date" });
      }

      registrationData = await buildRegistrationFromStudentData({
        RollNumber,
        PhoneNumber,
        EventDate,
        SelectedEventId,
        SelectedEventName,
      });

      if (!registrationData) {
        return res.status(404).json({ message: "Student data not found for this roll number" });
      }
    } else {
      const {
        studentname,
        rollno,
        mobilenumber,
        emailid,
        college,
        collegeCode,
        branch,
        gender,
        EventDate,
        SelectedEventId,
        SelectedEventName,
      } = req.body;

      registrationData = {
        studentname,
        rollno,
        mobilenumber,
        emailid,
        college,
        collegeCode,
        branch,
        gender,
        EventDate,
        SelectedEventId,
        SelectedEventName,
      };
    }

    const newRegistration = new Register(registrationData);

    await newRegistration.save();

    // Notify the admin panel in real-time via Socket.io
    const io = req.app.get("io");
    io.emit("newRegistration", newRegistration);

    res.status(201).json({ message: "Registration successful", data: newRegistration });
  } catch (error) {
    console.error("Error creating registration:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const getRegistrationStatusByRollNumber = async (req, res) => {
  try {
    const { rollno } = req.params;

    if (!rollno) {
      return res.status(400).json({ message: "rollno is required" });
    }

    const normalizedRollNo = rollno.trim();
    const registrations = await Register.find({
      rollno: { $regex: `^${normalizedRollNo}$`, $options: "i" },
    }).sort({ EventDate: -1, createdAt: -1, _id: -1 });

    if (!registrations.length) {
      return res.status(404).json({
        found: false,
        status: "not-registered",
        message: "This roll number is not registered for blood donation yet.",
      });
    }

    const donatedRegistration = registrations.find((registration) => registration.donated);
    const latestRegistration = registrations[0];
    const referenceRegistration = donatedRegistration || latestRegistration;

    return res.status(200).json({
      found: true,
      status: donatedRegistration ? "donated" : "registered",
      message: donatedRegistration
        ? "Donation confirmed successfully for this donor."
        : "This donor is registered but not yet marked as donated.",
      donor: {
        studentname: referenceRegistration.studentname,
        rollno: referenceRegistration.rollno,
        branch: referenceRegistration.branch,
        college: referenceRegistration.college,
        eventDate: referenceRegistration.EventDate,
        eventName:
          referenceRegistration.SelectedEventName || "Blood Donation Camp",
        donatedAt: referenceRegistration.donatedAt,
        registrationsCount: registrations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching registration status by roll number:", error);
    return res.status(500).json({ message: "Error fetching donor status" });
  }
};

const findRegistration = async (req, res) => {
  try {
    const { rollno, eventDate } = req.query;

    if (!rollno || !eventDate) {
      return res.status(400).json({
        message: "rollno and eventDate are required",
      });
    }

    const registration = await findRegistrationByRollAndDate(rollno, eventDate);

    if (!registration) {
      return res.status(404).json({
        found: false,
        message: "No registration found for this roll number on the selected date",
      });
    }

    return res.status(200).json({
      found: true,
      donated: registration.donated,
      data: registration,
    });
  } catch (error) {
    console.error("Error finding registration:", error);
    return res.status(500).json({ message: "Error finding registration" });
  }
};

const confirmDonation = async (req, res) => {
  try {
    const { RollNumber, PhoneNumber, EventDate, SelectedEventId, SelectedEventName } = req.body;

    if (!RollNumber || !EventDate) {
      return res.status(400).json({
        message: "RollNumber and EventDate are required",
      });
    }

    let registration = await findRegistrationByRollAndDate(RollNumber, EventDate);

    if (registration) {
      if (!registration.SelectedEventId && SelectedEventId) {
        registration.SelectedEventId = SelectedEventId;
        registration.SelectedEventName =
          SelectedEventName || registration.SelectedEventName;
      }

      if (registration.donated) {
        if (registration.isModified()) {
          await registration.save();
        }

        return res.status(200).json({
          message: "Donation already confirmed for this donor",
          data: registration,
        });
      }

      registration.donated = true;
      registration.donatedAt = new Date();
      await registration.save();
    } else {
      if (!PhoneNumber) {
        return res.status(400).json({
          message: "PhoneNumber is required when the donor is not already registered",
        });
      }

      const registrationData = await buildRegistrationFromStudentData({
        RollNumber,
        PhoneNumber,
        EventDate,
        SelectedEventId,
        SelectedEventName,
        donated: true,
      });

      if (!registrationData) {
        return res.status(404).json({
          message: "Student data not found for this roll number",
        });
      }

      registration = new Register(registrationData);
      await registration.save();
    }

    const io = req.app.get("io");
    io.emit("donationConfirmed", registration);

    return res.status(200).json({
      message: "Donation confirmed successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error confirming donation:", error);
    return res.status(500).json({ message: "Server error while confirming donation" });
  }
};

// Get all registrations (for Admin)
const getRegistrations = async (req, res) => {
  try {
    const registrations = await Register.find().sort({ _id: -1 });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations" });
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  findRegistration,
  confirmDonation,
  getRegistrationStatusByRollNumber,
};
