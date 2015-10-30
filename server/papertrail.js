//creating a global server logger
logger = Winston;

logger.add(Winston_Papertrail, {
	levels: {
			debug: 0,
			info: 1,
			warn: 2,
			error: 3,
			auth: 4
		},
		colors: {
			debug: 'blue',
			info: 'green',
			warn: 'red',
			error: 'red',
			auth: 'red'
		},

		host: "logs.papertrailapp.com",
		port: Meteor.settings.papertrail.port, //this will be change from the papertrail account to account
        handleExceptions: true,
        json: true,
        colorize: true,
		logFormat: function(level, message) {
		return '[' + level + '] ' + message;
  }
});
logger.info(" =====> Meteor App restarted "+ new Date( Date.now()) +" <=====");


Meteor.methods( {
    // This method is used on the client side to send logs to papertrailapp.com
    clientLog: function ( message ) {
      check(message, String);
      logger.info( "client-side-log ", message );
    }
  }
);