const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const bcrypt = require("bcrypt");
const cors = require("cors");
const { format } = require("date-fns-tz");
//Middleware to parse JSon bodies
app.use(bodyParser.json());
//Middleware to allow cross-origin requests
app.use(cors());
const jwt = require("jsonwebtoken");
// Dummy secret key (replace with your actual secret key)
const JWT_SECRET = "your_secret_key";

//Session Configuration
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
// Local db
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jp1993",
  database: "dataEntry",
  port: "3306",
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.post("/signup", (req, res) => {
  const { userName, password, email } = req.body;

  //Validate the extracted data
  if (!userName || !password || !email) {
    return res.status(400).json({
      succes: false,
      message:
        "Missing required fields:userName,password and email are requires.",
    });
  }
  connection.query(
    "select * from users where email=?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return res.status(500).json({
          succes: false,
          message: "Internal server error.Please try again later.",
        });
      }
      if (results.length > 0) {
        return res.status(409).json({
          succes: false,
          message: "Email already exists.",
        });
      }
      //Hash the password
      const saltRounds = 10;
      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //insert data into the database
        const query =
          "insert into users(userName,password,email) values(?,?,?)";
        connection.query(
          query,
          [userName, hashedPassword, email],
          (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
              return res.status(500).json({
                succes: false,
                message: "Internal server error.Please try again later.",
              });
            }
            //Save user data in session
            req.session.user = {
              id: result.insertId,
              userName,
              email,
            };
            // Respond with the inserted user data
            res.status(201).json({
              succes: true,
              message: "User successfully signed up!",
              // user: { id: result.insertId, userName, email },
              user: req.session.user,
            });
          }
        );
      } catch (error) {
        console.error("Error hashing password:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error. Please try again later.",
        });
      }
    }
  );
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  //validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields:emain and password required.",
    });
  }
  //Query the user by email
  connection.query(
    "select * from users where email=?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Error querying user:", err);
        return res.status(500).json({
          success: false,
          message: "Internal server error,Please try again later.",
        });
      }
      //CHeck if user exits
      if (results.length === 0) {
        console.log("No user found with the provided email.");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
      const user = results[0];
      console.log("User found:", user);

      //Compare provided password with stored password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log("Password does not match.");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      //Create JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "24",
      });
      //Save user data in session
      req.session.user = {
        id: user.id,
        userName: user.userName,
        email: user.email,
      };
      //Successful authentication
      res.status(200).json({
        success: true,
        message: "Sign In successfully!",
        user: { id: user.id, email: user.email, userName: user.userName },
        token, //Send the token to the client
      });
    }
  );
});

app.get("/profile", (req, res) => {
  const userId = req.query.id;
  console.log(userId);
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User Id is required" });
  }
  connection.query(
    "select id,userName,email from users where id=?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching user profile:", err);
        return res.status(500).json({
          success: false,
          message: "Internal server error,Please try again after.",
        });
      }
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      const user = results[0];
      res.status(200).json({
        success: true,
        user,
      });
    }
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({
        succes: false,
        message: "Failed to logout,Please try again.",
      });
    }
    res.status(200).json({
      succes: true,
      message: "Logout successful.",
    });
  });
});

// // Utility function to format date and time
// const formatDate = (date) => {
//   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
// };

const formatTime = (date) => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};
function getCurrentDateTime(timeZone) {
  const currentTime = new Date();
  return {
    loginDate: format(currentTime, "yyyy-MM-dd", { timeZone }),
    loginTime: format(currentTime, "HH:mm:ss", { timeZone }),
  };
}
//for check in
app.post("/checkin", async (req, res) => {
  const { userId, userName } = req.body;
  // const now=new Date();
  // const loginDate=formatDate(now);
  // const loginTime=formatTime(now);
  const { loginDate, loginTime } = getCurrentDateTime("Asia/Kolkata");
  // Check if there's already an active check-in record for the user
  const checkQuery = `select * from Attendance WHERE userId = ? AND loginDate = ? AND logoutTime IS NULL`;
  connection.query(checkQuery, [userId, loginDate], (err, results) => {
    if (err) {
      console.error("Error fetching check-in record:", err);
      return res.status(500).json({ error: "Failed to check in." });
    }
    if (results.length === 0) {
      // If no active check-in record found, create a new one
      const insertQuery = `insert into Attendance(userId,userName,loginDate,loginTime) values(?,?,?,TIME(?))`;
      connection.query(
        insertQuery,
        [userId, userName, loginDate, loginTime],
        (err, results) => {
          if (err) {
            console.error("Error during check-in:", err);
            return res.status(500).json({ error: "Failed to check in." });
          }
          return res.status(200).json({
            message: "User checked in successfully.",
            attendanceRecord: { userId, userName, loginDate, loginTime },
          });
        }
      );
    } else {
      //User is already checked in
      return res.status(400).json({ error: "User is already checked in." });
    }
  });
});
app.post("/checkout", async (req, res) => {
  const { userId } = req.body;
  const now = new Date();
  const logoutTime = formatTime(now);
  // Find the latest active check-in record for the user
  const findQuery = `select * from Attendance where userId=? and logoutTime IS NULL order by LoginTime DESC LIMIT 1`;
  connection.query(findQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching check-out record:", err);
      return res.status(500).json({ error: "Failed to check out." });
    }
    if (results.length > 0) {
      // Find the latest active check-in record for the user
      const attendanceRecord = results[0];
      const now = new Date();
      const updateQuery = `update Attendance set logoutTime=? where id=?`;
      connection.query(
        updateQuery,
        [now, attendanceRecord.id],
        (err, results) => {
          if (err) {
            console.error("Error during check-out:", err);
            return res.status(500).json({ error: "Failed to check out." });
          }
          return res.status(200).json({
            message: "User checked out successfully.",
            attendanceRecord: { ...attendanceRecord, logoutTime },
          });
        }
      );
    } else {
      return res.status(404).json({ error: "User has not checked in." });
    }
  });
});

