const express = require("express");
const { google } = require("googleapis");

const app = express();
const sheets = google.sheets("v4");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  const {
    deletepermissions,
    firstname,
    lastname,
    updatedfirstname,
    updatedlastname,
    rownum,
    colnum,
    addnewuser,
    newnewemail,
    newpermissions,
  } = req.body;
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/drive",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "14T6QAGhhGGhHqGpKfH9tTJCLFs4BXYyCmmdIvXVMWDk";

  // Get all data about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });
  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A:B",
  });
  // Write rows to spreadsheet
  if (deletepermissions) {
    setTimeout(function () {
      var drive = google.drive({ version: "v3", auth: auth });
      drive.permissions.delete(
        {
          fileId: spreadsheetId,
          permissionId: "09927679628176496343",
        },
        (err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("deleted");
          console.log(res.data); // In this case, no values are returned.
        }
      );
    }, 3000);
  }
  if (firstname) {
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Sheet1!A:B",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[firstname, lastname]],
      },
    });
  }
  if (newpermissions) {
    var drive = google.drive({ version: "v3", auth: auth });
    var body = {
      type: "user",
      role: newpermissions,
      emailAddress: newnewemail,
    };
    drive.permissions.create(
      {
        fileId: spreadsheetId, //sheetID returned from create sheet response
        resource: body,
      },
      function (err, response) {
        if (err) {
          console.error(err);
          return;
        } else {
          console.log("Created a new permision:");
          //  console.log(response.data);
          console.log(JSON.parse(JSON.stringify(response)));
        }
      }
    );
  }
  if (updatedfirstname) {
    main(auth);
    async function main(auth) {
      const authClient = auth;
      console.log("update");

      let values = [
        ["mujeeb"],
        // Additional rows ...
      ];
      const request = {
        // The ID of the spreadsheet to update.
        spreadsheetId: spreadsheetId, // TODO: Update placeholder value.

        // The A1 notation of the values to update.
        range: `Sheet1!${rownum}:${colnum}`, // TODO: Update placeholder value.

        // How the input data should be interpreted.
        valueInputOption: "USER_ENTERED", // TODO: Update placeholder value.

        resource: {
          // TODO: Add desired properties to the request body. All existing properties
          // will be replaced.
          values: [[updatedfirstname, updatedlastname]],
        },

        auth: authClient,
      };

      try {
        const response = (await sheets.spreadsheets.values.update(request))
          .data;
        // TODO: Change code below to process the `response` object:
        console.log(JSON.stringify(response, null, 2));
      } catch (err) {
        console.error(err);
      }
    }
  }
  const { newemail, sheetname, permissions } = req.body;

  if (newemail) {
    googleSheets.spreadsheets.create(
      {
        auth: auth,
        resource: {
          properties: {
            title: sheetname,
          },
        },
      },
      (err, response) => {
        if (err) {
          console.log(`The API returned an error: ${err}`);
          return;
        }
        console.log(response);
        var body = {
          type: "user",
          role: "reader",
          emailAddress: newemail,
        };
        var drive = google.drive({ version: "v3", auth: auth });
        drive.permissions.create(
          {
            fileId: response.data.spreadsheetId, //sheetID returned from create sheet response
            resource: body,
          },
          function (err, response) {
            if (err) {
              console.error(err);
              return;
            } else {
              console.log("Created a new spreadsheet:");
              //  console.log(response.data);
              console.log(JSON.parse(JSON.stringify(response)));
            }
          }
        );
      }
    );
  }

  res.send(getRows.data);
});

app.listen(1337, (req, res) => console.log("listening on port 1337"));
