const axios = require("axios");
const moment = require("moment");

const StudentSchema = require("../models/StudentSchema");
const StaffSchema = require("../models/StaffSchema");
const managementandguest = require("../models/managementandguest");

const RegisterSchema = require("../models/RegistrationSchema");
const VolunteerSchema = require("../models/VolunteerSchema");

const EventSchema = require("../models/EventSchema");
const GallerySchema = require("../models/GallerySchema");

/* BloodGroupHandler,
    DonorCountHandler,
    EventsDataHandler,
    GalleryDataHandler,
    GenderCountHandler,
    LiveCountHandler,
    OverviewCountsHandler,
    VolunteersDataHandler
*/

// const BloodGroupHandler = async (req, res) => {
//   try {
//     const { College, EventDate, } = req.query;

//     //const toDate = new Date("2025-01-28");
//     //toDate.setUTCHours(23, 59, 59, 999);
//     const toDate = new Date()
//     const fromDate = new Date("2025-01-28");
//     fromDate.setUTCHours(0, 0, 0, 0);

//     const matchStage = {};
//     if (College) {
//       matchStage.College = College;
//     } else if (EventDate) {
//       matchStage.EventDate = { $gte: fromDate, $lt: toDate };
//     }

//     const aggregationPipeline = [];
//     if (Object.keys(matchStage).length > 0) {
//       aggregationPipeline.push({ $match: matchStage });
//     }
//     aggregationPipeline.push({
//       $group: {
//         _id: "$BloodGroup",
//         donorCount: { $sum: 1 },
//       },
//     });

//     const [studentCount, staffCount, managementCount] = await Promise.all([
//       StudentSchema.aggregate(aggregationPipeline),
//       StaffSchema.aggregate(aggregationPipeline),
//       managementandguest.aggregate(aggregationPipeline),
//     ]);

//     const mergedCounts = {};
//     const addCounts = (counts) => {
//       counts.forEach(({ _id, donorCount }) => {
//         if (!mergedCounts[_id]) {
//           mergedCounts[_id] = 0;
//         }
//         mergedCounts[_id] += donorCount;
//       });
//     };

//     addCounts(studentCount);
//     addCounts(staffCount);
//     addCounts(managementCount);

//     // Sort the keys of the mergedCounts object
//     const sortedMergedCounts = Object.keys(mergedCounts)
//       .sort()
//       .reduce((acc, key) => {
//         acc[key] = mergedCounts[key];
//         return acc;
//       }, {});

//     // console.log(sortedMergedCounts);
//     return res.status(200).json(sortedMergedCounts);
//   } catch (error) {
//     console.error(error);
//     return res.status(404).json({ message: "Server Error" });
//   }
// };