//Fetch all attendance records
app.get("/Attendance", (req, res) => {
  const query = `SELECT p.userName,
    DATE_FORMAT(p.loginDate, '%Y-%m-%d') AS loginDate,
    DATE_FORMAT(p.loginTime, '%H:%i') AS loginTime,
    IFNULL(DATE_FORMAT(p.logoutTime, '%H:%i'), 'N/A') AS logoutTime
    FROM Attendance p`;
  // const query='select userId,userName,loginDate,loginTime,logoutTime from Attendance';
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching all attendance records:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch attendance records." });
    }
    res.status(200).json(results);
  });
});
// //Fetch attendance records by userName
// app.get('/Attendance/:userName',(req,res) =>{
//   const {userName} =req.params;
//   const query='select userId,loginDate,loginTime,logoutTime from Attendance where userName=?';
//   connection.query(query,[userName],(err,results) =>{
//     if(err){
//       console.error(`Error fetching  attendance records for user ${userName}:`,err);
//       return res.status(500).json({error:'Failed to fetch attendance records.'});
//     }
//     res.status(200).json(results);
//   })
// })
// //Fetch attendance records by date
// app.get('/Attendance/bydate',(req,res) =>{
//   const startDate=req.query.startDate;
//   const endDate=req.query.endDate;
//   console.log(`Fetching attendance records from ${startDate} to ${endDate}`); // Log the date range
//   const query = `
//   SELECT
//     username,
//     DATE_FORMAT(loginDate, '%Y-%m-%d') AS date,
//     SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(logoutTime, loginTime)))) AS totalHours
//   FROM
//     Attendance
//   WHERE
//     loginDate BETWEEN ? AND ?
//   GROUP BY
//   username, DATE_FORMAT(loginDate, '%Y-%m-%d')`;

//   console.log("SQL Query:", query); // Log the SQL query
//   // const query='select userId,userName,loginDate,loginTime,logoutTime from Attendance where  loginDate BETWEEN ? AND ?';
//   connection.query(query,[startDate,endDate],(err,results) => {
//     if(err){
//       console.error(`Error fetching  attendance records for date range ${startDate} to ${endDate}:`,err);
//       return res.status(500).json({error:'Failed to fetch attendance records.'});
//     }
//     console.log("Query results:",results);
//     res.status(200).json(results);
//   })
// })

