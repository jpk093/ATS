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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  // const query = "select * from jobs";
  const query = `SELECT * FROM jobs LIMIT ? OFFSET ?`;
  const queryParams = [limit, offset];
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching jobs:", err);
      return res.status(500).json({ error: "Failed to fetch jobs." });
    }
    // res.status(200).json(results);
    // To get the total count of jobs for pagination
    const countQuery = "SELECT COUNT(*) as count FROM jobs";
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error fetching job count:", err);
        return res.status(500).json({ error: "Failed to fetch job count." });
      }
      const totalCount = countResults[0].count;
      res.status(200).json({ jobs: results, totalCount: totalCount });
    });
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
  const { searchValue, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(pageSize) || 10;
  const offset = (pageNumber - 1) * resultsPerPage;

  let query = "select * from jobs";
  const queryParams = [];
  let conditions = [];

  // if (searchValue) {
  //   query +=
  //     " AND (JobTitle LIKE ? OR Description LIKE ? OR Department LIKE ? OR Location LIKE ? OR EmploymentType LIKE ?)";
  // Check if searchValue is provided, and construct the search query
  if (searchValue) {
    const searchPattern = `%${searchValue}%`;
    conditions.push(
      "(JobTitle LIKE ? OR Description LIKE ? OR Department LIKE ? OR Location LIKE ? OR EmploymentType LIKE ?)"
    );

    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  // Add LIMIT and OFFSET clauses at the end of the query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(resultsPerPage, offset);

  // Query to get the total count of jobs matching the search criteria
  let countQuery = "SELECT COUNT(*) AS count FROM jobs";
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("error quering the database:", err);
      return res.status(500).send("Error querying the database");
    }
    // }if (results.length === 0) {
    //   return res.status(404).json({ error: "No jobs found" });
    // }
    // // Log the retrieved data to the console
    // console.log("Retrieved job data:", results);
    // res.json(results);
    // Get the total count of matching jobs
    connection.query(
      countQuery,
      queryParams.slice(0, conditions.length * 5),
      (err, countResults) => {
        if (err) {
          console.error("Error querying the count:", err);
          return res.status(500).send("Error querying the count");
        }

        // Log the retrieved data to the console
        console.log("Retrieved job data:", results);
        console.log("Total count:", countResults[0].count);

        // Respond with job data and total count
        res.json({
          jobs: results,
          totalCount: countResults[0].count,
        });
      }
    );
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
    res.status(201).json({
      message: "Requisition created successfully",
      RequisitionID: result.insertId,
    });
  });
});

app.get("/requisitions", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  //const query = "select * from requisitions";
  const query = `SELECT * FROM requisitions LIMIT ? OFFSET ?`;
  const queryParams = [limit, offset];
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching requisitions:", err);
      return res.status(500).json({ error: "Failed to fetch requisitions." });
    }
    //res.status(200).json(results);
    const countQuery = "SELECT COUNT(*) as count FROM requisitions";
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error fetching requisitions count:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch requisitions count." });
      }
      const totalCount = countResults[0].count;
      res.status(200).json({ requisitions: results, totalCount: totalCount });
    });
  });
});

