/**
 * Batch Account Creation Script
 *
 * This script automates the process of creating multiple user accounts
 * by filling out a web form with predefined user data and submitting it.
 * It uses sessionStorage to keep track of the current user being processed,
 * allowing the script to resume or continue across page reloads.
 *
 * Features:
 * - Iterates through a list of user objects containing account details.
 * - Fills out form fields for username, email, password, first name, and last name.
 * - Selects "Japan" from a dropdown menu if available.
 * - Submits the form for each user sequentially.
 * - Alerts the user after each account is created, showing the username and sequence number.
 * - Alerts when all accounts have been created.
 *
 * Usage:
 * - Place this script on the account creation page.
 * - Ensure the form fields and dropdown have the expected IDs and classes.
 * - Reload the page to process the next user in the list.
 *
 * Usage (Recommended):
 * - Remove all the comments.
 * - Merge all the lines into a single line.
 * - Create a bookmark staring with the merged line prefixed by `javascript:`.
 * - Open the account creation page.
 * - Click the bookmark to run the script.
 * - After the account is created, reload the page and click the bookmark again to create the next account.
 *
 * Note:
 * - This script is intended for automation/testing purposes.
 * - Modify the signUpList array to add or change users.
 * - To merge all lines into a single line, you can use vim to visual select all and press `J`. 
 *   Or use notepad++ to replace `\n` with empty string with regular expression mode on.
 * - Should you have any questions, feel free to contact Ka-lip in Ansys.
 */
var signUpList = [
  {
    firstname: "Taro",
    lastname: "Sato",
    email: "sato.taro@mail.com",
    username: "tanaka.sato",
    password: "tanaka.sato",
  },
  {
    firstname: "Hanako",
    lastname: "Suzuki",
    email: "suzuki.hanako@mail.com",
    username: "suzuki.hanako",
    password: "suzuki.hanako",
  },
];
let getCurrentNumber = () =>
  parseInt(sessionStorage.getItem("CURRENT_NUMBER"), 10) || 0;

function createUser(user) {
  const { username, password, email, firstname, lastname } = user;

  document.getElementById("username").value = username;
  document.getElementById("email").value = email;
  document.getElementById("password").value = password;
  document.getElementById("repassword").value = password;
  document.getElementById("firstname").value = firstname;
  document.getElementById("lastname").value = lastname;

  const dropdown = document.querySelector(".ui.dropdown");
  const item = dropdown?.querySelector('[data-value="Japan"]');
  if (item) item.click();

  document.getElementById("submit").click();
}

let currentNumber = getCurrentNumber();
if (currentNumber < signUpList.length) {
  const user = signUpList[currentNumber];
  createUser(user);

  alert(
    `Account Created: ${user.username}\nUser seq (1-based): ${currentNumber + 1}`,
  );
  sessionStorage.setItem("CURRENT_NUMBER", currentNumber + 1);
} else {
  alert("All accounts have been created.");
}
