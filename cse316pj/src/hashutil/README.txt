
To do sha256 hashing, use one of the following two implementations.

If your front end is using typescript, use typescript/Hashutil.ts

If your front end if using javascript, use javascript/Hashutil.js

You will need to install crypto-js

npm i crypto-js

For those using typescript, your need a types from for crypto-js to make it work and play nicely with typescript.

npm i @types/crypto-js

Install the appropriate Hashutil file anywhere in your front end source tree. In the modules that need it, you can access it as follows:

import { hashutil } from "<path>/Hashutil.{js,ts}"  // Fill in the path and correct extension!

...

// Below, email is the variable holding the string with
//   the user's email address and password is the variable
//   holding the string with the user's password
hashedPW = hashutil(email, password);

