const express = require("express");
const { google } = require("googleapis");

const app = express();
const sheets = google.sheets("v4");
const PORT = 5000; 
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.get('/404',async function (req, res) {
  res.render('404');
});
app.get('/:code',async function (req, res) {    
  const list = [];
  let amount_paid = 0
  let amount_due = 0
  let tottal_amount = 0
  let status
  let getRows
  const value = req.params.code;
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/drive",
  });

  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "1HDv9eKO_Ox7b4nX7OK_GCXYdk4hposStTUPks5QbfJc";

  // Get all data about spreadsheet
 
  // Read rows from spreadsheet
  try{
    getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "Registered!A:G",
    
    });
  }
  catch{
    var drive = google.drive({ version: "v3", auth: auth });
    var body = {
      type: "user",
      role: "writer",
      emailAddress: "nodejs@shahanees1998.iam.gserviceaccount.com",
    };
    drive.permissions.create(
      {
        fileId: spreadsheetId, //sheetID returned from create sheet response
        resource: body,
      },
      async function (err, response) {
        if (err) {
          console.error(err);
          return;
        } else {
          console.log("Created a new permision:");
          //  console.log(response.data);
          console.log(JSON.parse(JSON.stringify(response)));
          getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: "Registered!A:G",
          
          });
        }
      }
    );
  }
 
 //console.log(getRows.data.values[1][0].slice(3, 5))
  for(let i =0; i<getRows.data.values.length;i++)
  {
    if(getRows.data.values[i][0] == value)
    {
    //  tottal = getRows.data.values[i][3]\
   amount_due =  getRows.data.values[i][4].replace(',', '')
   amount_paid =  getRows.data.values[i][5].replace(',', '')
   if(amount_due == 0)
   {
     status = 'PAID'
   }
   else{
    status = 'DUE'

   }



tottal_amount = parseInt(amount_due.replace(',', '')) + parseInt(amount_paid.replace(',', ''))
   //   let new_value = getRows.data.values[i][3].replace(',', '');
     // tottal = tottal + parseInt(new_value)
      for(let j =0; j<parseInt(getRows.data.values[i][0].slice(3, 5)) ; j++)
      {
        list.push(getRows.data.values[i+j])
      }
    }
  }
  if(list.length === 0){
    res.redirect('/404');
    return;
  }
  // redirect to 404


console.log(list.length)
  //res.send(getRows.data.values);                   
 res.render("index", {list: list,tottal_amount : tottal_amount ,list_length: list.length,amount_due:amount_due,amount_paid:amount_paid, status: status });  
})







app.listen(PORT, (error) => {       // Listen
  if(!error) console.log("Server is Successfully Running,and App is listening on port "+ PORT)
  else
      console.log("Error occured, server can't start", error);
  }
);
