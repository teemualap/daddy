test:
	./node_modules/.bin/mocha --reporter list
.PHONY: test

build:
	babel src --out-dir lib
.PHONY: build

develop:
	babel src --watch --out-dir lib
.PHONY: develop