app.get("/requisitions/search", (req, res) => {
  const { searchValue, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(pageSize) || 10;
  const offset = (pageNumber - 1) * resultsPerPage;

  let query = "SELECT * FROM requisitions";
  const queryParams = [];
  let conditions = [];
  if (searchValue) {
    const searchPattern = `%${searchValue}%`;
    conditions.push(
      "(JobID LIKE ? OR JobTitle LIKE ? OR Department LIKE ? OR HiringManager LIKE ? OR CreatedBy LIKE ? OR Status LIKE ? OR Priority LIKE ? OR PositionType LIKE ? OR EducationRequirements LIKE ? OR ExperienceRequirements LIKE ? OR JobDescription LIKE ?)"
    );
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Add LIMIT and OFFSET clauses at the end of the query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(resultsPerPage, offset);

  // Query to get the total count of requisitions matching the search criteria
  let countQuery = "SELECT COUNT(*) AS count FROM requisitions";
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).send("Error querying the database");
    }

    // Get the total count of matching requisitions
    connection.query(
      countQuery,
      queryParams.slice(0, queryParams.length * 5),
      (err, countResults) => {
        if (err) {
          console.error("Error querying the count:", err);
          return res.status(500).send("Error querying the count");
        }

        // Log the retrieved data to the console
        console.log("Retrieved requisition data:", results);
        console.log("Total count:", countResults[0].count);

        // Respond with requisition data and total count
        res.json({
          requisitions: results,
          totalCount: countResults[0].count,
        });
      }
    );
  });
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
    ClosedDate=?,
    UpdatedAt=CURRENT_TIMESTAMP
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
    requisitionId,
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
app.post("/candidates", (req, res) => {
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
  //Validate data
  if (!FirstName || !LastName || !Email) {
    return res
      .status(400)
      .json({ error: "First Name, Last Name, and Email are required." });
  }
  const query = `INSERT INTO candidates (FirstName, LastName, Email, Phone, Resume, Skills, Status, WorkExperience)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    FirstName,
    LastName,
    Email,
    Phone || null,
    Resume || null,
    Skills || null,
    Status || "Active",
    WorkExperience || null,
  ];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error creating candidate:", err);
      return res.status(500).json({ error: "Failed to create candidate." });
    }
    console.log("Candidate created successfully:", results);
    res.status(201).json({
      message: "Candidate created successfully!",
      candidateId: results.insertId,
    });
  });
});
//Find All Candidates endpoint
app.get("/candidates", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  // const query = "select * from candidates";
  const query = `SELECT * FROM candidates LIMIT ? OFFSET ?`;
  const queryParams = [limit, offset];
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching candidates:", err);
      return res.status(500).json({ error: "Failed to fetch candidates." });
    }
    //res.status(200).json(results);
    // To get the total count of candidates for pagination
    const countQuery = "SELECT COUNT(*) as count FROM candidates";
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error fetching candidate count:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch candidate count." });
      }
      const totalCount = countResults[0].count;
      res.status(200).json({ candidates: results, totalCount: totalCount });
    });
  });
});
app.get("/candidates/search", (req, res) => {
  const { searchValue, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(pageSize) || 10;
  const offset = (pageNumber - 1) * resultsPerPage;

  let query = "SELECT * FROM candidates";
  const queryParams = [];
  let conditions = [];
  if (searchValue) {
    const searchPattern = `%${searchValue}%`;
    conditions.push(
      "(CandidateID LIKE ? OR FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ? OR Phone LIKE ? OR Resume LIKE ? OR Skills LIKE ? OR Status LIKE ? OR WorkExperience LIKE ? )"
    );
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Add LIMIT and OFFSET clauses at the end of the query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(resultsPerPage, offset);

  // Query to get the total count of requisitions matching the search criteria
  let countQuery = "SELECT COUNT(*) AS count FROM candidates";
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).send("Error querying the database");
    }

    // Get the total count of matching requisitions
    connection.query(
      countQuery,
      queryParams.slice(0, queryParams.length * 5),
      (err, countResults) => {
        if (err) {
          console.error("Error querying the count:", err);
          return res.status(500).send("Error querying the count");
        }

        // Log the retrieved data to the console
        console.log("Retrieved candidates data:", results);
        console.log("Total count:", countResults[0].count);

        // Respond with requisition data and total count
        res.json({
          candidates: results,
          totalCount: countResults[0].count,
        });
      }
    );
  });
});
//Update candidates endpoint
app.put("/candidates/:id", (req, res) => {
  const candidateId = req.params.id;
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
    return res
      .status(400)
      .json({ error: "First Name, Last Name, and Email are required." });
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
    Status || "Active",
    WorkExperience || null,
    candidateId,
  ];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating candidate:", err);
      return res.status(500).json({ error: "Failed to update candidate." });
    }
    console.log("Candidate updated successfully:", results);
    res.status(200).json({ message: "Candidate updated successfully!" });
  });
});
//Delete candidates endpoint
app.delete("/candidates/:id", (req, res) => {
  const candidateId = req.params.id;
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
});

app.post("/submissions", (req, res) => {
  const {
    FirstName,
    LastName,
    CandidateID,
    JobID,
    JobTitle,
    Client,
    Status,
    CandidateCTCType,
    CandidateCTC,
    City,
    State,
    JobHiringType,
    Submitter,
    SubmittedDate,
    ReasonForRejection,
    RejectionComments,
  } = req.body;
  const query = `
  INSERT INTO submissions (
      FirstName, LastName, CandidateID, JobID, JobTitle, Client, Status,
      CandidateCTCType, CandidateCTC, City, State, JobHiringType, Submitter,
      SubmittedDate, ReasonForRejection, RejectionComments
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    FirstName,
    LastName,
    CandidateID,
    JobID,
    JobTitle,
    Client,
    Status,
    CandidateCTCType,
    CandidateCTC,
    City,
    State,
    JobHiringType,
    Submitter,
    SubmittedDate,
    ReasonForRejection,
    RejectionComments,
  ];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error creating submission:", err);
      return res.status(500).json({ error: "Failed to create submission." });
    }
    console.log("Submission created successfully:", results);
    res.status(201).json({
      message: "Submission created successfully!",
      submissionId: results.insertId,
    });
  });
});
app.get("/submissions", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  // const query = "select * from submissions";
  const query = `SELECT * FROM submissions LIMIT ? OFFSET ?`;
  const queryParams = [limit, offset];
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching submissions:", err);
      return res.status(500).json({ error: "Failed to fetch submissions." });
    }
    // res.status(200).json(results);
    // To get the total count of jobs for pagination
    const countQuery = "SELECT COUNT(*) as count FROM submissions";
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error fetching submissions count:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch submissions count." });
      }
      const totalCount = countResults[0].count;
      res.status(200).json({ submissions: results, totalCount: totalCount });
    });
  });
});
app.get("/submissions/search", (req, res) => {
  const { searchValue, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(pageSize) || 10;
  const offset = (pageNumber - 1) * resultsPerPage;
  let query = "select * from submissions";
  const queryParams = [];
  let conditions = [];

  if (searchValue) {
    const searchPattern = `%${searchValue}%`;
    conditions.push(
      "(SubmissionID LIKE ? OR FirstName LIKE ? OR LastName LIKE ? OR CandidateID LIKE ? OR JobID LIKE ? OR JobTitle LIKE ? OR Client LIKE ? OR Status LIKE ? OR CandidateCTCType LIKE ? OR CandidateCTC LIKE ? OR City LIKE ? OR State LIKE ? OR JobHiringType LIKE ? OR Submitter LIKE ? OR ReasonForRejection LIKE ? OR RejectionComments LIKE ?)"
    );
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  // Add LIMIT and OFFSET clauses at the end of the query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(resultsPerPage, offset);

  // Query to get the total count of jobs matching the search criteria
  let countQuery = "SELECT COUNT(*) AS count FROM submissions";
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }
    // Only pass the parameters relevant to the conditions, not the LIMIT and OFFSET
  const countQueryParams = queryParams.slice(0, queryParams.length - 2);
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("error quering the database:", err);
      return res.status(500).send("Error querying the database");
    }
    connection.query(countQuery, countQueryParams, (err, countResults) => {
        if (err) {
          console.error("Error querying the count:", err);
          return res.status(500).send("Error querying the count");
        }

        // Log the retrieved data to the console
        console.log("Retrieved submissions data:", results);
        console.log("Total count:", countResults[0].count);

        // Respond with job data and total count
        res.json({
          submissions: results,
          totalCount: countResults[0].count,
        });
      }
    );
  });
});
app.put("/submissions/:id", (req, res) => {
  const { id } = req.params;
  const {
    FirstName,
    LastName,
    CandidateID,
    JobID,
    JobTitle,
    Client,
    Status,
    CandidateCTCType,
    CandidateCTC,
    City,
    State,
    JobHiringType,
    Submitter,
    SubmittedDate,
    ReasonForRejection,
    RejectionComments,
  } = req.body;
  const query = `UPDATE submissions SET 
      FirstName = ?, LastName = ?, CandidateID = ?, JobID = ?, JobTitle = ?, 
      Client = ?, Status = ?, CandidateCTCType = ?, CandidateCTC = ?, 
      City = ?, State = ?, JobHiringType = ?, Submitter = ?, 
      SubmittedDate = ?, ReasonForRejection = ?, RejectionComments = ? ,UpdatedAt=CURRENT_TIMESTAMP
      WHERE SubmissionID = 
    ?`;
  const values = [
    FirstName,
    LastName,
    CandidateID,
    JobID,
    JobTitle,
    Client,
    Status,
    CandidateCTCType,
    CandidateCTC,
    City,
    State,
    JobHiringType,
    Submitter,
    SubmittedDate,
    ReasonForRejection,
    RejectionComments,
    id,
  ];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating submission:", err);
      return res.status(500).json({ error: "Failed to update submission." });
    }
    console.log("Submission updated successfully:", results);
    res.status(200).json({ message: "Submission updated successfully!" });
  });
});
app.delete("/submissions/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM submissions WHERE SubmissionID = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting submission:", err);
      return res.status(500).json({ error: "Failed to delete submission." });
    }
    console.log("Submission deleted successfully:", results);
    res.status(200).json({ message: "Submission deleted successfully!" });
  });
});