const BloodGroupHandler = async (req, res) => {
  try {
    const { College, EventDate, collegeCode } = req.query;

    //const toDate = new Date("2025-01-28");
    //toDate.setUTCHours(23, 59, 59, 999);
    const toDate = new Date();
    const fromDate = new Date("2025-01-28");
    fromDate.setUTCHours(0, 0, 0, 0);

    const matchStage = {};
    if (College) {
      matchStage.College = College;
    }
    if (EventDate) {
      matchStage.EventDate = { $gte: fromDate, $lt: toDate };
    }
    if (collegeCode) {
      matchStage.collegeCode = collegeCode;
      if (["Guest", "Management"].includes(collegeCode)) {
        delete matchStage.collegeCode;
        matchStage.TypeOfDonor = collegeCode;
      }
    }

    const aggregationPipeline = [];
    if (Object.keys(matchStage).length > 0) {
      aggregationPipeline.push({ $match: matchStage });
    }
    aggregationPipeline.push({
      $group: {
        _id: "$BloodGroup",
        donorCount: { $sum: 1 },
      },
    });

    const [studentCount, staffCount, managementCount] = await Promise.all([
      StudentSchema.aggregate(aggregationPipeline),
      StaffSchema.aggregate(aggregationPipeline),
      managementandguest.aggregate(aggregationPipeline),
    ]);

    const mergedCounts = {};
    const addCounts = (counts) => {
      counts.forEach(({ _id, donorCount }) => {
        if (!mergedCounts[_id]) {
          mergedCounts[_id] = 0;
        }
        mergedCounts[_id] += donorCount;
      });
    };

    addCounts(studentCount);
    addCounts(staffCount);
    addCounts(managementCount);

    // Sort the keys of the mergedCounts object
    const sortedMergedCounts = Object.keys(mergedCounts)
      .sort()
      .reduce((acc, key) => {
        acc[key] = mergedCounts[key];
        return acc;
      }, {});

    // console.log(sortedMergedCounts);
    return res.status(200).json(sortedMergedCounts);
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const DonorCountHandler = async (req, res) => {
  
  try {
    const { collegeCode, EventDate, Department } = req.query;

    const toDate = new Date();
    toDate.setUTCHours(23, 59, 59, 999);
    const fromDate = new Date("2025-01-28");
    fromDate.setUTCHours(0, 0, 0, 0);

    const isManagementOrGuest =
      collegeCode === "Management" || collegeCode === "Guest";
    let studentCount = [];
    let staffCount = [];

    if (!isManagementOrGuest) {
      const matchStage = {};

      if (collegeCode) {
        matchStage.collegeCode = collegeCode;
      }

      if (EventDate) {
        matchStage.EventDate = { $gte: fromDate, $lt: toDate };
      }

      const aggregationPipeline = [];
      if (Object.keys(matchStage).length > 0) {
        aggregationPipeline.push({ $match: matchStage });
      }

      let groupStage;
      
      if (Department) {
        groupStage = {
          _id: "$Department",
          donorCount: { $sum: 1 },
        };
      } else if (!collegeCode) {
        groupStage = {
          _id: "$collegeCode",
          donorCount: { $sum: 1 },
        };
      } else {
        groupStage = {
          _id: "$Department",
          donorCount: { $sum: 1 },
        };
      }
      
      aggregationPipeline.push({ $group: groupStage });

      studentCount = await StudentSchema.aggregate(aggregationPipeline);
      staffCount = await StaffSchema.aggregate(aggregationPipeline);
    }

    let managementCount = [];

    if (!Department && ( !collegeCode || isManagementOrGuest )) {
      const managementMatch = {};

      if (EventDate) {
        managementMatch.EventDate = { $gte: fromDate, $lt: toDate };
      }

      if (isManagementOrGuest) {
        managementMatch.TypeOfDonor = collegeCode;
      }

      const managementPipeline = [
        { $match: managementMatch },
        {
          $group: {
            _id: "$TypeOfDonor",
            donorCount: { $sum: 1 },
          },
        },
      ];

      managementCount = await managementandguest.aggregate(
        managementPipeline
      );
    }
    const mergedCounts = {};

    const addCounts = (counts) => {
      counts.forEach(({ _id, donorCount }) => {
        mergedCounts[_id] = (mergedCounts[_id] || 0) + donorCount;
      });
    };

    addCounts(studentCount);
    addCounts(staffCount);
    addCounts(managementCount);

    if (EventDate) {
      return res.status(200).json({
        xAxis: [
          {
            scaleType: "band",
            data: Object.keys(mergedCounts),
          },
        ],
        series: [
          {
            data: Object.values(mergedCounts),
          },
        ],
      });
    }

    return res.status(200).json(mergedCounts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// const DonorCountHandler = async (req, res) => {
//   try {
//     const { collegeCode, EventDate, Department } = req.query;
//     //const toDate = new Date("2025-01-28");
//     const toDate = new Date()
//     toDate.setUTCHours(23, 59, 59, 999);
//     const fromDate = new Date("2025-01-28");
//     fromDate.setUTCHours(0, 0, 0, 0);

//     const matchStage = {};
//     if (collegeCode) {
//       matchStage.collegeCode = collegeCode;
//     } else if (EventDate) {
//       matchStage.EventDate = { $gte: fromDate, $lt: toDate };
//     }

//     const aggregationPipeline = [];
//     if (Object.keys(matchStage).length > 0) {
//       aggregationPipeline.push({ $match: matchStage });
//     }

//     let groupStage;
//     if (Department) {
//       groupStage = {
//         _id: "$Department", // Group by Department
//         donorCount: { $sum: 1 },
//       };
//     } else if (!collegeCode) {
//       groupStage = {
//         _id: "$collegeCode", // Group by collegeCode
//         donorCount: { $sum: 1 },
//       };
//     } else {
//       groupStage = {
//         _id: "$Department", // Group by Department when filtering by collegeCode
//         donorCount: { $sum: 1 },
//       };
//     }

//     aggregationPipeline.push({ $group: groupStage });

//     const studentCount = await StudentSchema.aggregate(aggregationPipeline);
//     const staffCount = await StaffSchema.aggregate(aggregationPipeline);

//     // For management and guest, we can only include them when not filtering by Department or collegeCode
//     let managementCount = [];

//     const managementPipeline = [
//       { $match: { EventDate: { $gte: fromDate, $lt: toDate } } },
//       {
//         $group: {
//           _id: "$TypeOfDonor", // Group by TypeOfDonor for management
//           donorCount: { $sum: 1 },
//         },
//       },
//     ];
//     managementCount = await managementandguest.aggregate(managementPipeline);

//     if (!Department && !collegeCode && EventDate) {
//       // For management and guest, we'll group by TypeOfDonor since they don't have Department
//       const managementPipeline = [
//         { $match: { EventDate: { $gte: fromDate, $lt: toDate } } },
//         {
//           $group: {
//             _id: "$TypeOfDonor", // Group by TypeOfDonor for management
//             donorCount: { $sum: 1 },
//           },
//         },
//       ];
//       managementCount = await managementandguest.aggregate(managementPipeline);
//     }

//     const mergedCounts = {};
//     const addCounts = (counts) => {
//       counts.forEach(({ _id, donorCount }) => {
//         if (!mergedCounts[_id]) {
//           mergedCounts[_id] = 0;
//         }
//         mergedCounts[_id] += donorCount;
//       });
//     };

//     addCounts(studentCount);
//     addCounts(staffCount);
//     addCounts(managementCount);

//     const sortedMergedCounts = Object.keys(mergedCounts)
//       .sort()
//       .reduce((acc, key) => {
//         acc[key] = mergedCounts[key];
//         return acc;
//       }, {});

//     // Transform the data into the required format if EventDate is provided
//     if (EventDate) {
//       const formattedData = [
//         {
//           scaleType: "band",
//           data: Object.keys(sortedMergedCounts), // Extract keys as data (x-axis labels)
//         },
//       ];

//       const seriesData = Object.values(sortedMergedCounts); // Extract values (y-axis data)

//       return res.status(200).json({
//         xAxis: formattedData,
//         series: [{ data: seriesData }],
//       });
//     }

//     // Default response for other cases
//     return res.status(200).json(sortedMergedCounts);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

// const DonorCountHandler = async (req, res) => {
//   try {
//     const { collegeCode, EventDate, Department } = req.query;

//     const toDate = new Date();
//     const fromDate = new Date("2025-01-28");
//     fromDate.setUTCHours(0, 0, 0, 0);

//     const matchStage = {};
//     if (collegeCode && !["Guest", "Management"].includes(collegeCode)) {
//       matchStage.collegeCode = collegeCode;
//     }

//     if (EventDate) {
//       matchStage.EventDate = { $gte: fromDate, $lt: toDate };
//     }

//     const aggregationPipeline = [];
//     if (Object.keys(matchStage).length > 0) {
//       aggregationPipeline.push({ $match: matchStage });
//     }

//     let groupStage;
//     if (Department) {
//       groupStage = { _id: "$Department", donorCount: { $sum: 1 } };
//     } else {
//       groupStage = { _id: "$collegeCode", donorCount: { $sum: 1 } };
//     }

//     aggregationPipeline.push({ $group: groupStage });

//     let studentCount = [];
//     let staffCount = [];
//     let managementCount = [];

//     //  CASE 1: No collegeCode → ALL DATABASES
//     if (!collegeCode) {
//       studentCount = await StudentSchema.aggregate(aggregationPipeline);
//       staffCount = await StaffSchema.aggregate(aggregationPipeline);

//       managementCount = await managementandguest.aggregate([
//         {
//           $match: EventDate
//             ? { EventDate: { $gte: fromDate, $lt: toDate } }
//             : {},
//         },
//         {
//           $group: {
//             _id: "$TypeOfDonor",
//             donorCount: { $sum: 1 },
//           },
//         },
//       ]);
//     }

//     //  CASE 2: Guest or Management ONLY
//     else if (["Guest", "Management"].includes(collegeCode)) {
//       managementCount = await managementandguest.aggregate([
//         {
//           $match: {
//             TypeOfDonor: collegeCode,
//             ...(EventDate && { EventDate: { $gte: fromDate, $lt: toDate } }),
//           },
//         },
//         {
//           $group: {
//             _id: "$TypeOfDonor",
//             donorCount: { $sum: 1 },
//           },
//         },
//       ]);
//     }

//     //  CASE 3: Any OTHER collegeCode → Student + Staff ONLY
//     else {
//       studentCount = await StudentSchema.aggregate(aggregationPipeline);
//       staffCount = await StaffSchema.aggregate(aggregationPipeline);
//       //  NO managementandguest here
//     }

//     //  MERGE COUNTS
//     const mergedCounts = {};

//     const addCounts = (counts = []) => {
//       counts.forEach(({ _id, donorCount }) => {
//         mergedCounts[_id] = (mergedCounts[_id] || 0) + donorCount;
//       });
//     };

//     addCounts(studentCount);
//     addCounts(staffCount);
//     addCounts(managementCount);

//     // EVENT DATE FORMAT RESPONSE
//     if (EventDate) {
//       return res.status(200).json({
//         xAxis: [{ scaleType: "band", data: Object.keys(mergedCounts) }],
//         series: [{ data: Object.values(mergedCounts) }],
//       });
//     }

//     return res.status(200).json(mergedCounts);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

// --------------------------------------------------------------------------------------------------------------------------------

const GetCollegeCodeMapping = async (req, res) => {
  try {
    // Aggregation pipelines for both StudentSchema and StaffSchema
    const studentColleges = StudentSchema.aggregate([
      {
        $group: {
          _id: "$collegeCode",
          college: { $first: "$College" },
        },
      },
    ]);

    const staffColleges = StaffSchema.aggregate([
      {
        $group: {
          _id: "$collegeCode",
          college: { $first: "$College" },
        },
      },
    ]);

    // Execute both aggregations concurrently
    const [studentResults, staffResults] = await Promise.all([
      studentColleges,
      staffColleges,
    ]);

    // Combine results from both schemas
    const combinedResults = [...studentResults, ...staffResults];

    // Reduce to a single mapping object to handle duplicates
    var result = combinedResults.reduce((acc, item) => {
      if (!acc[item._id]) {
        acc[item._id] = item.college;
      }
      return acc;
    }, {});

    result[""] = "All Colleges";
    // console.log(result);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const EventsDataHandler = async (req, res) => {
  try {
    const EventsData = await EventSchema.find().sort({ Date: -1 }); // Sorts by date in descending order

    return res.status(200).json(EventsData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const GalleryDataHandler = async (req, res) => {
  try {
    const GallerysData = await GallerySchema.find();

    return res.status(200).json(GallerysData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const GenderCountHandler = async (req, res) => {
  try {
    const { College, EventDate, collegeCode } = req.query;

    //const toDate = new Date("2025-01-28");
    //toDate.setUTCHours(23, 59, 59, 999);
    const toDate = new Date();
    const fromDate = new Date("2025-01-28");
    fromDate.setUTCHours(0, 0, 0, 0);

    const matchStage = {};

    if (College) {
      matchStage.College = College;
    }
    if (EventDate) {
      matchStage.EventDate = { $gte: fromDate, $lte: toDate };
    }
    if (collegeCode) {
      matchStage.collegeCode = collegeCode;
      if (["Guest", "Management"].includes(collegeCode)) {
        delete matchStage.collegeCode;
        matchStage.TypeOfDonor = collegeCode;
      }
    }

    //console.log("college code", collegeCode);

    const aggregationPipeline = [];

    if (Object.keys(matchStage).length > 0) {
      aggregationPipeline.push({ $match: matchStage });
    }
    aggregationPipeline.push({
      $group: {
        _id: "$Gender",
        donorCount: { $sum: 1 },
      },
    });

    const studentCount = await StudentSchema.aggregate(aggregationPipeline);
    const staffCount = await StaffSchema.aggregate(aggregationPipeline);
    const managementCount = await managementandguest.aggregate(
      aggregationPipeline
    );

    const mergedCounts = {};
    const addCounts = (counts) => {
      counts.forEach(({ _id, donorCount }) => {
        if (!mergedCounts[_id]) {
          mergedCounts[_id] = 0;
        }
        mergedCounts[_id] += donorCount;
      });
    };

    addCounts(studentCount);
    addCounts(staffCount);
    addCounts(managementCount);

    if (EventDate) {
      const data = Object.entries(mergedCounts).map(
        ([gender, count], index) => ({
          id: index,
          value: count,
          label: `${gender}: ${count}`,
        })
      );

      data.collegeCode = collegeCode;
      return res.status(200).json({ data });
    }

    return res.status(200).json(mergedCounts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const LiveCountHandler = async (req, res) => {
  try {
    const { Venue } = req.query;

    // Define the start and end of the current day in UTC
    const toDate = new Date("2025-01-28");
    toDate.setUTCHours(23, 59, 59, 999);
    const fromDate = new Date("2025-01-28");
    fromDate.setUTCHours(0, 0, 0, 0);

    // console.log("From Date:", fromDate, "To Date:", toDate);

    // Match stage for the aggregation
    const matchStage = {
      EventDate: { $gte: fromDate, $lt: toDate }, // Match for the entire day
    };

    if (Venue) {
      matchStage.Venue = Venue;
    }

    // Build the aggregation pipeline for students
    const studentAggregation = [
      { $match: matchStage },
      {
        $group: {
          _id: "$Department", // Group by Department
          donorCount: { $sum: 1 }, // Count the number of donors
        },
      },
    ];

    // Fetch counts for students
    const studentCount = await StudentSchema.aggregate(studentAggregation);
    // console.log("Student Count:", studentCount);

    // Merge the counts
    const mergedCounts = {};
    studentCount.forEach(({ _id, donorCount }) => {
      mergedCounts[_id] = donorCount || 0;
    });

    // Fetch registered data for the same event date
    const registeredAggregation = [
      { $match: { EventDate: { $gte: fromDate, $lt: toDate } } },
      {
        $group: {
          _id: "$branch", // Group by branch
          count: { $sum: 1 }, // Count the registered students
        },
      },
    ];

    const registeredData = await RegisterSchema.aggregate(
      registeredAggregation
    );
    // console.log("Register Count:", registeredData);

    // Map registered data for quick access
    const registeredMap = {};
    registeredData.forEach(({ _id, count }) => {
      registeredMap[_id] = count || 0;
    });

    // Combine all department data
    const allDepartments = [
      ...new Set([...Object.keys(mergedCounts), ...Object.keys(registeredMap)]),
    ];

    // Prepare final response data
    const uData = [];
    const pData = [];
    const xLabels = [];

    allDepartments.forEach((department) => {
      uData.push(mergedCounts[department] || 0); // Donor count
      pData.push(registeredMap[department] || 0); // Registered count
      xLabels.push(department); // Department name
    });

    // Return the response
    return res.status(200).json({ uData, pData, xLabels });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

// It gives
// No.of donors
// No. staff, students, Other

// UnitsCollected, NumberOfDonors, NumberOfBloodCamps

const OverviewCountsHandler = async (req, res) => {
  try {
    const studentsCount = await StudentSchema.distinct("_id").countDocuments();
    const staffCount = await StaffSchema.distinct("_id").countDocuments();
    const guestCount = await managementandguest
      .distinct("_id")
      .countDocuments();
    const registeredCount = await RegisterSchema.distinct(
      "_id"
    ).countDocuments();

    const totalStudentCount = await StudentSchema.countDocuments();
    const totalStaffCount = await StaffSchema.countDocuments();
    const totalGuestCount = await managementandguest.countDocuments();

    const NumberOfDonors = studentsCount + staffCount + guestCount;
    const UnitsCollected =
      totalStudentCount + totalStaffCount + totalGuestCount;

    const studentEventDates = await StudentSchema.distinct("Venue");
    const staffEventDates = await StaffSchema.distinct("Venue");
    const managementEventDates = await managementandguest.distinct("Venue");

    const allEventDates = new Set([
      ...studentEventDates,
      ...staffEventDates,
      ...managementEventDates,
    ]);
    const NumberOfBloodCamps = allEventDates.size;

    const NumberOfVolunteers = await VolunteerSchema.countDocuments();

    const result = {
      StudentsCount: studentsCount,
      StaffCount: staffCount,
      GuestCount: guestCount,
      NumberOfDonors: NumberOfDonors,
      UnitsCollected: UnitsCollected,
      NumberOfBloodCamps: NumberOfBloodCamps,
      NumberOfVolunteers: NumberOfVolunteers,
      RegisteredCount: registeredCount,
    };
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const VolunteersDataHandler = async (req, res) => {
  try {
    const VolunteersData = await VolunteerSchema.find();

    return res.status(200).json(VolunteersData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const RegisteredDataHandler = async (req, res) => {
  try {
    const RegisteredData = await RegisterSchema.find();

    // console.log(RegisteredData);
    return res.status(200).json(RegisteredData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// const GetDonatedData = async (req, res) => {
//   try {
//     const { eventDate } = req.query; // EventDate will be passed as a query parameter
//     // console.log(`Received EventDate: ${eventDate}`);

//     if (!eventDate) {
//       return res.status(400).json({ message: "EventDate is required" });
//     }

//     // Parse EventDate to ensure proper format
//     const parsedEventDate = new Date(eventDate);

//     if (isNaN(parsedEventDate)) {
//       return res.status(400).json({
//         message: "Invalid EventDate format. Use YYYY-MM-DD or ISO format.",
//       });
//     }

//     // console.log(`Parsed EventDate: ${parsedEventDate}`);

//     // Define start and end of the day to query a full day
//     const startOfDay = new Date(parsedEventDate.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(parsedEventDate.setHours(23, 59, 59, 999));

//     // Fetch data from all schemas based on the EventDate
//     const staffData = await StaffSchema.find({
//       EventDate: { $gte: startOfDay, $lt: endOfDay },
//     }).select("Name MobileNumber College Department Venue Gender EmployeeId BloodGroup");

//     const studentData = await StudentSchema.find({
//       EventDate: { $gte: startOfDay, $lt: endOfDay },
//     }).select("Name MobileNumber College Department Venue Gender Rollno BloodGroup");

//     const managementAndGuestData = await managementandguest
//       .find({
//         EventDate: { $gte: startOfDay, $lt: endOfDay },
//       })
//       .select("Name TypeOfDonor MobileNumber Venue Gender BloodGroup");

//     // Map data to a uniform structure
//     const formattedStaffData = staffData.map((staff) => ({
//       Name: staff.Name,
//       Type: "Staff",
//       Id: staff.EmployeeId, // Use EmployeeId as Id
//       MobileNumber: staff.MobileNumber,
//       College: staff.College,
//       Department: staff.Department,
//       BloodGroup: staff.BloodGroup,
//       Venue: staff.Venue,
//       Gender: staff.Gender,
//     }));

//     const formattedStudentData = studentData.map((student) => ({
//       Name: student.Name,
//       Type: "Student",
//       Id: student.Rollno, // Use Rollno as Id
//       MobileNumber: student.MobileNumber,
//       College: student.College,
//       Department: student.Department,
//       BloodGroup: student.BloodGroup,
//       Venue: student.Venue,
//       Gender: student.Gender,
//     }));

//     const formattedManagementAndGuestData = managementAndGuestData.map(
//       (mg) => ({
//         Name: mg.Name,
//         Type: mg.TypeOfDonor, // Use TypeOfDonor as Type
//         Id: null, // No unique identifier for M&G
//         MobileNumber: mg.MobileNumber,
//         College: null, // No college field in M&G schema
//         Department: null, // No department field in M&G schema
//         BloodGroup: mg.BloodGroup,
//         Venue: mg.Venue,
//         Gender: mg.Gender,
//       })
//     );

//     // Combine all data into a single array
//     const allData = [
//       ...formattedStaffData,
//       ...formattedStudentData,
//       ...formattedManagementAndGuestData,
//     ];

//     // console.log(`Total records found: ${allData.length}`);
//     res.status(200).json(allData);
//   } catch (error) {
//     console.error("Error fetching donated data:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

// --------------------------------------------------------------------------------------------------------------------------------

// const DonorDataHandler = async (req, res) => {
//     try {
//         const RegisteredData = await RegisterSchema.find();

//         return res.status(200).json(RegisteredData);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server Error' });
//     }
// };

// --------------------------------------------------------------------------------------------------------------------------------

// const StudentDonors = async (req, res) => {
//     try {
//         const studentsData = StudentSchema.find();
//         return res.status(200).json(studentsData);
//     }

//     catch (error) {
//         console.log(error);
//         return res.status(500).json({message: "Error occcurred..."});
//     }
// }

// --------------------------------------------------------------------------------------------------------------------------------

// const StaffDonors = async (req, res) => {
//     try {
//         const staffData = StaffSchema.find();
//         return res.status(200).json(staffData);
//     }

//     catch (error) {
//         console.log(error);
//         return res.status(500).json({message: "Error occcurred..."});
//     }
// }

// --------------------------------------------------------------------------------------------------------------------------------

const GetDonatedData = async (req, res) => {
  try {
    const { eventDate, type, bloodGroup } = req.query;
    

    if (!eventDate) {
      return res.status(400).json({ message: "EventDate is required" });
    }

    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.status(400).json({
        message: "Invalid EventDate format. Use YYYY-MM-DD",
      });
    }

    const startOfDay = new Date(parsedEventDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedEventDate.setHours(23, 59, 59, 999));

    //  Common date filter
    const baseFilter = {
      EventDate: { $gte: startOfDay, $lt: endOfDay },
    };

    if (bloodGroup) {
      baseFilter.BloodGroup = bloodGroup;
    }

    let staffData = [];
    let studentData = [];
    let managementAndGuestData = [];

    //  Student
    if (!type || type === "student") {
      studentData = await StudentSchema.find(baseFilter).select(
        "Name MobileNumber College Department Venue Gender Rollno BloodGroup Address"
      );
    }

    //  Staff
    if (!type || type === "staff") {
      staffData = await StaffSchema.find(baseFilter).select(
        "Name MobileNumber College Department Venue Gender EmployeeId BloodGroup Address"
      );
    }

    //  Management & Guest 
    if (!type || type === "managementAndGuest" ) {
      managementAndGuestData = await managementandguest
        .find(baseFilter)
        .select("Name TypeOfDonor MobileNumber Venue Gender BloodGroup Address");
    }
    
    //  Normalize data
    const formattedStudentData = studentData.map((student) => ({
      Name: student.Name,
      Type: "Student",
      Id: student.Rollno,
      MobileNumber: student.MobileNumber,
      College: student.College,
      Department: student.Department,
      BloodGroup: student.BloodGroup,
      Venue: student.Venue,
      Gender: student.Gender,
      Address: student.Address,
    }));

    const formattedStaffData = staffData.map((staff) => ({
      Name: staff.Name,
      Type: "Staff",
      Id: staff.EmployeeId,
      MobileNumber: staff.MobileNumber,
      College: staff.College,
      Department: staff.Department,
      BloodGroup: staff.BloodGroup,
      Venue: staff.Venue,
      Gender: staff.Gender,
      Address: staff.Address,
    }));

    const formattedManagementAndGuestData = managementAndGuestData.map(
      (mg) => ({
        Name: mg.Name,
        Type: mg.TypeOfDonor,
        Id: null,
        MobileNumber: mg.MobileNumber,
        College: null,
        Department: null,
        BloodGroup: mg.BloodGroup,
        Venue: mg.Venue,
        Gender: mg.Gender,
        Address: mg.Address,
      })
    );

    const allData = [
      ...formattedStudentData,
      ...formattedStaffData,
      ...formattedManagementAndGuestData,
    ];

    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching donated data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const registeredStudent = async (req, res) => {
  const { RollNumber } = req.body;

  try {
    // Check if the student exists and update the `donated` field to true
    const student = await RegisterSchema.findOneAndUpdate(
      { RollNumber },
      { $set: { donated: true } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not registered" });
    } else return res.status(200).json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the student" });
  }
};

const student = async (req, res) => {
  const RollNumber = req.body.RollNumber;
  const mobilenumber = req.body.PhoneNumber;

  if (!RollNumber) {
    return res.status(400).json({ message: "RollNumber is required" });
  }

  try {
    // Check for student in the local database
    const student = await RegisterSchema.findOne({ RollNumber });
    if (student) {
      // console.log("Student found locally:", student);
      return res.status(200).json(student);
    } else {
      // Fetch student details from external API if not found locally
      const response = await axios.post(
        "https://adityauniversity.in/latecomersbackendapi/get-Studentss",
        { roll: RollNumber }
      );

      // Ensure external API response contains data
      if (response.data && response.data[0]) {
        const apiData = response.data[0];

        // Map API data to your schema
        const formattedData = {
          Name: apiData.studentName,
          Rollno: apiData.studentRoll,
          MobileNumber:
            mobilenumber || apiData.studentMobile || "Not Available",
          Email: apiData.email || "Not Available",
          College: apiData.college || "Not Available",
          Department: apiData.branch || "Not Available",
          Gender: apiData.gender,
          Year: apiData.passedOutYear,
        };

        // console.log("Formatted Data:", formattedData);

        return res.status(200).json(formattedData);
      } else {
        return res
          .status(404)
          .json({ message: "Student not found in external API" });
      }
    }
  } catch (error) {
    console.error("Error retrieving student:", error.message);
    return res.status(500).json({
      message: "An error occurred while fetching student details",
      error,
    });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const getUpcomingEvent = async (req, res) => {
  try {
    // Normalize currentDate to midnight (UTC)
    const currentDate = new Date("2025-01-28");
    currentDate.setUTCHours(0, 0, 0, 0);

    // console.log("Normalized Current Date:", currentDate);

    const upcomingEvent = await EventSchema.find({
      Date: { $gte: currentDate },
    })
      .sort({ Date: 1 })
      .limit(1);

    // console.log("Upcoming Event:", upcomingEvent);

    if (!upcomingEvent || upcomingEvent.length === 0) {
      return res.status(404).json({ message: "No upcoming events found." });
    }

    res.status(200).json(upcomingEvent[0]);
  } catch (error) {
    console.error("Error fetching upcoming event:", error);
    res.status(500).json({
      message: "An error occurred while fetching the upcoming event.",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

const getVenues = async (req, res) => {
  try {
    const date = req.body.date;

    // console.log(date);

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const event = await EventSchema.findOne({ Date: date });

    if (!event) {
      return res
        .status(404)
        .json({ message: "No events found for the specified date" });
    }

    // console.log(event.Colleges);
    res.status(200).json(event.Colleges);
  } catch (error) {
    console.error("Error in getVenues:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const VenueCountHandler = async (req, res) => {
  try {
    const { collegeCode, EventDate, Department } = req.query;
    //const toDate = new Date("2025-01-28");
    //toDate.setUTCHours(23, 59, 59, 999);
    const toDate = new Date();
    const fromDate = new Date("2025-01-28");
    fromDate.setUTCHours(0, 0, 0, 0);

    const matchStage = {};
    if (collegeCode) {
      matchStage.collegeCode = collegeCode;
    }
    if (Department && Department !== "YES") {
      matchStage.Department = Department;
    }
    if (EventDate) {
      matchStage.EventDate = { $gte: fromDate, $lt: toDate };
    }

    const aggregationPipeline = [];
    if (Object.keys(matchStage).length > 0) {
      aggregationPipeline.push({ $match: matchStage });
    }

    const groupStage = {
      _id: "$Venue", // Group by Venue
      donorCount: { $sum: 1 },
    };

    aggregationPipeline.push({ $group: groupStage });

    // Get counts from all donor types
    const studentCount = await StudentSchema.aggregate(aggregationPipeline);
    const staffCount = await StaffSchema.aggregate(aggregationPipeline);
    const managementCount = await managementandguest.aggregate(
      aggregationPipeline
    );

    const mergedCounts = {};
    const addCounts = (counts) => {
      counts.forEach(({ _id, donorCount }) => {
        if (!mergedCounts[_id]) {
          mergedCounts[_id] = 0;
        }
        mergedCounts[_id] += donorCount;
      });
    };

    addCounts(studentCount);
    addCounts(staffCount);
    addCounts(managementCount);

    const sortedMergedCounts = Object.keys(mergedCounts)
      .sort()
      .reduce((acc, key) => {
        acc[key] = mergedCounts[key];
        return acc;
      }, {});

    const xAxisData = Object.keys(sortedMergedCounts);
    const seriesData = Object.values(sortedMergedCounts);

    // Transform the response into the desired format
    const responseData = {
      xAxis: [
        {
          scaleType: "band",
          data: xAxisData,
        },
      ],
      series: [
        {
          data: seriesData,
        },
      ],
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// --------------------------------------------------------------------------------------------------------------------------------

module.exports = {
  VenueCountHandler,
  BloodGroupHandler,
  DonorCountHandler,
  EventsDataHandler,
  GalleryDataHandler,
  GenderCountHandler,
  LiveCountHandler,
  OverviewCountsHandler,
  VolunteersDataHandler,
  RegisteredDataHandler,
  registeredStudent,
  student,
  getUpcomingEvent,
  getVenues,
  GetCollegeCodeMapping,
  GetDonatedData,

  // RegisteredPeople,
  // StaffDonors,
  // StudentDonors,
};