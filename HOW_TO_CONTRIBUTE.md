## How to Contribute to Roundware Web Framework

# Setup

```bash
git clone https://github.com/roundware/roundware-web-framework.git
cd roundware-web-framework
npm install
npm test
```

# Workflow

npm test # run test suite
ROUNDWARE_DEBUG=true npm test # send logging statements to STDOUT

npm run devstart && open http://localhost:9000 # Uses webpack to live-reload source code in your browser

npm run cover && open coverage/lcov-report/index.html # checks code coverage and opens a report in the browser
npm run check-coverage # make sure we have 100% unit test coverage; no excuses!

npm run build # see package.json for all the possible builds
```

# Unit Testing

Our standard is 100% unit test coverage. Run `npm run check-coverage && open coverage/lcov-report/index.html` to check.

# Documentation

* We aim for 100% documentation coverage. This is a good place to jump into the project - look for some undocumented methods and see if you can figure out what they do!
* All classes and methods should be documented with [JSDoc](http://usejsdoc.org/) comments. These are used to build the [project documentation site](https://roundware.github.io/roundware-web-framework/).

# How to Release

```bash
npm run docbuild # if needed, creates jsdoc HTML files in doc/, which powers the project site
export RW_VERSION=0.0.1-alpha.??
npm version $RW_VERSION # also creates a git tag
npm run build
unset RW_VERSION
git push && git push --tags
npm publish --tag alpha
```

> TODO eventually we will move this to travis CI
