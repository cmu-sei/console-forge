Run the test cases of wmkssdk
========================

## Install Tools

1. Install nodejs (http://nodejs.org/download/).
   This will provide the "npm" command for installing other JS packages.

2. Install grunt-cli globally on your system:
    npm install -g grunt-cli

This will add the "grunt" command which is invoked later.  This only needs to
be done once.  You may need to manually add the "grunt" tool to your PATH.


## Download Node Libraries

This can be done in a single step:
    npm install

Doing this will place a bunch of node libraries within the node_modules


## Unit Tests
Prepare source files:
	Cause wmksskd depends on the webmks component, before run the test
	cases, need to prepare source files :
	1 ) download webmks source code from https://git.eng.vmware.com/?p=webmks.git;
    2 ) copy the wmks folder to wmkssdk/test/

Prepare jquery-ui library
	download jquery-ui.js from http://jqueryui.com, copy it into
	wmkssdk/test/lib

Run unit tests by typing:
    grunt test
or just
	grunt

This will immediately run all the unit tests and report the status on
the command line before exiting.

## jasmine html report
After you run the unit tests, jasmine html report will be generated
in:
	wmkssdk/test/karma_html/

## Code Coverage

Whenever you run the unit tests, code coverage will be generated
in:
    wmkssdk/test/coverage/report-html/index.html

Just open the file in a browser and refresh as needed.