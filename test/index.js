/**
 * Test Pack.js
 */
"use strict";

const log = console.log.bind(console);
const assert = require('assert');
const Pack = require('../index.js');
const pack = new Pack();

const a16 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
const a8 = [0,1,2,3,4,5,6,7];
const a4 = [0,1,2,3];

const a1 = new Uint8Array(a16);
const a2 = new Uint8Array(a8);
const a3 = new Uint8Array(a4);

//ts.log(a1.length);
const o = {	cmd:1, body:'This is a test', to:'xsdcvfrtgbfvfcs' };

const ob = {
	cmd:4,
	buf1: a1.buffer,
	buf2: a2.buffer,
	buf3: a3.buffer,
	child: {name: 'child'},
	to:'xsdcvfrtgbfvfcs'
};

const ob2a = [0,0,0,198,0,0,0,5,0,0,0,114,0,0,0,28,0,0,0,16,0,0,0,8,0,0,
	0,4,0,123,0,34,0,99,0,109,0,100,0,34,0,58,0,52,0,44,0,34,0,99,0,104,
	0,105,0,108,0,100,0,34,0,58,0,123,0,34,0,110,0,97,0,109,0,101,0,34,0,
	58,0,34,0,99,0,104,0,105,0,108,0,100,0,34,0,125,0,44,0,34,0,116,0,111,
	0,34,0,58,0,34,0,120,0,115,0,100,0,99,0,118,0,102,0,114,0,116,0,103,
	0,98,0,102,0,118,0,102,0,99,0,115,0,34,0,125,0,98,0,117,0,102,0,49,
	0,44,0,98,0,117,0,102,0,50,0,44,0,98,0,117,0,102,0,51,0,1,2,3,4,5,6,
	7,8,9,10,11,12,13,14,15,0,1,2,3,4,5,6,7,0,1,2,3];	

const u8s = (buf) => { return new Uint8Array(buf).toString(); }

describe('Pack.encode', function() {
	describe('bin object', function() {
	  	it('returns ArrayBuffer', function() {
	    	const r = pack.encode(ob);//console.log(u8s(r));
	    	const t = ob2a.join(',');
	    	assert.equal(u8s(r), t, 'Pack.encode(ob) is ' + t);
	  	});
	});
	describe('null object', function() {
	  	it('returns null', function() {
	    	const r = pack.encode(null); 
	    	assert.equal(r, null, 'Pack.encode(null) is null');
	  	});
	});
});

describe('Pack.decode', function() {
	describe('bin object', function() {
	  	it('returns decoded object', function() {
		  	const u8 = new Uint8Array(ob2a);
		  	const buf = u8.buffer;
			const r = pack.decode(buf); 
			assert.equal(r.cmd, 4, 'r.cmd = 4');
			assert.equal(r.to, 'xsdcvfrtgbfvfcs', 'r.to = "xsdcvfrtgbfvfcs"');
			assert.deepEqual(r.child, {name: 'child'}, 'r.child = {name: "child"}');
			assert.equal(u8s(r.buf1), a16.join(','), 'r.buf1 = ' + a16);
			assert.equal(u8s(r.buf2), a8.join(','), 'r.buf2 = ' + a8);
			assert.equal(u8s(r.buf3), a4.join(','), 'r.buf3 = ' + a4);
	  	});
	});
	describe('null object', function() {
	  	it('returns null', function() {
			const r = pack.decode(null);
			assert.equal(r, null, 'Pack.decode(null) is null');
	  	});
	});

});
