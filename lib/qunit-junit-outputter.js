/**
 * This file is used with PhantomJS to output the results in an XML format that can be consumed by
 * Jenkins as a JUnit result file. 
 */

(function() {
	
	var __tmpModuleName = 100000;

	
	/**
	 * Class to hold each test case result information
	 * @param {Object} name the name of the test case
	 */
	var cModuleTestCaseResult = function() {
		this.start = new Date();
		this.failures = [];
		this.errors = [];
		this.result = null;
	};
	
	cModuleTestCaseResult.getFailureXml = function(details) {
		var message = details.message || "";
	    if (details.expected) {
	        if (message) {
	            message += ", ";
	        }
	        message = "expected: " + details.expected + ", but was: " + details.actual;
	    }
	    var xml = '<failure type="failed" message="' + message.replace(/"/g, '&quot;') + '"/>\n';
		return xml;
	};
	
	cModuleTestCaseResult.prototype.addTestDetails = function(details) {
		this.failures.push(details);
	};
	
	cModuleTestCaseResult.prototype.setResult = function(result) {
		this.result = result;
		this.end = new Date();
	}
	
	cModuleTestCaseResult.prototype.getXml = function(moduleName) {
		
		// If the result was never set, add to the errors list	
		if (!this.result) {
			this.errors.push('<error type="NoResultException" message="The result for the cModuleTestCaseResult was not set prior to the call to getXml" />')
		}
		
		// Construct the XML
		var name = this.result ? this.result.name : "undefined";
		var xml = ['\t\t<testcase name="', name, 
						'" classname="', moduleName,
						'" time="', (this.end - this.start) / 1000, 
						'">\n'];
	    
		// Go through all failures	
        for (var i = 0, l = this.failures.length; i < l; i++) {
            xml.push("\t\t\t", cModuleTestCaseResult.getFailureXml(this.failures[i]));
        }
		
		// Go through all errors
		for (var i = 0, l = this.errors.length; i < l; i++) {
            xml.push("\t\t\t", this.errors[i]);
        }
		
	    xml.push('\t\t</testcase>\n');
		return xml.join('');
	};
	
	/**
	 * Class to hold the test result information for a module
	 * @param {Object} name the module name
	 */
	var cModuleResult = function(name) {
		this.name = name;
		this.start = new Date();
		this.testCases = {};
		this.errors = [];
		this.result = null;
	};
	
	cModuleResult.prototype.addTestCaseResult = function(name) {
		if (!this.testCases[name]) {
			var testCaseResult = new cModuleTestCaseResult();
			this.testCases[name] = testCaseResult;
		}
		return this.testCases[name];
	}
	
	cModuleResult.prototype.setResult = function(result) {
		this.result = result;
		this.end = new Date();
	};
	
	cModuleResult.prototype.getXml = function(id) {
		if (!this.result) {
			this.errors.push("<system-err>The result for the cModuleResult was not set prior to the call to getXml</system-err>")
		}
		
		var failed = this.result ? this.result.failed : 0;
		var total = this.result ? this.result.total : 0;
		var errors = this.errors.length;
		
		// Construct the XML
		var xml = ['\t<testsuite id="', id, 
					'" package="', this.name, 
					'" name="', this.name, 
					'" errors="', errors, 
					'" failures="', failed, 
					'" tests="', total, 
					'" hostname="', window.location.hostname,
					'" timestamp="', this.start.toISOString(),
					'" time="', (this.end - this.start) / 1000, 
					'">\n'];
		for (var i in this.testCases) {
			xml.push(this.testCases[i].getXml(this.name));
		}
		
		for (var i = 0, l = this.errors.length; i < l; i++) {
            xml.push(this.errors[i]);
        }		
		
	    xml.push('\t</testsuite>');
		return xml.join('');
	};
	

	/**
	 * Constructor.  Will set the output marker based on the query string
	 * The outputMarker is used to mark each line of a QUnit console.log for use 
	 * with other programs
	 */
	var cJUnitOutputter = function() {
		var qs = window.location.search.replace('?', ''),
			queryArgs = qs.split('&'),
			queryParams = {};
		for(var i = 0, l = queryArgs.length; i < l; i++) {
			var tmp = queryArgs[i].split('=');
			queryParams[tmp[0]] = tmp.length > 0 ? tmp[1] : "";
		}
		
		// Set the indicator
		this.outputMarker = queryParams["outputMarker"] || "";
		this.outputFormat = queryParams["outputFormat"] || "junit";
		
		// Internal array of cModuleResult objects
		this.moduleResults = {};
		
	};
	
	/**
	 * Adds a new cModuleResult object to the internal collection
	 * @param {Object} name the name of the module.  If none provided, it will auto create one (number based)
	 */
	cJUnitOutputter.prototype.addModuleResult = function(name) {
		
		// If this module doesn't have a name, then use the tmpModuleName
		if (!name || name == '') {
			name = __tmpModuleName;
			__tmpModuleName++;
		}
		
		// Check to see if this module already exists.  If not, don't create it
		if (!this.moduleResults[name]) {
			var moduleResult = new cModuleResult(name);
			this.moduleResults[name] = moduleResult;
		}
		
		return this.moduleResults[name];
	};
	
	/**
	 * Initialize and override the default QUnit methods
	 */
	cJUnitOutputter.prototype.init = function() {
		
		// Log the start of the XML 
		var oThis = this;
		
		// Update some of the QUnit configs so that everything runs smoothly on every run
		QUnit.config.reorder = false;
		QUnit.config.blocking = false;
		
		// Override everything
		QUnit.begin = function() {
			this.begin.call(oThis)
		};
		QUnit.moduleStart = function(context) {
			this.moduleStart.call(oThis, context);
		};
		QUnit.moduleDone = function(context) {
			this.moduleDone.call(oThis, context);
		};
		QUnit.testStart = function(context){
			this.testStart.call(oThis, context);
		}
		QUnit.testDone = function(result){
			this.testDone.call(oThis, result);
		};
		QUnit.log = function(details){
			this.log.call(oThis, details);
		};
		QUnit.done = function(result){
			//this.done.call(oThis, result);
		};
	};
	
	/**
	 * Log a message to the console
	 * @param {Object} msg
	 */
	cJUnitOutputter.prototype.consoleLog = function(msg) {
		if (this.outputFormat == "console" || (this.outputFormat == "junit" && this.outputMarker != '')) {
			console.log(this.outputMarker + msg);
		}
	};
	
	/**
	 * Override the .begin method
	 */
	cJUnitOutputter.prototype.begin = function() {
		// nothing to do...
	};
	

	/**
	 * Override the .moduleStart method 
	 * @param {Object} context the current context for this module
	 */
	cJUnitOutputter.prototype.moduleStart = function(context) {
		this.addModuleResult(context.name);
	};
	
	/**
	 * Override the .moduleDone method 
	 * @param {Object} result the result after running this module
	 */
	cJUnitOutputter.prototype.moduleDone = function(result) {
		this.moduleResults[result.name].setResult(result);
	};
	
	/**
	 * Override the .testStart method 
	 */
	cJUnitOutputter.prototype.testStart = function(context) {
		this.moduleResults[context.module].addTestCaseResult(context.name);
	};
	
	/**
	 * Override the .testDone method 
	 * @param {Object} result the result after running this test
	 */
	cJUnitOutputter.prototype.testDone = function(result) {
		this.moduleResults[result.module].testCases[result.name].setResult(result);
	};
	
	/**
	 * Override the .log method 
	 * @param {Object} details log information
	 */
	cJUnitOutputter.prototype.log = function(details) {
		
		// only log if the result failed
		if (details.result) {
	        return;
	    }
		var c = QUnit.config.current;
		if (c.module && c.testName) {
			this.moduleResults[c.module].testCases[c.testName].addTestDetails(details);
		}
	};
	
	/**
	 * Override the .done method 
	 * @param {Object} result the overall result information for this test suite
	 */
	cJUnitOutputter.prototype.done = function(result) {
		return result.failed > 0 ? 1 : 0;
	};
	
	/**
	 * Get the entire JUnit XML result for all test suites
	 */
	cJUnitOutputter.prototype.writeXML = function() {
		this.consoleLog('<?xml version="1.0" encoding="UTF-8"?>');
		this.consoleLog('<testsuites>');
		var j = 0;
		for (var i in this.moduleResults) {
			this.consoleLog(this.moduleResults[i].getXml(j));
			j++;
		}
		this.consoleLog('</testsuites>');
	};
	
	/**
	 * Writes a system error to the output.  Used if there was a major system error.
	 * @param {String} msg the error message to write
	 */
	cJUnitOutputter.prototype.writeSystemError = function(msg) {
		this.consoleLog('<?xml version="1.0" encoding="UTF-8"?>');
		this.consoleLog('<testsuites>');
		this.consoleLog('<system-err>' + msg.replace(/"/g, '&quot;') + '</system-err>');
		this.consoleLog('</testsuites>');
	};
	
	// Instanciate a new object and initialize it.  
	// Place it in the document scope so that it can be accessed later from phantomjs-qunit-runner.js
	document.oJUnitOutputter = new cJUnitOutputter();
	document.oJUnitOutputter.init();

})();