//Create interview
app.post("/interviews", (req, res) => {
  const {
    Title,
    InterviewStartDate,
    InterviewEndDate,
    InterviewTime,
    TimeZone,
    InterviewDateTime,
    AccountName,
    Interviewer,
    InterviewStage,
    SubmissionID,
    SubmissionStage,
    EndClient,
    InterviewRecipient,
    ScheduledBy,
    Status,
    Location,
    ScheduledOn,
    DueIn,
  } = req.body;

  const query = `
    INSERT INTO interviews (
      Title, InterviewStartDate, InterviewEndDate, InterviewTime, TimeZone,
      InterviewDateTime, AccountName, Interviewer, InterviewStage, SubmissionID,
      SubmissionStage, EndClient, InterviewRecipient, ScheduledBy, Status,
      Location, ScheduledOn, DueIn
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    Title,
    InterviewStartDate,
    InterviewEndDate,
    InterviewTime,
    TimeZone,
    InterviewDateTime,
    AccountName,
    Interviewer,
    InterviewStage,
    SubmissionID,
    SubmissionStage,
    EndClient,
    InterviewRecipient,
    ScheduledBy,
    Status,
    Location,
    ScheduledOn,
    DueIn,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error creating interview:", err);
      return res.status(500).json({ error: "Failed to create interview." });
    }
    console.log("Interview created successfully:", results);
    res.status(201).json({
      message: "Interview created successfully!",
      interviewId: results.insertId,
    });
  });
});

//Fetch all interviews
app.get("/interviews", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  // const query = "select * from interviews";
  const query = `SELECT * FROM interviews LIMIT ? OFFSET ?`;
  const queryParams = [limit, offset];
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching interviews:", err);
      return res.status(500).json({ error: "Failed to fetch interviews." });
    }
    // res.status(200).json(results);
    // To get the total count of jobs for pagination
    const countQuery = "SELECT COUNT(*) as count FROM interviews";
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error fetching interviews count:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch interviews count." });
      }
      const totalCount = countResults[0].count;
      res.status(200).json({ interviews: results, totalCount: totalCount });
    });
  });
});
app.get("/interviews/search", (req, res) => {
  const { searchValue, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(pageSize) || 10;
  const offset = (pageNumber - 1) * resultsPerPage;
  let query = "select * from interviews";
  const queryParams = [];
  let conditions = [];

  if (searchValue) {
    const searchPattern = `%${searchValue}%`;
    conditions.push(
      "(InterviewID LIKE ? OR Title LIKE ? OR TimeZone LIKE ? OR AccountName LIKE ? OR Interviewer LIKE ? OR InterviewStage LIKE ? OR SubmissionID LIKE ? OR SubmissionStage LIKE ? OR EndClient LIKE ? OR InterviewRecipient LIKE ? OR ScheduledBy LIKE ? OR Status LIKE ? OR Location LIKE ? OR DueIn LIKE ?)"
    );
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  // Add LIMIT and OFFSET clauses at the end of the query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(resultsPerPage, offset);

  // Query to get the total count of jobs matching the search criteria
  let countQuery = "SELECT COUNT(*) AS count FROM interviews";
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }

  // Only pass the parameters relevant to the conditions, not the LIMIT and OFFSET
  const countQueryParams = queryParams.slice(0, queryParams.length - 2);

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("error quering the database:", err);
      return res.status(500).send("Error querying the database");
    }
    connection.query(countQuery, countQueryParams, (err, countResults) => {
        if (err) {
          console.error("Error querying the count:", err);
          return res.status(500).send("Error querying the count");
        }

        // Log the retrieved data to the console
        console.log("Retrieved interviews data:", results);
        console.log("Total count:", countResults[0].count);

        // Respond with job data and total count
        res.json({
          interviews: results,
          totalCount: countResults[0].count,
        });
      }
    );
  });
});

//update interview
app.put("/interviews/:id", (req, res) => {
  const { id } = req.params;
  const {
    Title,
    InterviewStartDate,
    InterviewEndDate,
    InterviewTime,
    TimeZone,
    InterviewDateTime,
    AccountName,
    Interviewer,
    InterviewStage,
    SubmissionID,
    SubmissionStage,
    EndClient,
    InterviewRecipient,
    ScheduledBy,
    Status,
    Location,
    ScheduledOn,
    DueIn,
  } = req.body;

  const query = `
    UPDATE interviews SET 
      Title = ?, InterviewStartDate = ?, InterviewEndDate = ?, InterviewTime = ?, 
      TimeZone = ?, InterviewDateTime = ?, AccountName = ?, Interviewer = ?, 
      InterviewStage = ?, SubmissionID = ?, SubmissionStage = ?, EndClient = ?, 
      InterviewRecipient = ?, ScheduledBy = ?, Status = ?, Location = ?, 
      ScheduledOn = ?, DueIn = ?,UpdatedAt=CURRENT_TIMESTAMP
    WHERE InterviewID = ?`;

  const values = [
    Title,
    InterviewStartDate,
    InterviewEndDate,
    InterviewTime,
    TimeZone,
    InterviewDateTime,
    AccountName,
    Interviewer,
    InterviewStage,
    SubmissionID,
    SubmissionStage,
    EndClient,
    InterviewRecipient,
    ScheduledBy,
    Status,
    Location,
    ScheduledOn,
    DueIn,
    id,
  ];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating interview:", err);
      return res.status(500).json({ error: "Failed to update interview." });
    }
    console.log("Interview updated successfully:", results);
    res.status(200).json({ message: "Interview updated successfully!" });
  });
});

//Delete interview
app.delete("/interviews/:id", (req, res) => {
  const { id } = req.params;
  const query = "delete from interviews where InterviewID=?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting interview:", err);
      return res.status(500).json({ error: "Failed to delete interview." });
    }
    console.log("Interview deleted successfully:", results);
    res.status(200).json({ message: "Interview deleted successfully!" });
  });
});

app.post("/employees", (req, res) => {
  const { EmployeeName, Email, EmploymentType, Department, ReportingTo } =
    req.body;
  const query = `
    INSERT INTO employees (EmployeeName, Email, EmploymentType, Department, ReportingTo)
    VALUES (?, ?, ?, ?, ?)`;
  const values = [EmployeeName, Email, EmploymentType, Department, ReportingTo];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error creating employee:", err);
      return res.status(500).json({ error: "Failed to create employee." });
    }
    res
      .status(201)
      .json({
        message: "Employee created successfully!",
        employeeId: results.insertId,
      });
  });
});
app.get("/employees", (req, res) => {
  //const query="select * from employees";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM employees LIMIT ? OFFSET ?`;
  const queryParams = [limit, offset];
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({ error: "Failed to fetch employees." });
    }
    // res.status(200).json(results);
    // To get the total count of jobs for pagination
    const countQuery = "SELECT COUNT(*) as count FROM employees";
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error fetching employees count:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch employees count." });
      }
      const totalCount = countResults[0].count;
      res.status(200).json({ employees: results, totalCount: totalCount });
    });
  });
});
app.get("/employees/search", (req, res) => {
  const { searchValue, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(pageSize) || 10;
  const offset = (pageNumber - 1) * resultsPerPage;
  let query = "select * from employees";
  const queryParams = [];
  let conditions = [];

  if (searchValue) {
    const searchPattern = `%${searchValue}%`;
    conditions.push(
      "(EmployeeID LIKE ? OR EmployeeName LIKE ? OR Email LIKE ? OR EmploymentType LIKE ? OR Department LIKE ? OR ReportingTo LIKE ?)"
    );
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  // Add LIMIT and OFFSET clauses at the end of the query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(resultsPerPage, offset);

  // Query to get the total count of jobs matching the search criteria
  let countQuery = "SELECT COUNT(*) AS count FROM employees";
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }
   // Only pass the parameters relevant to the conditions, not the LIMIT and OFFSET
   const countQueryParams = queryParams.slice(0, queryParams.length - 2);
   
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("error quering the database:", err);
      return res.status(500).send("Error querying the database");
    }
    connection.query(countQuery, countQueryParams, (err, countResults) => {
        if (err) {
          console.error("Error querying the count:", err);
          return res.status(500).send("Error querying the count");
        }

        // Log the retrieved data to the console
        console.log("Retrieved employees data:", results);
        console.log("Total count:", countResults[0].count);

        // Respond with job data and total count
        res.json({
          employees: results,
          totalCount: countResults[0].count,
        });
      }
    );
  });
});
app.put("/employees/:id", (req, res) => {
  const { id } = req.params;
  const { EmployeeName, Email, EmploymentType, Department, ReportingTo } =
    req.body;
  const query = `
    UPDATE employees SET 
      EmployeeName = ?, Email = ?, EmploymentType = ?, Department = ?, ReportingTo = ?,UpdatedAt=CURRENT_TIMESTAMP
    WHERE EmployeeID = ?`;
  const values = [
    EmployeeName,
    Email,
    EmploymentType,
    Department,
    ReportingTo,
    id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating employee:", err);
      return res.status(500).json({ error: "Failed to update employee." });
    }
    res.status(200).json({ message: "Employee updated successfully!" });
  });
});
app.delete("/employees/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM employees WHERE EmployeeID = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting employee:", err);
      return res.status(500).json({ error: "Failed to delete employee." });
    }
    res.status(200).json({ message: "Employee deleted successfully!" });
  });
});

