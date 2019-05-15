/**
 * This is a quick start example of creating and sending an envelope to be signed. 
 * Language: Node.js
 * 
 * See the Readme and Setup files for more information.
 * 
 * Copyright (c) DocuSign, Inc.
 * License: MIT Licence. See the LICENSE file.
 * 
 * This example does not include authentication. Instead, an access token
 * must be supplied from the Token Generator tool on the DevCenter or from
 * elsewhere.
 * 
 * This example also does not look up the DocuSign account id to be used.
 * Instead, the account id must be set. 
 * 
 * For a more production oriented example, see:
 *   JWT authentication: https://github.com/docusign/eg-01-node-jwt 
 *   or Authorization code grant authentication. Includes express web app:
 *      https://github.com/docusign/eg-03-node-auth-code-grant 
 * @file index.js
 * @author DocuSign
 * @see <a href="https://developers.docusign.com">DocuSign Developer Center</a>
 */
require("dotenv").config();
const docusign = require('docusign-esign')
  , path = require('path')
  , fs = require('fs')
  , process = require('process')
  , basePath = 'https://demo.docusign.net/restapi'
  , express = require('express')
  , envir = process.env
  , bodyParser = require("body-parser");

  ;

async function sendEnvelopeController(req, res) {
  const qp = req.query;
  // Fill in these constants or use query parameters of ACCESS_TOKEN, ACCOUNT_ID, USER_FULLNAME, USER_EMAIL
  // or environment variables.

  // Obtain an OAuth token from https://developers.hqtest.tst/oauth-token-generator
  const accessToken = req.body.auth;

  // Obtain your accountId from demo.docusign.com -- the account id is shown in the drop down on the
  // upper right corner of the screen by your picture or the default picture. 
  const accountId = req.body.accountId;

  const groupId = req.body.groupId;

  // The document you wish to send. Path is relative to the root directory of this repo.
  const fileName = 'file.pdf';

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  /**
   *  The envelope is sent to the provided email address. 
   *  One signHere tab is added.
   *  The document path supplied is relative to the working directory 
   */
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
  // Set the DocuSign SDK components to use the apiClient object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // Create the envelope request
  // Start with the request object
  const envDef = new docusign.EnvelopeDefinition();
  //Set the Email Subject line and email message
  envDef.emailSubject = req.body.emailSubject.toString();
  envDef.emailBlurb = req.body.emailContent.toString();

  // Read the file from the document and convert it to a Base64String
  const pdfBytes = fs.readFileSync(path.resolve(__dirname, fileName))
    , pdfBase64 = pdfBytes.toString('base64');

  // Create the document request object
  const doc = docusign.Document.constructFromObject({
    documentBase64: pdfBase64,
    fileExtension: 'pdf',  // You can send other types of documents too.
    name: 'Sample document', documentId: '1'
  });

  // Create a documents object array for the envelope definition and add the doc object
  envDef.documents = [doc];

  // Create the signer object with the previously provided name / email address
  const signer = docusign.Signer.constructFromObject({ signingGroupId: groupId, routingOrder: '1', recipientId: '1' });

  // Create the signHere tab to be placed on the envelope
  const signHere = docusign.SignHere.constructFromObject({
    documentId: '1',
    pageNumber: '1', recipientId: '1', tabLabel: 'SignHereTab',
    xPosition: '195', yPosition: '147'
  });

  // Create the overall tabs object for the signer and add the signHere tabs array
  // Note that tabs are relative to receipients/signers.
  signer.tabs = docusign.Tabs.constructFromObject({ signHereTabs: [signHere] });

  // Add the recipients object to the envelope definition.
  // It includes an array of the signer objects. 
  envDef.recipients = docusign.Recipients.constructFromObject({ signers: [signer] });
  // Set the Envelope status. For drafts, use 'created' To send the envelope right away, use 'sent'
  envDef.status = 'sent';

  // Send the envelope
  let envelopesApi = new docusign.EnvelopesApi()
    , results
    ;

  try {
    results = await envelopesApi.createEnvelope(accountId, { 'envelopeDefinition': envDef })
  } catch (e) {
    let body = e.response && e.response.body;
    if (body) {
      // DocuSign API exception
      res.json(body);
    } else {
      // Not a DocuSign exception
      throw e;
    }
  }
  // Envelope has been created:
  if (results) {
    res.json(results);
  }
}


function downloadFile(sendEnvelopeController, request, respond) {
  const fs = require('fs');
  const readline = require('readline');
  const { google } = require('googleapis');
  const mime = require("mime-types");

  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = 'token.json';

  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), listFiles);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  /**
   * Lists the names and IDs of up to 10 files.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listFiles(auth) {
    var folderid = "1btDX5ThQ04nb6DS_sqAw5s9PHQ1Ylf0Q"; // Folder ID. This script downloads files in the folder with this folder ID.
    var outputExtension = "pdf"; // Extension of output file. This is adapted to only Google Docs.

    var outputMimeType = mime.lookup(outputExtension);
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({

      q: "'" + folderid + "' in parents and trashed=false",
      fields: "files(id, name,mimeType)"
    }, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);

        return;
      }
      response.data.files.forEach(function (e) {

        if (e.name.includes("file") && e.mimeType.includes("application/pdf")) {
          var dlfile = fs.createWriteStream(e.name);

          drive.files.get({
            fileId: e.id,
            alt: "media"
          }, { responseType: 'stream' }, function (err, res) {

            if (res !== null && res !== undefined) {
              res.data
                .on('end', function () {
                  console.log(e.name + " downloaded");
                  setTimeout(() => sendEnvelopeController(request, respond), 5000);
                }).on('error', function (err) {
                  console.log(err)

                })
                .pipe(dlfile);
            }

          }


          );
        }
      });
    });
  }
}

// The mainline
const port = process.env.PORT || 3000
  , app = express()
    .use(bodyParser.urlencoded({extended:false}))
    .use(bodyParser.json())
    .post("/api/kjwjefwefef",(req,res)=>{
      
      downloadFile(sendEnvelopeController, req, res);

    })
    .listen(port);
console.log(`Your server is running on ${port}`);

