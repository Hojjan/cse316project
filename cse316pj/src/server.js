require('dotenv').config({ path: '../.env' })
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
  password: 'hochan2001!', 
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
  const { assignment1, assignment2, assignment3, assignment4, midterm, final, group_project, attendance } = req.body;
  console.log(req.body);
  const query = `
    INSERT INTO grades (assignment1, assignment2, assignment3, assignment4, midterm, final, group_project, attendance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [assignment1, assignment2, assignment3, assignment4, midterm, final, group_project, attendance],
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

app.get('/api/user', authenticateToken, (req, res) => {
  const { userId } = req.query;

  if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
  }

  const query = 'SELECT username FROM user WHERE id = ?';
  db.query(query, [userId], (err, result) => {
      if (err) {
          console.error('Error fetching username:', err);
          return res.status(500).json({ error: 'Failed to fetch username.' });
      }

      if (result.length === 0) {
          return res.status(404).json({ error: 'User not found.' });
      }

      res.status(200).json({ username: result[0].username });
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

      const accessToken = genAccTok({ id: user.id, email: user.email });
      return res.status(200).json({ accessToken: accessToken }); 
  });
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
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}
function genRefTok(user){
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