// Endpoint to handle POST requests to create a new job
app.post("/jobs", (req, res) => {
  const {
    JobTitle,
    Description,
    Department,
    Location,
    EmploymentType,
    Salary,
    RequiredExperience,
    SkillsRequired,
    Openings,
    Status,
    PostedDate,
    ClosingDate,
  } = req.body;

  // SQL query to insert a new job into the jobs table
  const query = `
    INSERT INTO jobs (
      JobTitle,
      Description,
      Department,
      Location,
      EmploymentType,
      Salary,
      RequiredExperience,
      SkillsRequired,
      Openings,
      Status,
      PostedDate,
      ClosingDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  // Parameterized values for the query
  const values = [
    JobTitle,
    Description,
    Department,
    Location,
    EmploymentType,
    Salary,
    RequiredExperience,
    SkillsRequired,
    Openings,
    Status,
    PostedDate,
    ClosingDate,
  ];

  // Execute the query
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting job:", err);
      return res.status(500).json({ error: "Failed to create job." });
    }

    console.log("Job created successfully:", results);
    res
      .status(200)
      .json({ message: "Job created successfully!", jobId: results.insertId });
  });
});
app.get("/jobs/all", (req, res) => {
  const query = "select * from jobs";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching jobs:", err);
      return res.status(500).json({ error: "Failed to fetch jobs." });
    }
    res.status(200).json(results);
  });
});
app.put("/jobs/:id", (req, res) => {
  const jobId = req.params.id;
  const {
    JobTitle,
    Description,
    Department,
    Location,
    EmploymentType,
    Salary,
    RequiredExperience,
    SkillsRequired,
    Openings,
    Status,
    PostedDate,
    ClosingDate,
  } = req.body;
  // Validate data (optional but recommended)
  if (
    !JobTitle ||
    !Description ||
    !Department ||
    !Location ||
    !EmploymentType ||
    !Salary ||
    !RequiredExperience ||
    !SkillsRequired ||
    !Openings ||
    !PostedDate ||
    !ClosingDate
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }
  // SQL query to update the job
  const query = `update jobs set 
    JobTitle=?,
    Description=?,
    Department=?,
    Location=?,
    EmploymentType=?,
    Salary=?,
    RequiredExperience=?,
    SkillsRequired=?,
    Openings=?,
    Status=?,
    PostedDate=?,
    ClosingDate=?
    where JobID=?;
  `;

  const values = [
    JobTitle,
    Description,
    Department,
    Location,
    EmploymentType,
    Salary,
    RequiredExperience,
    SkillsRequired,
    Openings,
    Status,
    PostedDate,
    ClosingDate,
    jobId,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating job:", err);
      return res.status(500).json({ error: "Failed to update job." });
    }
    console.log("Job updating successfully:", results);
    res.status(200).json({ message: "Job updated successfully!" });
  });
});
app.delete("/jobs/:id", (req, res) => {
  const jobId = req.params.id;
  const query = "Delete from jobs where JobID=?";
  connection.query(query, [jobId], (err, results) => {
    if (err) {
      console.error("Error deleting job:", err);
      return res.status(500).json({ error: "Failed to delete job." });
    }
    console.log("Job deleted successfully:", results);
    res.status(200).json({ message: "Job deleted successfully!" });
  });
});
app.get("/jobs/search", (req, res) => {
  const { JobID, searchValue } = req.query;
  let query = "select * from jobs where JobID=?";
  const queryParams = [JobID];
  if (searchValue) {
    query +=
      " AND (JobTitle LIKE ? OR Description LIKE ? OR Department LIKE ? OR Location LIKE ? OR EmploymentType LIKE ?)";
    const searchPattern = `%${searchValue}%`;
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }
  // console.log('Executing query:', query);
  // console.log('With parameters:', queryParams);

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("error quering the database:", err);
      return res.status(500).send("Error querying the database");
    }
    res.json(results);
  });
});

app.post("/requisitions", (req, res) => {
  const {
    JobID,
    JobTitle,
    Department,
    HiringManager,
    CreatedBy,
    CreationDate,
    Status,
    Priority,
    PositionType,
    RequiredSkills,
    EducationRequirements,
    ExperienceRequirements,
    JobDescription,
    ApprovalDate,
    ClosedDate,
  } = req.body;
  const insertQuery = `insert into requisitions (
      JobID, JobTitle, Department, HiringManager, CreatedBy,
      CreationDate, Status, Priority, PositionType, RequiredSkills,
      EducationRequirements, ExperienceRequirements, JobDescription,
      ApprovalDate, ClosedDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  // Values to insert into requisitions table
  const values = [
    JobID,
    JobTitle,
    Department,
    HiringManager,
    CreatedBy,
    CreationDate,
    Status,
    Priority,
    PositionType,
    RequiredSkills,
    EducationRequirements,
    ExperienceRequirements,
    JobDescription,
    ApprovalDate,
    ClosedDate,
  ];
  connection.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Error creating requisition:", err);
      return res.status(500).json({ error: "Failed to create requisition." });
    }
    console.log("Requisition created successfully");
    res
      .status(201)
      .json({
        message: "Requisition created successfully",
        RequisitionID: result.insertId,
      });
  });
});

