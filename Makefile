.PHONY: lint start
lint:
	jshint index.js src

start:
	node server.js

build.zip: node_modules $(shell find src -type f) index.js
	zip build.zip -r node_modules src index.js -x *.swp
