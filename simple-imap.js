var Imap = require('imap'),
	MailParser = require('mailparser').MailParser,
	moment = require('moment')
	util = require('util'),
	events = require('events');

var SimpleImap = function(options) {
	this.options = options;
	this.imap = null;
	
	this.start = function() {
		if (this.imap === null) {
			this.imap = new Imap(this.options);

			var selfImap = this.imap,
				self = this;

			selfImap.on('ready', function() {
				self.emit('ready');

				selfImap.openBox(self.options.mailbox, false, function() {
					self.emit('open');
				});
			});

			selfImap.on('mail', function(num) {
				selfImap.search(['UNSEEN'], function(err, result) {
					if (result.length) {
						var f = selfImap.fetch(result, {
							markSeen: true,
							struct: true,
							bodies: ''
						});

						f.on('message', function(msg, seqNo) {
							msg.on('body', function(stream, info) {
								var buffer = '';

								stream.on('data', function(chunk) {
									buffer += chunk.toString('utf8');
								});

								stream.on('end', function() {
									var mailParser = new MailParser();
									
									mailParser.on('end', function(mailObject) {
										self.emit('mail', {
											from: mailObject.from,
											subject: mailObject.subject,
											text: mailObject.text,
											html: mailObject.html,
											date: moment(mailObject.date).format('YYYY-MM-DD HH:mm:ss')
										});
									});

									mailParser.write(buffer);
									mailParser.end();
								});
							});
						});
					}
				});
			});

			selfImap.on('end', function() {
				self.emit('end');
			});

			selfImap.on('error', function(err) {
				self.emit('error', err);
			});
			
			selfImap.on('close', function(hadError) {
				self.emit('close', hadError);
			});
		}
		
		this.imap.connect();
	}
	
	this.stop = function() {
		this.imap.destroy();
	}
	
	this.restart = function() {
		this.stop();

		if (arguments.length >= 1)
			this.options = arguments[0];

		this.start();
	}

	this.getImap = function() {
		return this.imap;
	}
};

util.inherits(SimpleImap, events.EventEmitter);

module.exports = SimpleImap
