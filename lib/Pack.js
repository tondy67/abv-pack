/**
 * Pack to ArrayBuffer 'flat' object with binary properties
 */
"use strict";

const $isBrowser = typeof window !== "undefined" && window;

const $sum = (arr) => {
		return arr.reduce(function(a, b) { return a + b; }, 0);
	};

const $toString = (obj) => {
		let r = "[" + obj + "]";
		try{ r = JSON.stringify(obj); }catch(e){}
		return r;
	};

const $fromString = (s) => {
		let r = {};
		try{ r = JSON.parse(s); }catch(e){}
		return r;
	};
	
const $ab2str = (buf) => { 
		let r = "-1";
		try{ 
			const dv = new DataView(buf);
			const len = buf.byteLength / 2;
			const u16 = new Uint16Array(len);
			for (let i=0; i<len; i++) {
				u16[i] = dv.getUint16(i*2);
			}
			r = String.fromCharCode.apply(null, u16); 
		}catch(e){}
		return r;
	};

const $str2ab = (str) => {
		if (typeof str !== 'string') str = "-1";
		const buf = new ArrayBuffer(str.length*2);
		const dv = new DataView(buf);
		for (let i in str) {
			dv.setUint16(i*2,str.charCodeAt(i));
		}
		return buf;
	};

class Pack
{
	constructor(limit=2097152) // 2 MB
	{ 
		this._limit = limit; 
		this._debug = process.env.DEBUG ? true : false;
	}
	
	get limit(){ return this._limit; }

	encode(obj)
	{
		let r = null;
		if(!obj) return r;

		const bufs = [];
		const keys = [];
	
		Object.keys(obj).forEach((key,index) => {
			if (!obj[key]) return;
		
			if (obj[key] instanceof Buffer){
			//	if ($isBrowser){
				// because of browserify buffer
				obj[key] = obj[key].buffer.slice(obj[key].byteOffset, 
					obj[key].byteOffset + obj[key].byteLength);					
			//	}else{
			//		obj[key] = obj[key].buffer; 
			//	}
			}

			if (obj[key] instanceof ArrayBuffer){
				keys.push(key);
				bufs.push(obj[key]);
				delete obj[key];
			}
		});
		
		let sbuf = $str2ab(keys.join(',')); 
		bufs.unshift(sbuf);
		sbuf = $str2ab($toString(obj)); 
		bufs.unshift(sbuf);

		const sizes = [];
		for (let it of bufs) sizes.push(it.byteLength);
		const sum = $sum(sizes);
		sizes.unshift(sizes.length);

		const total = sum + (sizes.length + 1)*4;
		if (total > this.limit) return this.err(96);

		const buf = new ArrayBuffer(total);
		const dv = new DataView(buf);
		dv.setUint32(0,total);
		let pos = 4;
		for (let it of sizes){
			dv.setUint32(pos,it);
			pos += 4;
		}
	
		const u8 = new Uint8Array(buf);
		sizes.shift();
		for (let it of bufs){
			u8.set(new Uint8Array(it),pos);
			pos += sizes.shift();
		}

		r = buf; 
		if (r.byteLength > this.limit) return this.err(115);
	
		return r;
	}
		
	decode(buf)
	{
		let r = null;
		if (!buf) return r;
		
		if (buf.byteLength > this.limit) return this.err(125);

		if (buf instanceof Buffer){ //buf = new Uint8Array([...buf]).buffer;//buf = buf.buffer;
			buf = buf.buffer.slice(buf.byteOffset, 
				buf.byteOffset + buf.byteLength);					
		}

		if (!(buf instanceof ArrayBuffer)) return r;

		let len = buf.byteLength;
		if (len < 8) return r;
		const dv = new DataView(buf);
		const total = dv.getUint32(0);	
		if (total != len) return r;

		try{
			const bufs = [];
			const sizes = [];
			len = dv.getUint32(4) + 2;
			for (let i=2; i<len; i++) {
				sizes.push(dv.getUint32(i*4));
			}
			let pos = len*4;
			r = $fromString($ab2str(buf.slice(pos,pos+sizes[0])));	
			pos += sizes[0];
			const keys = $ab2str(buf.slice(pos,pos+sizes[1])).split(',');
			pos += sizes[1];
			for (let i=2; i<sizes.length; i++) {
				bufs.push(buf.slice(pos,pos+sizes[i])); 
				pos += sizes[i];
			}
			for (let i in keys){
				if (keys[i]) r[keys[i]] = bufs[i];
			}
		}catch(e){ 
			if (this._debug) console.error(160,e); 
		}
	
		return r;	
	}

	err(line=100)
	{
		if (this._debug) console.error('Pack.js ['+ line + '] Limit: ' + this.limit);
		return null;
	}

}// Pack


module.exports = Pack;
