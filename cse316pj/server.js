require('dotenv').config()
const express = require('express');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const port = 3001;
const jwt = require("jsonwebtoken"); //Authentication



app.use(cors());

app.use(express.json());

let refreshTokens = []

cloudinary.config({
  cloud_name: "dgou2evcb",
  api_key: "872698482192992",
  api_secret: "8R05iBI5XgJ4xE2lvXVPWDpVdfw",
});

const upload = multer({ dest: "uploads/" });


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'wjswngud!!30', 
  database: 'cse316pj'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
}); 

//insert Grade //////////////////////////////////////////////////////////////////////////////////
app.post('/api/grades', (req, res) => {
  const { assignment1, assignment2, assignment3, assignment4, midterm, final, group_project, attendance, email } = req.body;
  console.log(req.body);
  const query = `
    INSERT INTO grades (assignment1, assignment2, assignment3, assignment4, midterm, final, group_project, attendance, email_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [assignment1, assignment2, assignment3, assignment4, midterm, final, group_project, attendance, email],
    (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Failed to save grades' });
      }
      res.status(200).json({ message: 'Grades saved successfully' });
    }
  );
});

////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/api/user/uploadProfileImage", authenticateToken, upload.single("image"), async (req, res) => {
  const { userId } = req.body;
  const file = req.file;

  if (!file || !userId) {
      return res.status(400).json({ error: "Missing file or userId" });
  }

  try {
     
      const result = await cloudinary.uploader.upload(file.path, {
          folder: "user_profile_images",
      });

      const imageUrl = result.secure_url;

     
      const updateQuery = "UPDATE user SET img_src = ? WHERE id = ?";
      db.query(updateQuery, [imageUrl, userId], (err, results) => {
          if (err) {
              console.error("Error updating user image in database:", err);
              return res.status(500).json({ error: "Database error during image update" });
          }

          res.status(200).json({
              message: "Profile image uploaded and saved successfully!",
              imageUrl,
          });
      });
  } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      res.status(500).json({ error: "Failed to upload image" });
  }
});



app.post("/api/user/updatePassword", authenticateToken, async (req, res) => {
  const { userId, hashedPassword } = req.body;

  if (!userId || !hashedPassword) {
      return res.status(400).json({ error: "User ID and new password are required." });
  }

  try {
      
      const query = "UPDATE user SET password = ? WHERE id = ?";
      db.query(query, [hashedPassword, userId], (err, result) => {
          if (err) {
              console.error("Error updating password:", err);
              return res.status(500).json({ error: "Failed to update password." });
          }

          res.status(200).json({ message: "Password updated successfully!" });
      });
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error." });
  }
});

app.post("/api/user/updateName", authenticateToken, async (req, res) => {
  const { userId, newusername } = req.body;
  console.log(userId, newusername);

  if (!userId || !newusername) {
      return res.status(400).json({ error: "User ID and username are required." });
  }

  try {
    const query = "UPDATE user SET username = ? WHERE id = ?";
    db.query(query, [newusername, userId], (err, result) => {
      if (err) {
        console.error("Error updating name:", err);
        return res.status(500).send("Error updating name.");
      }
      else{
        return res.status(200).send("successfully changed name!");
      }
    });
  
  } catch (error) {
      console.error("Error updating name:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/user/info", authenticateToken, (req, res) => {
  const userId = req.user.id; // Access userId from the authenticated token

  const query = "SELECT username, email_address AS email, year FROM user WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch user information." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const userInfo = results[0]; // Extract user info
    return res.status(200).json(userInfo);
  });
});

//View Grades//////////////////////////////////////////////////////////////////////

app.post('/api/grades/all', authenticateToken, (req, res) => {
  const { email } = req.body; // Access userId from the authenticated token
  console.log("Received email:", email);
  const query = `SELECT assignment1, assignment2, assignment3, assignment4, midterm, final, group_project, attendance 
                  FROM grades WHERE email_address = ?`;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch grades." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No grades found for the user." });
    }
    console.log(results[0]); //여기까지는 괜춘
    res.status(200).json(results[0]); // Return the grades for the user
  });
});


app.get('/api/grades/filter-email', authenticateToken, (req, res) => {
  const excludedEmail = req.query.email;

  if (!excludedEmail) {
    return res.status(400).json({ error: "Email to exclude is required." });
  }

  const query = `SELECT * FROM grades WHERE email_address != ?`;

  db.query(query, [excludedEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch filtered grades." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No grades found for other users." });
    }
    
    console.log(results);
    res.status(200).json(results); // 필터링된 데이터 반환
  });
});

//////////////////////////////////////////////////////////////////////////////////

app.post("/api/user/signup", (req, res) => {
  console.log("Request body: ", req.body);

  const {email, password, username, year } = req.body;
  const checkEmailQuery = "SELECT * FROM user WHERE email_address = ?";

  
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ err: "Database error during email check." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }


    const insertUserQuery = "INSERT INTO user (email_address, password, username, year) VALUES (?, ?, ?, ?)";
    db.query(insertUserQuery, [email, password, username, year], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error during user insertion.", err });
      }

      return res.status(201).json({ message: "User registered successfully!"});
    });
  });
});

app.post("/api/user/signin", (req, res) => {
  const {email, password} = req.body;

  console.log("Signin request received with email:", email);
  const checkEmailQuery = "SELECT * FROM user WHERE email_address = ?";

    db.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Internal server error." });
      }


      if (results.length === 0) {
          return res.status(404).json({ error: "Wrong email." });
      }


      const user = results[0]; 

      if (password !== user.password) {
        return res.status(401).json({ error: "Wrong password." });
      }
      const acc = { id: user.id, email: email };
      const accessToken = genAccTok(acc);
      const refreshToken = genRefTok(acc);
      refreshTokens.push(refreshToken);

      res.status(200).json({ message: "Sign in successful!", userId: user.id, accessToken: accessToken, refreshToken: refreshToken });

  });
});




app.get("/api/user/profile", authenticateToken, (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
  }

  const query = "SELECT email_address, password, username, img_src FROM user WHERE id = ?";
  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Failed to fetch profile image" });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }
      const account = results[0];
      return res.status(200).json({ email_address: account.email_address, password: account.password, username: account.username, img_src: account.img_src});
  });
});

app.post('/api/token/refresh', (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) {return res.sendStatus(401);} 
  if (!refreshTokens.includes(refreshToken)) {return res.sendStatus(403);} 

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {return res.sendStatus(403);} 

      const accessToken = genAccTok({ user });
      return res.status(200).json({ accessToken: accessToken }); 
  });
});

//post questions
app.post('/api/questions', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('Access token is missing.');
    return res.status(401).json({ error: 'Access token is missing.' });
  }

  // Verify and decode JWT token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error('Invalid or expired token:', err);
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    const userEmail = decoded.email;
    if (!userEmail) {
      console.error('User email is missing from token.');
      return res.status(400).json({ error: 'User email is missing from token.' });
    }

    const { question } = req.body;
    if (!question || question.trim() === '') {
      console.error('Question is required but not provided.');
      return res.status(400).json({ error: 'Question is required.' });
    }

    // Insert the question into the database
    const query = 'INSERT INTO questions (question_text, user_email) VALUES (?, ?)';
    db.query(query, [question, userEmail], (err, result) => {
      if (err) {
        console.error('Error inserting question into database:', err);
        return res.status(500).json({ error: 'Failed to save question.' });
      }

      console.log('Question successfully saved:', result);
      res.status(201).json({
        message: 'Question successfully uploaded!',
        questionId: result.insertId,
        questionText: question,
        userEmail: userEmail,
      });
    });
  });
});



// get questions
app.get('/api/questions', authenticateToken, (req, res) => {
  const userEmail = req.user.email;

  const query = `SELECT id, question_text, user_email FROM questions WHERE user_email = ?`;

  db.query(query, [userEmail], (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Failed to fetch questions.' });
    }
    res.status(200).json(results);
  });
});


//delete questions
app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM questions WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting question:", err);
      return res.status(500).json({ error: "Failed to delete question." });
    }
    res.status(200).json({ message: "Question deleted successfully.", id });
  });
})

//get email from user
app.get('/api/user/email', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  const email = extractEmailFromToken(token);
  if (!email) {
    return res.status(400).json({ error: "Invalid token or email not found" });
  }

  res.status(200).json({ email });
});



function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
        return res.status(401).json({ error: "Access token is missing" });
    }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {return res.status(403).json({ error: "Invalid or expired token" });}
    req.user = user;
    next()
  })
}

function genAccTok(user){
  return jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}
function genRefTok(user){
  return jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);
}


function extractEmailFromToken(token) {
  try {
    const decoded = jwt.decode(token);
    console.log("Decoded token:", decoded); 
    if (!decoded || !decoded.email) {
      throw new Error("Invalid token: email not found");
    }
    return decoded.email;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