app.get("/requisitions", (req, res) => {
  const query="select * from requisitions";
  connection.query(query,(err,results) =>{
    if(err){
      console.error("Error fetching requisitions:",err);
    }
    res.status(200).json(results);
  })
});
// Update requisition endpoint
app.put("/requisitions/:id", (req, res) => {
  const requisitionId = req.params.id;
  const {
    JobID,
    JobTitle,
    Department,
    HiringManager,
    CreatedBy,
    Status,
    Priority,
    PositionType,
    RequiredSkills,
    EducationRequirements,
    ExperienceRequirements,
    JobDescription,
    ApprovalDate,
    ClosedDate,
  } = req.body;

  // Validate data (optional but recommended)
  if (
    !JobID ||
    !JobTitle ||
    !Department ||
    !HiringManager ||
    !CreatedBy ||
    !Status ||
    !Priority ||
    !PositionType ||
    !RequiredSkills ||
    !EducationRequirements ||
    !ExperienceRequirements ||
    !JobDescription ||
    !ApprovalDate ||
    !ClosedDate
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // SQL query to update the requisition
  const query = `UPDATE requisitions SET 
    JobID=?,
    JobTitle=?,
    Department=?,
    HiringManager=?,
    CreatedBy=?,
    Status=?,
    Priority=?,
    PositionType=?,
    RequiredSkills=?,
    EducationRequirements=?,
    ExperienceRequirements=?,
    JobDescription=?,
    ApprovalDate=?,
    ClosedDate=?
    WHERE RequisitionID=?;
  `;

  const values = [
    JobID,
    JobTitle,
    Department,
    HiringManager,
    CreatedBy,
    Status,
    Priority,
    PositionType,
    RequiredSkills,
    EducationRequirements,
    ExperienceRequirements,
    JobDescription,
    ApprovalDate,
    ClosedDate,
    requisitionId
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating requisition:", err);
      return res.status(500).json({ error: "Failed to update requisition." });
    }
    console.log("Requisition updated successfully:", results);
    res.status(200).json({ message: "Requisition updated successfully!" });
  });
});

// Delete requisition endpoint
app.delete("/requisitions/:id", (req, res) => {
  const requisitionId = req.params.id;
  const query = "DELETE FROM requisitions WHERE RequisitionID=?";

  connection.query(query, [requisitionId], (err, results) => {
    if (err) {
      console.error("Error deleting requisition:", err);
      return res.status(500).json({ error: "Failed to delete requisition." });
    }
    console.log("Requisition deleted successfully:", results);
    res.status(200).json({ message: "Requisition deleted successfully!" });
  });
});

//Create candidate endpoint
app.post("/candidates",(req,res) =>{
  const {
    FirstName,
    LastName,
    Email,
    Phone,
    Resume,
    Skills,
    Status,
    WorkExperience,
  } =req.body;
  //Validate data
  if(!FirstName || !LastName || !Email){
    return res.status(400).json({ error: "First Name, Last Name, and Email are required." });
  }
  const query=`INSERT INTO candidates (FirstName, LastName, Email, Phone, Resume, Skills, Status, WorkExperience)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    FirstName,
    LastName,
    Email,
    Phone || null,
    Resume || null,
    Skills || null,
    Status || 'Active',
    WorkExperience || null,
  ];
  connection.query(query,values,(err,results) =>{
    if(err){
      console.error("Error creating candidate:", err);
      return res.status(500).json({ error: "Failed to create candidate." });
    }
    console.log("Candidate created successfully:", results);
    res.status(201).json({ message: "Candidate created successfully!", candidateId: results.insertId });
  }) 
})
//Find All Candidates endpoint
app.get("/candidates",(req,res) => {
  const query="select * from candidates";
  connection.query(query,(err,results) =>{
    if(err){
      console.error("Error fetching candidates:",err);
      return res.status(500).json({error:"Failed to fetch candidates."});
    }
    res.status(200).json(results);
  })
})
//Update candidates endpoint
app.put("/candidates/:id",(req,res) =>{
  const candidateId=req.params.id;
  const {
    FirstName,
    LastName,
    Email,
    Phone,
    Resume,
    Skills,
    Status,
    WorkExperience,
  } = req.body;
  // Validate data
  if (!FirstName || !LastName || !Email) {
    return res.status(400).json({ error: "First Name, Last Name, and Email are required." });
  }
  const query = `UPDATE candidates SET
    FirstName=?,
    LastName=?,
    Email=?,
    Phone=?,
    Resume=?,
    Skills=?,
    Status=?,
    WorkExperience=?
    WHERE CandidateID=?`;
  const values = [
    FirstName,
    LastName,
    Email,
    Phone || null,
    Resume || null,
    Skills || null,
    Status || 'Active',
    WorkExperience || null,
    candidateId,
  ];
  connection.query(query,values,(err,results) =>{
    if (err) {
      console.error("Error updating candidate:", err);
      return res.status(500).json({ error: "Failed to update candidate." });
    }
    console.log("Candidate updated successfully:", results);
    res.status(200).json({ message: "Candidate updated successfully!" });
  })
})
//Delete candidates endpoint
app.delete("/candidates/:id",(req,res) =>{
  const candidateId=req.params.id;
  // SQL query to delete the candidate
  const query = "DELETE FROM candidates WHERE CandidateID=?";

  connection.query(query, [candidateId], (err, results) => {
    if (err) {
      console.error("Error deleting candidate:", err);
      return res.status(500).json({ error: "Failed to delete candidate." });
    }
    console.log("Candidate deleted successfully:", results);
    res.status(200).json({ message: "Candidate deleted successfully!" });
  });
})
app.listen(3001, function () {
  console.log(`Server running on port 3001`);
});