app.post("/assignments", (req, res) => {
  const {
    EmployeeID,
    AssignmentTitle,
    JobID,
    ProjectName,
    ProjectType,
    Client,
    StartDate,
    EndDate,
    Status,
    WorkLocationCity,
    WorkLocationState,
  } = req.body;
  const query = `
    INSERT INTO assignments (EmployeeID, AssignmentTitle, JobID, ProjectName, ProjectType, Client, StartDate, EndDate, Status, WorkLocationCity, WorkLocationState)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    EmployeeID,
    AssignmentTitle,
    JobID,
    ProjectName,
    ProjectType,
    Client,
    StartDate,
    EndDate,
    Status,
    WorkLocationCity,
    WorkLocationState,
  ];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error creating assignment:", err);
      return res.status(500).json({ error: "Failed to create assignment." });
    }
    res
      .status(201)
      .json({
        message: "Assignment created successfully!",
        assignmentId: results.insertId,
      });
  });
});

//get All Assignments
app.get("/assignments", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  // const query="select * from assignments";
  const query = `SELECT * FROM assignments LIMIT ? OFFSET ?`;
  const queryParams = [limit, offset];
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      return res.status(500).json({ error: "Failed to fetch assignments." });
    }
    // res.status(200).json(results);
    // To get the total count of jobs for pagination
    const countQuery = "SELECT COUNT(*) as count FROM assignments";
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error fetching assignments count:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch assignments count." });
      }
      const totalCount = countResults[0].count;
      res.status(200).json({ assignments: results, totalCount: totalCount });
    });
  });
});
app.get("/assignments/search", (req, res) => {
  const { searchValue, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(pageSize) || 10;
  const offset = (pageNumber - 1) * resultsPerPage;
  let query = "select * from assignments";
  const queryParams = [];
  let conditions = [];

  if (searchValue) {
    const searchPattern = `%${searchValue}%`;
    conditions.push(
      "(AssignmentID LIKE ? OR EmployeeID LIKE ? OR AssignmentTitle LIKE ? OR JobID LIKE ? OR ProjectName LIKE ? OR ProjectType LIKE ? OR Client LIKE ? OR Status LIKE ? OR WorkLocationCity LIKE ? OR WorkLocationState LIKE ?)"
    );
    queryParams.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  // Add LIMIT and OFFSET clauses at the end of the query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(resultsPerPage, offset);

  // Query to get the total count of jobs matching the search criteria
  let countQuery = "SELECT COUNT(*) AS count FROM assignments";
  if (conditions.length > 0) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }

  // Only pass the parameters relevant to the conditions, not the LIMIT and OFFSET
  const countQueryParams = queryParams.slice(0, queryParams.length - 2);

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("error quering the database:", err);
      return res.status(500).send("Error querying the database");
    }
    connection.query(countQuery, countQueryParams, (err, countResults) => {
        if (err) {
          console.error("Error querying the count:", err);
          return res.status(500).send("Error querying the count");
        }

        // Log the retrieved data to the console
        console.log("Retrieved assignments data:", results);
        console.log("Total count:", countResults[0].count);

        // Respond with job data and total count
        res.json({
          assignments: results,
          totalCount: countResults[0].count,
        });
      }
    );
  });
});
//Update Assignment
app.put("/assignments/:id", (req, res) => {
  const { id } = req.params;
  const {
    EmployeeID,
    AssignmentTitle,
    JobID,
    ProjectName,
    ProjectType,
    Client,
    StartDate,
    EndDate,
    Status,
    WorkLocationCity,
    WorkLocationState,
  } = req.body;
  const query = `
    UPDATE assignments SET 
      EmployeeID = ?, AssignmentTitle = ?, JobID = ?, ProjectName = ?, ProjectType = ?, Client = ?, 
      StartDate = ?, EndDate = ?, Status = ?, WorkLocationCity = ?, WorkLocationState = ?,UpdatedAt=CURRENT_TIMESTAMP
    WHERE AssignmentID = ?`;
  const values = [
    EmployeeID,
    AssignmentTitle,
    JobID,
    ProjectName,
    ProjectType,
    Client,
    StartDate,
    EndDate,
    Status,
    WorkLocationCity,
    WorkLocationState,
    id,
  ];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating assignment:", err);
      return res.status(500).json({ error: "Failed to update assignment." });
    }
    res.status(200).json({ message: "Assignment updated successfully!" });
  });
});
//Delete Assignment
app.delete("/assignments/:id", (req, res) => {
  const { id } = req.params;
  const query = "delete from assignments where AssignmentID=?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting assignment:", err);
      return res.status(500).json({ error: "Failed to delete assignment." });
    }
    res.status(200).json({ message: "Assignment deleted successfully!" });
  });
});
app.listen(3001, function () {
  console.log(`Server running on port 3001`);
});
