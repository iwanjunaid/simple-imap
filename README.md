simple-imap
===========

Simple imap listener for Node.js.

## Installation

```
npm install simple-imap
```

## Usage

```javascript
var SimpleImap = require('simple-imap');

var options = {
	user: '<your username>',
	password: '<password>',
	host: '<imap host>',
	port: 993,
	tls: true,
	mailbox: 'INBOX'
};

var simpleImap = new SimpleImap(options);

simpleImap.on('error', function(err) {
	console.log(err);
});

simpleImap.on('mail', function(mail) {
	console.log(mail);
});

simpleImap.start();
```