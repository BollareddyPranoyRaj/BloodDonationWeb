const StudentSchema = require('../../models/StudentSchema');
const StaffSchema = require('../../models/StaffSchema');
const ManagementAndGuestSchema = require('../../models/managementandguest');
const RegisterSchema = require('../../models/RegistrationSchema');
const axios = require('axios');

// Helper function to emit `new-registration` event
const emitLiveCountsUpdate = (req, EventDate) => {
  const io = req.app.get('io'); // Get the `io` instance from `req.app`
  if (io) {
    io.emit('new-registration', { message: 'Data updated', EventDate });
    console.log('Live counts updated');
  } else {
    console.error('Socket.IO instance not found');
  }
};

const StudentHandler = async (req, res) => {
  console.log('Student handler processing...');
  const studentData = req.body;

  try {
    // Check for existing student to avoid duplicates
    const existingStudent = await StudentSchema.findOne({ Rollno: studentData.Rollno, EventDate: studentData.EventDate });
    if (existingStudent) {
      return res.status(201).json({ message: 'Student already exists', student: existingStudent });
    }

    // Remove _id if present to let MongoDB generate a unique ID
    const { _id, ...dataWithoutId } = studentData;
    const StudentDB = new StudentSchema(dataWithoutId);
    await StudentDB.save();

    // Update the donated status in RegistrationSchema
    const { Rollno, EventDate } = studentData;
    const updatedRegistration = await RegisterSchema.findOneAndUpdate(
      { rollno: Rollno, EventDate },
      { donated: true },
      { new: true }
    );

    if (!updatedRegistration) {
      console.warn('No matching registration found to update');
    } else {
      console.log('Updated registration:', updatedRegistration);
    }

    // Emit live counts update
    try {
      emitLiveCountsUpdate(req, studentData.EventDate);
    } catch (emitError) {
      console.warn('Failed to emit live counts update:', emitError);
    }

    return res.status(200).json('Student data stored and registration updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(201).json({ message: 'Duplicate entry detected', details: error.keyValue });
    }
    console.error('Error in StudentHandler:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};







const StaffHandler = async (req, res) => {
  console.log('Staff handler processing...');
  const staffData = req.body;

  try {
    // Check for existing staff entry to avoid duplicates
    const existingStaff = await StaffSchema.findOne({ EmployeeId: staffData.EmployeeId, EventDate: staffData.EventDate });
    // console.log(existingStaff);
    if (existingStaff) {
      return res.status(201).json({ message: 'Staff member already submitted data', staff: existingStaff });
    }

    // Remove _id if present to let MongoDB generate a unique ID
    const { _id, ...dataWithoutId } = staffData;
    const StaffDB = new StaffSchema(dataWithoutId);
    await StaffDB.save();

    // Emit the event to update live counts
    emitLiveCountsUpdate(req, staffData.EventDate);

    return res.status(200).json('Staff data stored successfully');
  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(201).json({ message: 'Duplicate entry detected', details: error.keyValue });
    }
    console.error('Error in StaffHandler:', error);
    return res.status(500).json(error);
  }
};



const ManagementAndGuestHandler = async (req, res) => {
  console.log('Management and Guest handler processing...');
  const managementAndGuestData = req.body;

  try {
    // Check for existing management/guest entry to avoid duplicates
    const existingEntry = await ManagementAndGuestSchema.findOne({
      Name: managementAndGuestData.Name,
      EventDate: managementAndGuestData.EventDate
    });
    if (existingEntry) {
      return res.status(201).json({ message: 'Management/Guest already submitted data', data: existingEntry });
    }

    // Remove _id if present to let MongoDB generate a unique ID
    const { _id, ...dataWithoutId } = managementAndGuestData;
    const ManagementAndGuestDB = new ManagementAndGuestSchema(dataWithoutId);
    await ManagementAndGuestDB.save();

    // Emit the event to update live counts
    emitLiveCountsUpdate(req, managementAndGuestData.EventDate);

    return res.status(200).json('Management and guest data stored successfully');
  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(201).json({ message: 'Duplicate entry detected', details: error.keyValue });
    }
    console.error('Error in ManagementAndGuestHandler:', error);
    return res.status(500).json(error);
  }
};


const RegisterHandler = async (req, res) => {
  console.log('Register handler processing...');

  const { RollNumber, PhoneNumber, EventDate } = req.body;
  console.log('Request Data:', req.body);

  try {
    // Check if the student is already registered for the given date
    const existingRegistration = await RegisterSchema.findOne({
      rollno: RollNumber,  // Ensure field names match schema
      EventDate: EventDate // Ensure date format matches
    });

    console.log('Existing Registration:', existingRegistration);
    if (existingRegistration) {
      return res.status(201).json('Student is already registered for this event date');
    }

    // // Fetch student data
    // const RegisterData = await axios.get(
      
    //   `http://172.7.182.2:5001/api/get-Student-Data/${RollNumber}`
    // );

    

    // console.log('Student Data:', RegisterData.data);

    // if (!RegisterData.data.length) {
    //   return res.status(404).json('Student data not found');
    // }

    // if (RegisterData.data[0].bloodgroup === '-') {
    //   RegisterData.data[0].bloodgroup = 'Unknown';
    // }

    // delete RegisterData.data[0]._id;

    // RegisterData.data[0].rollno = RegisterData.data[0].studentRoll;
    // RegisterData.data[0].emailid = RegisterData.data[0].email;
    // RegisterData.data[0].studentname = RegisterData.data[0].studentName;


    // RegisterData.data[0].EventDate = EventDate;
    // RegisterData.data[0].mobilenumber = PhoneNumber;
    // RegisterData.data[0].donated = false;





    // // Save the new registration
    // const RegisterDB = new RegisterSchema(RegisterData.data[0]);
    // const response = await RegisterDB.save();

  const studentApidata = await axios.get(
      
    `https://adityauniversity.in/latecomersbackendapi/get-Student-Data/${RollNumber}`
    );
  
  const RegistrationSchemaData = {studentname: "",
  rollno: "",
  mobilenumber: "",
  emailid: "",
  college: "",
  collegeCode: "",
  branch: "",
  gender: "",
  EventDate: "",
  donated: false
   }
  RegistrationSchemaData.rollno = RollNumber 
  RegistrationSchemaData.mobilenumber = PhoneNumber
  RegistrationSchemaData.EventDate = EventDate

   // This details may get from external API after 
  
  RegistrationSchemaData.studentname= studentApidata.data[0].studentName
  RegistrationSchemaData.emailid=  studentApidata.data[0].email ?  studentApidata.data[0].email:`${RollNumber}@adityauniversity.in`
  RegistrationSchemaData.college= studentApidata.data[0].college
  RegistrationSchemaData.collegeCode= studentApidata.data[0].collegeCode
  RegistrationSchemaData.branch= studentApidata.data[0].branch
  RegistrationSchemaData.gender= studentApidata.data[0].gender

 


   const RegisterDB = new RegisterSchema(RegistrationSchemaData);
   const response = await RegisterDB.save();


    console.log('Registration Saved:', response);

    // Emit the event to update live counts
    emitLiveCountsUpdate(req, EventDate);

    return res.status(200).json('Register data stored successfully');
  } catch (error) {
    console.error('Error in Register Handler:', error);
    return res.status(500).json(error);
  }
};



module.exports = {
  StudentHandler,
  StaffHandler,
  ManagementAndGuestHandler,
  RegisterHandler,
};