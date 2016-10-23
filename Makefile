.PHONY: lint start test
lint:
	jshint index.js src test

start:
	node server.js

build.zip: node_modules $(shell find src -type f) index.js
	zip -q build.zip -r node_modules src index.js -x *.swp

test:
	npm test
