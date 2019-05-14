# Setup for Glitch

To run the example on Glitch, configure the project's `.env` file with an access token, account id, and the signer's name and email. If the .env file doesn't exist, create it via the Glitch editor.

When you're finished, your `.env` file will look like:

````
ACCESS_TOKEN=eyJ0eXMtNjg5ODEyMjAzMzE3In0.AQkAAAABAAUABwCArVRKniTWSAgAgO13WOEk1kgCAFCYSRTxQ4RBlE9V5f7RiHAVAAEAAAAYAAEAAAAFAAAADQAkAAAAZTQyMjI0NGUtZDE1ZC00NmVlLTkzOGItNjMzM2YzYTU4NjllEgABAAAABwAAAG1hbmFnZWQwAIBTt--VJNZI.zTfbXodiyMZxAhMYXBFqpqRRDTKe48nms63dcGtXPGJ8g39i1awdql3bXikEQbzA72uOkVQMUL-vPyyWDSqN8qG2g0r6OXPG1Fx4Jfw3yb4zm7YYfiIG559Mxt2TU0kUOW1aPUr3XEDAD387jCx1AxWukp6uqMFuGVOfsdOLomAwTgZTgJKd7B9RYlB4_fsbJkkq_txFAft4rNQ2rzpbD2tkV104kgPlioKQ-ubTk4b88bzvm5XS6FV7WNu9GDGOeP7dHxtVLREVy7bPxVUOlM1e7tWvMxhJM8KbKIofLlABlYpzpSAe85sDYjWfm4NSPqbq_n8w0vD75s6v4l0--w
ACCOUNT_ID=123456
USER_FULLNAME="Larry Smith"
USER_EMAIL=larry@example.com
````

**Notes:** 
1. The Access Token is very long.
1. There are two formats for DocuSign Account IDs, the short form and the long form. Either can be used.

**Obtaining the values for the settings:**
* **Access token:** Use the [OAuth Token Generator](https://developers.docusign.com/oauth-token-generator).
  To use the token generator, you'll need a 
  [free DocuSign Developer's account.](https://go.docusign.com/o/sandbox/)
* **Account Id:** After logging into the [DocuSign Sandbox system](https://demo.docusign.net),
  you can copy your Account Id from the dropdown menu by your name. See the figure:
  
  ![Figure](https://raw.githubusercontent.com/docusign/qs-02-node-send-envelope/master/documentation/account_id.png)
* **Signer name and email:** Remember to try the DocuSign signing ceremony using both a mobile phone and a regular
  email client.
