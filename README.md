# PhantomJS QUnit Runner

Run your QUnit tests using PhantomJS.  The scripts will output the results in a JUnit XML format that can be integrated into your favorite CI environment, like Jenkins.

## Requirements/Assumptions

* QUnit 1.5.0.  Not tested with other versions
* You are using Ant to build your project.  While this hasn't been tested with any other build scripts, porting over to another should be fairly simple as all of the logic is contained in the JavaScript files
* These build scripts assume you are using a Linux server with PhantomJS installed at /usr/local/bin/phantomjs.  I may add in some logic to check for where PhantomJS is installed in the future, but changing this location is farily straightforward.
* I'm assuming you will want these results outputted to an XML file that can be consumed by your CI environment.  Since most CI environments have support for JUnit, I'm using the JUnit XML format.  If you want to use something else, simply change the way the XML is constructed and returned in cModuleResult.getXml(), cModuleTestCaseResult.getXml() and cModuleTestCaseResult.getFailureXml().

## Build example

I have included a build folder that has an simple example Ant script to use in your builds.  There are 2 targets here - ci-qunit-tests and ci-run-qunit-test.  ci-qunit-tests will contain a number of calls to ci-run-qunit-test so that you can run as many QUnit tests as you like in just one Ant target.  By default, I have failonerror set to false, so that it won't fail the entire build, but feel free to adjust as you see fit.

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
[PhantomJS] (http://phantomjs.org/)
[QUnit] (http://docs.jquery.com/QUnit)

## Notes

Finally, while this is written for QUnit, porting this over to use another JavaScript unit testing framework, like Jasmine, should be easy.  As long as the testing framework has hooks into similiar start/done methods as QUnit you can update the cJUnitOutputter.init method to call the cJUnitOutputter methhods where appropriate.