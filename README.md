# PhantomJS QUnit Runner

Run your QUnit tests using PhantomJS.  The scripts will output the results in a JUnit XML format that can be integrated into your favorite CI environment, like Jenkins.

## Requirements



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