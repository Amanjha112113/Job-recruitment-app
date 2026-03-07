require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: '699626e193c8d5a2f74b5e2e' }, process.env.JWT_SECRET, { expiresIn: '30d' });
console.log("Token:", token);

require('child_process').exec(`curl -vs http://localhost:5001/api/jobs/my-applications -H "Authorization: Bearer ${token}"`, (err, stdout, stderr) => {
    console.log("OUT:", stdout);
    console.log("ERR:", stderr);
});
