var QUnit = require("steal-qunit");
var stache = require("can/view/stache/");
require("can/view/import/");
var getIntermediateAndImports = require("can/view/stache/intermediate_and_imports");

QUnit.module("can/view/import");

var test = QUnit.test;
var equal = QUnit.equal;


test("static imports are imported", function(){
	var iai = getIntermediateAndImports("<can-import from='can/view/import/test/hello'/>" +
		"<hello-world></hello-world>");

	equal(iai.imports.length, 1, "There is one import");
});

test("dynamic imports are not imported", function(){
	var iai = getIntermediateAndImports("{{#if a}}<can-import from='can/view/import/test/hello'>" +
		"<hello-world></hello-world></can-import>{{/if a}}");

	equal(iai.imports.length, 0, "There are no imports");
});

test("dynamic imports will only load when in scope", function(){
	expect(4);

	var iai = getIntermediateAndImports("{{#if a}}<can-import from='can/view/import/test/hello'>" +
		"{{#eq state 'resolved'}}<hello-world></hello-world>{{/eq}}</can-import>{{/if a}}");
	var template = stache(iai.intermediate);

	var a = can.compute(false);
	var res = template({ a: a });

	equal(res.childNodes[0].childNodes.length, 0, "There are no child nodes immediately");
	a(true);

	can["import"]("can/view/import/test/hello").then(function(){
		equal(res.childNodes[0].childNodes.length, 1, "There is now a nested component");
		equal(res.childNodes[0].childNodes[0].tagName.toUpperCase(), "HELLO-WORLD", "imported the tag");
		equal(res.childNodes[0].childNodes[0].childNodes[0].nodeValue, "Hello world!", "text inserted");
	}).then(QUnit.start);


	QUnit.stop();
});

test("if a can-tag is present rendering is handed over to that tag", function(){
	var iai = getIntermediateAndImports("<can-import from='can/view/import/test/hello' can-tag='loading'/>");
	can.view.tag("loading", function(el){
		var template = stache("it worked");
		can.appendChild(el, template());
	});
	var template = stache(iai.intermediate);

	var res = template();
	equal(res.childNodes[0].childNodes[0].nodeValue, "it worked", "Rendered with the can-tag");
});

test("can use an import's value", function(){
	var template = "<can-import from='can/view/import/test/person' [person]='{value}' />hello {{person.name}}";

	var iai = getIntermediateAndImports(template);

	var renderer = stache(iai.intermediate);
	var res = renderer(new can.Map());

	can["import"]("can/view/import/test/person").then(function(){
		equal(res.childNodes[2].nodeValue, "world", "Got the person.name from the import");
	}).then(QUnit.start);

	QUnit.stop();
});
