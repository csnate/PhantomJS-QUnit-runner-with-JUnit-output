# PhantomJS QUnit Runner with JUnit output

Run your QUnit tests using PhantomJS. The scripts will output the results in a JUnit XML format that can be integrated into your favorite CI environment, specifically Jenkins.

## Requirements/Assumptions

* QUnit 1.5.0.  Not tested with other versions
* You are using Ant to build your project. While this hasn't been tested with any other build scripts, porting over to another should be fairly simple as all of the logic is contained in the JavaScript files
* These build scripts assume you are using a Linux server with PhantomJS installed at /usr/local/bin/phantomjs, however you can change this by updating the phantomjs.executable property in the build script (NOTE - has not been tested on Windows)
* I'm assuming you will want these results outputted to an XML file that can be consumed by your CI environment. Since most CI environments have support for JUnit, I'm using the JUnit XML format. If you want to use something else, simply change the way the XML is constructed and returned in cModuleResult.getXml(), cModuleTestCaseResult.getXml() and cModuleTestCaseResult.getFailureXml().
* All tests MUST include qunit-junit-outputter.js in the file, otherwise the XML will not be written.  An example test is included at example-test.html.

## Build example

I have included a build folder that has an simple example Ant script to use in your builds.  There are 2 targets here - ci-qunit-tests and ci-run-qunit-test.  ci-qunit-tests will contain a number of calls to ci-run-qunit-test so that you can run as many QUnit tests as you like in just one Ant target.  By default, I have failonerror set to false, so that it won't fail the entire build, but feel free to adjust as you see fit.  

Also, there are 3 properties that must be set at the top of the build file:  
* folder.test
    * This is the location of where all test XML files will live
* folder.lib 
	* This is the path to the lib folder that contains the phantom-qunit-runner.js file
* phantomjs.executable
	* This is the path on the build server to the PhantomJS executable

## Parameters for ci-run-qunit-test

The target ci-run-qunit-test takes the following parameters:
* test.url - REQUIRED
    * this is the full url to the test file you want PhantomJS to run.
	* EX: http://localhost/WS/tests/some-test.html
* test.result.file - REQUIRED
    * this is the output XML file that will be produced.  The file should be saved in your local workspace.
	* EX: ./build/TESTS/some-test.tests.xml
* test.timeout - OPTIONAL
    * this is a timeout value (in milliseconds) that the runner will use before it considers the test to have failed.  Default is 30 seconds (30000).
	
## Links
[PhantomJS](http://phantomjs.org/)
[QUnit Docs](http://docs.jquery.com/QUnit)
[QUnit Repo](https://github.com/jquery/qunit)

## Notes

A lot of this work started when I was looking how to integrate QUnit tests into our build and found a blog post by [Eric Wendelin](http://eriwen.com/tools/continuous-integration-for-javascript/) and his [javascript-stacktrace](https://github.com/eriwen/javascript-stacktrace) GitHub repo. I've taken most of his work there, made the JavaScript more robust/testable/extensible, and ported the build over to Ant.  

I know what you're going to ask - why didn't you just use the junitlogger and phantomjs addons included in the QUnit repo? Because I could never get them to work with asynchronus tests or with a large number of tests at the same time, so I developed something more complete.  Also, no solution I've seen correctly handles other console.log statements in your code.

Finally, while this is written for QUnit, porting this over to use another JavaScript unit testing framework, like Jasmine, should be easy. As long as the testing framework has hooks into similiar start/done methods as QUnit you can update the cJUnitOutputter.init method to call the cJUnitOutputter methhods where appropriate.