/**
 * The following file was taken from https://github.com/eriwen/javascript-stacktrace, specifically 
 * https://github.com/eriwen/javascript-stacktrace/blob/master/test/lib/phantomjs-qunit-runner.js
 * 
 * Modifications were made to follow the new conventions for PhantomJS and wrap in a private class
 */
(function() {
	
	var cPhantomJsQUnitRunner = function() {
		
	};
	
	cPhantomJsQUnitRunner.prototype.outputFormat = 'junit';
	cPhantomJsQUnitRunner.prototype.timeout = 10000;
	cPhantomJsQUnitRunner.prototype.url = '';
	
	// private
	function getFinalUrl = function(obj) {
		return obj.url + '?'
			+ 'outputFormat=' + obj.outputFormat;
	};
	
	/**
	 * Initialize the runner.  
	 * Will set the appropriate properties based on what's passed via arguments
	 */
	cPhantomJsQUnitRunner.prototype.init = function() {
		var system = require('system');
		
		// Make sure this is valid
		if (system.args.length === 1) {
		    console.log('Usage: phantomjs-test-runner.js <some URL> [--outputformat=<junit>] [--timeout=<10000>]');
		    phantom.exit(1);
			this.canRun = false;
			return;
		}
		
		// Set the properties
	    var args = system.args.slice(1);
			this.url = args.shift();
	    window.console.debug = function(){ };
		
		for (var i = 0, l = args.length; i < l; i++) {
			var arg = args[i],
				lcarg = arg.toLowerCase();
			
			// setting the output format
			if (arg.indexOf('--outputformat=') == 0) {
				this.outputFormat = arg.replace('--outputformat=', '');
			}
			
			// setting the timeout value
			else if (arg.indexOf('--timeout') == 0) {
				this.timeout = Number(arg.replace('--timeout=', '')) || 10000;
			}
		}
		
		// Set the outputFormat
		phantom.outputFormat = this.outputFormat;
		this.canRun = true;

	};
	
	/**
	 * Run it
	 */
	cPhantomJsQUnitRunner.prototype.run = function() {
		if (!this.canRun) return;
		
		var oThis = this;
		var page = require('webpage').create();
		
		// Can be used for logging page errors, but shouldn't be needed
//		page.onError = function(msg, trace) {
//			console.log("### Page Error - " + msg);
//			trace.forEach(function(item) {
//		        console.log('  ', item.file, ':', item.line);
//		    })
//		};
		
		// Open the page
		var url = getFinalUrl(this);
		page.open(url, function(status){
		
			function waitFor(testFx, onReady, timeOutMillis) {
				var maxtimeOutMillis = timeOutMillis || 3001,
					start = new Date().getTime(),
					condition = false,
					interval = setInterval(function() {
						if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
							// If not time-out yet and condition not yet fulfilled
							condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
						} else {
							if(!condition) {
								// If condition still not fulfilled (timeout but condition is 'false')
								var msg = 'waitFor() timeout - ' + maxtimeOutMillis;
								console.log(document.oJUnitOutputter ? document.oJUnitOutputter.getSystemError(msg) : msg;
								phantom.exit(1);
							} else {
								// Condition fulfilled (timeout and/or condition is 'true')
								console.debug("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
								typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
								clearInterval(interval); //< Stop this interval
							}
						}
					}, 300);
			};
			
		    if (status !== "success") {
				var msg = 'Unable to access network at - ' + url;
				console.log(document.oJUnitOutputter ? document.oJUnitOutputter.getSystemError(msg) : msg;
		        phantom.exit(1);
		    }
		    else {
		        waitFor(function(){
		            return page.evaluate(function(){
						// Get the number of tests that have passed
						var el = document.getElementById('qunit-testresult');
						return el && el.innerHTML.match(/completed/gi) ?
							 Number(el.getElementsByClassName('total')[0].innerHTML) > 0
							 : false;
 
		            });
		        }, function(){
		            var failedNum = page.evaluate(function() {
		                var el = document.getElementById('qunit-testresult');
		                try {
		                    return el.getElementsByClassName('failed')[0].innerHTML;
		                } 
		                catch (e) {
		                }
		                return 10000;
		            });
		            
					// Writing the XML here instead of QUnit.done because QUnit.done is (sometimes) called multiple times and can't be trusted
		            page.evaluate(function() {
		                if (document.oJUnitOutputter) {
		            		console.log(document.oJUnitOutputter.getXML());
		            	}
		            });

		            phantom.exit((parseInt(failedNum, 10) > 0) ? 1 : 0);
		        }, oThis.timeout + 1);
		    }
		});
	};
	
	var oPhantomJsQUnitRunner = new cPhantomJsQUnitRunner();
	oPhantomJsQUnitRunner.init();
	oPhantomJsQUnitRunner.run();
	
})();
