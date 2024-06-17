const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const ExcelJS = require('exceljs');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',  
  database: 'user'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('MySQL Connected...');
});
app.get('/',async(req,res)=>{
  res.send("hello");
})
app.post('/submit', (req, res) => {
  const { formType, name, countryCode, phoneNumber } = req.body;
  console.log('Received data:', { formType, name, countryCode, phoneNumber });

  const query = 'INSERT INTO form_data (form_type, name, country_code, phone_number) VALUES (?, ?, ?, ?)';
  db.query(query, [formType, name, countryCode, phoneNumber], (err, result) => {
    if (err) {
      console.error('Error saving data:', err);
      res.status(500).json({ message: 'Error saving data', error: err });
    } else {
      console.log('Data saved successfully:', result);
      res.status(200).json({ message: 'Data saved successfully' });
    }
  });
});


app.get('/refresh', async (req, res) => {
  const query = 'SELECT * FROM form_data';
  db.query(query, async (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ message: 'Error fetching data', error: err });
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Form Data');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Form Type', key: 'form_type', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Country Code', key: 'country_code', width: 10 },
        { header: 'Phone Number', key: 'phone_number', width: 20 },
      ];
      worksheet.addRows(results);

      const excelBuffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Disposition', 'attachment; filename="Form_Data.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
