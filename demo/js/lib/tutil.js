/**
 * Created with JetBrains WebStorm.
 * User: jinjingcao
 * Date: 12-8-29
 * Time: 下午9:02
 * To change this template use File | Settings | File Templates.
 */
TUtil = window.TUtil || {};

!function() {
	window.$ = function(id) {
		return document.getElementById(id);
	};
	window.$$ = function(sel, els) {
		//修改 container支持数组和nodelist下的过滤
		
		if(sel&&sel.nodeType===1||TUtil.object.getType(sel) === 'nodelist'){
			return TUtil.array.toArray(sel);
		}
		if (els && els.nodeType && els.nodeType === 1 || els == window || els == document) {
			els = [els];
		} else if (TUtil.object.getType(els) === 'nodelist') {
			els = TUtil.array.toArray(els);
		} else if (TUtil.object.getType(els) === 'array') {} else {
			els = [document]
		}

		var ret = [];
		els.forEach(function(el){
			ret = ret.concat( TUtil.array.toArray( el.querySelectorAll(sel) ) );
		})
		return ret;
	};
}();


/**********************TUtil**************************/
!function(tutil) {
	tutil.EMPTY_FUN = function() {};

	tutil.tmpl = function(str, data) {
		var fn = !/\W/.test(str) ? tmpl_cache[str] = tmpl_cache[str] || QPHOTO.util.tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
		return data ? fn(data) : fn;
	}

	tutil.tmpl.timeFormat = function(timestamp) {
		var nt = new Date().getTime() / 1000;
		var ut = timestamp; //upload time
		var vt = nt - ut;
		if (vt <= 0) {
			return '刚刚';
		}
		var date = new Date(ut * 1000);
		var now = new Date(nt * 1000);
		if (vt < 60) {
			return Math.floor(vt) + "秒前";
		} else if (vt < 60 * 60) {
			return Math.floor(vt / 60) + "分钟前";
		} else if (vt < 60 * 60 * 24) {
			if (date.getDate() == now.getDate()) {
				return "今天" + date.getHours() + ":" + (date.getMinutes() > 9 ? date.getMinutes() : ("0" + "" + date.getMinutes()));
			} else {
				return "昨天" + date.getHours() + ":" + (date.getMinutes() > 9 ? date.getMinutes() : ("0" + "" + date.getMinutes()));
			}
		} else if (vt < 60 * 60 * 24 * 2) {
			if (date.getDate() == (new Date(nt * 1000 - 60 * 60 * 24 * 1000 - 1)).getDate()) {
				return "昨天" + date.getHours() + ":" + (date.getMinutes() > 9 ? date.getMinutes() : ("0" + "" + date.getMinutes()));
			} else {
				return "前天" + date.getHours() + ":" + (date.getMinutes() > 9 ? date.getMinutes() : ("0" + "" + date.getMinutes()));
			}

		} else if (vt < 60 * 60 * 24 * 3) {
			if (date.getDate() == (new Date(nt * 1000 - 60 * 60 * 24 * 2 * 1000 - 1)).getDate()) {
				return "前天" + date.getHours() + ":" + (date.getMinutes() > 9 ? date.getMinutes() : ("0" + "" + date.getMinutes()));
			} else {
				return (date.getMonth() + 1) + "月" + date.getDate() + "日";
			}
		} else if ((new Date(nt * 1000).getFullYear()) == date.getFullYear()) {
			return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		} else {
			return (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
		}
	}
	//日期
	var _crtDate = null;
	TUtil.tmpl.dayFormat = function(timestamp, lastTimeCheck){

		var nt = new Date().getTime() / 1000;
		var ut = timestamp; //upload time
		var vt = nt - ut;
		var date = new Date(ut * 1000);
		var now = new Date(nt * 1000);
		var dM = date.getMonth(), dD = date.getDate();
		if(lastTimeCheck && _crtDate == [dM, dD].join("-")){	
			return '';
		}
		_crtDate = [dM, dD].join("-");

		if(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() == new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()){
			return '<span class="date-num">今天</span>';
		}else if( new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() == new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() ){
			return '<span class="date-num">昨天</span>';
		}else if((new Date(nt * 1000).getFullYear()) == date.getFullYear()) {
			return '<span class="date-num">' + (date.getMonth() + 1) + '</span>月<span class="date-num">' + date.getDate() + "</span>日";
		}else{
			return '<span class="date-num">' + date.getFullYear() + '</span>年<span class="date-num">' + (date.getMonth() + 1) + '</span>月<span class="date-num">' + date.getDate() + "</span>日";
		}
	}

	//小时
	TUtil.tmpl.hourFormat = function(timestamp){
		var date = new Date(timestamp * 1000);
		//todo
		return date.getHours() + ":" + (date.getMinutes() > 9 ? date.getMinutes() : ("0" + "" + date.getMinutes()));
	}

	tutil.tmpl.replaceMentionPattern = function(value) {
		if (value = trim(value)) {
			var mentionPattern = /(?:@\{uin:([^\}]*),nick:([^\}]*?)(?:,who:(\d))?\})|[^@]+/g;
			value = value.replace(mentionPattern, function($0, uin, nick, who) {
				if (uin) {
					uin = trim(uin);
					nick = nick.replace(/\%2C|%25|%7D/g, function(str) {
						switch (str) {
						case '%2C':
							return ',';
						case '%25':
							return '%';
						case '%7D':
							return '}';
						}
						return str;
					});
					return ['<a ' + QZTouch.Module.Common.getUserLink(uin, who) + '>@', nick, '</a>'].join('');
				}
				return $0;
			});
		}
		return value;
	},

	/**
	 * 类继承
	 * @param _Cld
	 * @param _Prt
	 */
	tutil.extend = function(_Cld, _Prt) {
		var fn = TUtil.EMPTY_FUN;
		fn.prototype = _Prt.prototype;

		_Cld.prototype = new fn(); //_Prt();
		_Cld.constructor = _Cld;
		//				_Cld.prototype.constructor = _Cld;
		return _Cld;
	}
}(TUtil);

/**********************TUtil.object**************************/
!function(tutil) {
	var $Object = {
		extend: function(to, from) {
			for (var i in from) {
				to[i] = from[i];
			}
			return to;
		},
		each: function(obj, cb) {
			if (obj instanceof Array) {
				for (var i = 0, l = obj.length; i < l; i++) {
					cb(obj[i], i);
				}
			} else {
				for (var i in obj) {
					cb(obj[i], i);
				}
			}
		},
		getType: function(obj) {
			return obj === null ? 'null' : (obj === undefined ? 'undefined' : Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
		}
	};

	tutil.object = $Object;
}(TUtil);

/**********************TUtil.lang**************************/
!function(tutil) {
	var type = tutil.object.getType;
	var lang ={
		isFunction:function (o) {
			return type(o)==='function';
		},
		isString:function (o) {
			return type(o)==='string';
		},
		isArray:function (o) {
			return type(o)==='array';
		},
		isNumber:function (o) {
			return type(o)==='number';
		},
		//maybe some browswer not support!
		inArray:function (arr,elem){
			return !!~arr.indexOf(elem);
		}
		//isPlainObject
	}
	tutil.lang = lang;
}(TUtil);
/**********************TUtil.string**************************/
!function(tutil) {
	var $String = function() {
			var res = [/&/g, /</g, />/g, /\x27/g, /\x22/g],
				rep = ['&amp;', '&lt;', '&gt;', '&#039;', '&quot;'],
				resO = ["<", ">", "\x27", "\x22", "&"],
				repO = [/&lt;?/g, /&gt;?/g, /&#039;?/g, /&quot;?/g, /&amp;?/g];

			var regSp = /(&[a-z]+;?|)/;

//			var temdiv = document.createElement("div");

			return {
				trim: function(str) {
					return (str || "").replace(/^\s+|\s+$/g, '');
				},
				escHTML: function(str) {
					var ret = str || "";
					for (var i = 0, l = res.length; i < l; i++) {
						ret = ret.replace(res[i], rep[i]);
					}

					return ret;
				},
				restHTML: function(str) {
					var ret = (str||"");//.split(regSp);
					for (var i = 0, l = repO.length; i < l; i++) {
						ret = ret.replace(repO[i], resO[i]);
					}
					return ret;
//					temdiv.innerHTML = str||"";
//					return temdiv.textContent||temdiv.text;
				},
				format: function() {
					var _reg = /\{([\w]+)\}/g;
					return function(str, obj) {
						return (str || "").replace(_reg, function(m, n) {
							var v = obj[n];
							return v !== undefined ? v : m;
						});
					}
				}()
			}
		}();

	window.restHTML = $String.restHTML;
	window.escHTML = $String.escHTML;
	window.trim = $String.trim;


	tutil.string = $String;
}(TUtil);

/**********************TUtil.array**************************/
!function(tutil) {
	tutil.array = {
		toArray: function(arr) {
			var ret = [];
			for (var i = 0; i < arr.length; i++) {
				ret[i] = arr[i];
			}
			return ret;
		}
	};
}(TUtil);

/**********************TUtil.cookie**************************/
!function(tutil) {
	var $Cookie = function() {
		var domainPrefix = document.domain||"";
		return{
			/**
			 * 设置一个cookie
			 * 简单得说，子域可以获取根域下的cookie, 但是根域无法获取子域下的cookie.
			 * @param {String} name cookie名称
			 * @param {String} value cookie值
			 * @param {String} domain 所在域名
			 * @param {String} path 所在路径
			 * @param {Number} hour 存活时间，单位:小时
			 * @return {Boolean} 是否成功
			 * @example
			 *  QZFL.cookie.set('value1',QZFL.dom.get('t1').value,"qzone.qq.com","/v5",24); //设置cookie
			 */
			set : function(name, value, domain, path, hour) {
				if (hour) {
					var expire = new Date();
					expire.setTime(expire.getTime() + 3600000 * hour);
				}
				document.cookie = name + "=" + value + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + domainPrefix + ";"));
				return true;
			},

			/**
			 * 获取指定名称的cookie值
			 *
			 * @param {String} name cookie名称
			 * @return {String} 获取到的cookie值
			 * @example
			 *		 QZFL.cookie.get('value1'); //获取cookie
			 */
			get : function(name) {
				//ryan
				//var s = ' ' + document.cookie + ';', pos;
				//return (pos = s.indexOf(' ' + name + '=')) > -1 ? s.slice(pos += name.length + 2, s.indexOf(';', pos)) : '';

				var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"), m = document.cookie.match(r);
				return (!m ? "" : m[1]);
			},

			/**
			 * 删除指定cookie,复写为过期
			 *
			 * @param {String} name cookie名称
			 * @param {String} domain 所在域
			 * @param {String} path 所在路径
			 * @example
			 *		 QZFL.cookie.del('value1'); //删除cookie
			 */
			del : function(name, domain, path) {
				document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + domainPrefix + ";"));
			}
		}
	}();

	tutil.cookie = $Cookie;
}(TUtil);


/**********************TUtil.JSON**************************/
!function(tutil) {
	var $JSON = function() {
			var
			escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
				meta = { // table of character substitutions
					'\b': '\\b',
					'\t': '\\t',
					'\n': '\\n',
					'\f': '\\f',
					'\r': '\\r',
					'"': '\\"',
					'\\': '\\\\'
				};

			function quote(string) {
				// If the string contains no control characters, no quote characters, and no
				// backslash characters, then we can safely slap some quotes around it.
				// Otherwise we must also replace the offending characters with safe escape
				// sequences.
				escapable.lastIndex = 0;
				return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
					var c = meta[a];
					return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}) + '"' : '"' + string + '"';
			}


			function stringify(obj) { //只用于简单object对象
				var ret = [],
					v = "";
				for (var i in obj) {
					v = obj[i];
					v = v !== undefined ? v : "";
					//				if(Object.prototype.hasOwnProperty.call(v, i)){
					//debugger
					switch (typeof v) {
					case 'string':
						v = quote(v);
						break;
					case 'object':
						v = stringify(v);
						break;
						//						case 'boolean':
						//							v=v+'';
						//							break;
					case 'function':
						continue;
					}

					ret.push('"' + i + '":' + v);

				}

				return '{' + ret + '}';
			}

			return {
				stringify: function() {
					return window.JSON && JSON.stringify ? JSON.stringify : stringify
				}(),
				parse: function(str, _ref) {
					str = str || "{}";
					var ret = {};
					try {
						ret = (new Function("return (" + str + ")"))();
					} catch (e) {
						_ref.message = e.message;
						throw new Error("JSON.parse => parse数据格式错误:" + str);
					}
					return ret;
				}
			}
		}();
		//原生JSON 有parse 和 stringify 应优选判断JSON
	tutil.JSON = window.JSON || $JSON;
}(TUtil);

/**********************TUtil.QueryString**************************/
!function(tutil) {
	var $QueryString = function() {
			var re = /"/g, _regSQuery=/^\?/; //JSON.parse时候，双引号值会引发异常
			var tool = {
				/**
				 * http参数表对象变为HTTP协议数据串，如：param1=123&amp;param2=456
				 * @param {object} o 用来表示参数列表的hashTable
				 * @returns {string} 结果串
				 * @example QZFL.util.genHttpParamString({"param1":123, "param2":456});
				 */
				genHttpParamString: function(o) {
					return this.commonDictionaryJoin(o, null, null, null, window.encodeURIComponent);
				},

				/**
				 * 将一个http参数序列字符串变为表映射对象
				 * @param {string} s 源字符串
				 * @returns {object} 结果
				 * @example QZFL.util.splitHttpParamString("param1=123&param2=456");
				 */
				splitHttpParamString: function(s) {
					s= s.replace(_regSQuery,"");
					return this.commonDictionarySplit(s, null, null, null, window.decodeURIComponent);
				},

				commonDictionarySplit: function(s, esp, vq, eq, valueHandler) {
					var res = {},
						l, ks, vs, t, vv;

					if (!s || typeof(s) != "string") {
						return res;
					}
					if (typeof(esp) != 'string') {
						esp = "&";
					}
					if (typeof(vq) != 'string') {
						vq = "";
					}
					if (typeof(eq) != 'string') {
						eq = "=";
					}

					l = s.split(esp); //a="1=2"tt"&b="2"s=t" -> a="1=2"tt"     b="2"s=t"
					if (l && l.length) {
						for (var i = 0, len = l.length; i < len; ++i) {
							ks = l[i].split(eq); //a="1=2"tt" -> a    "1    2"tt"
							if (ks.length > 1) {
								t = ks.slice(1).join(eq); //"1=2"tt"
								vs = t.split(vq);
								vv = vs.slice(vq.length, vs.length - vq.length).join(vq);
								res[ks[0]] = (typeof valueHandler == 'function' ? valueHandler(vv) : vv);
							} else {
								ks[0] && (res[ks[0]] = true); //没有值的时候直接就用true作为值
							}
						}
					}

					return res;
				},

				commonDictionaryJoin: function(o, esp, vq, eq, valueHandler) {
					var res = [],
						t, ok;

					if (!o || typeof(o) != "object") {
						return '';
					}
					if (typeof(o) == "string") {
						return o;
					}
					if (typeof(esp) != 'string') {
						esp = "&";
					}
					if (typeof(vq) != 'string') {
						vq = "";
					}
					if (typeof(eq) != 'string') {
						eq = "=";
					}

					for (var k in o) { //debugger
						ok = (o[k] + "");
//						ok = (o[k] + "").replace(re, "\\\"");//todo check 双引号异常问题
						res.push(k + eq + vq + (typeof valueHandler == 'function' ? valueHandler(ok) : ok) + vq);
					}

					return res.join(esp);
				}

			}


			return {
				stringify: function(obj) {
					return tool.genHttpParamString(obj);
				},
				parse: function(str) {
					return tool.splitHttpParamString(str);
				},
				getParameter: function(name) {
					var r=new RegExp("(\\?|#|&)" + name + "=([^&#?]*)(&|#|\\?|$)"),
						m = location.href.match(r);
					return decodeURIComponent(!m ? "" : m[2]);
				}
			}
		}();

	tutil.QueryString = $QueryString;
}(TUtil);

/**********************TUtil.Ajax**************************/
!function(tutil) {
	var sequence = 0;
	/**
	 * 请求抽象类
	 * @param uri
	 * @param paras
	 * @param fmt
	 * @param method
	 * @param config 其他配置 valueStat
	 * 
	 */
	var Request = function(uri, paras, method, config) {
		this.uri=uri.indexOf("http://") <0 ? Request._cgi_base+uri : uri;
		this.paras = paras || {};
		this.method = (method || "get").toLocaleLowerCase();

		this.successPool = [];
		this.errorPool = [];
		this.completePool = [];
		this._st = new Date().getTime();
		this.seq = sequence++;
		this._tmr = null;
		this.config = TUtil.object.extend({
			//返回码自动上报
			valueStat : true,
			sucRate : 1,
			errRate : 1
		}, config);
	};
	Request.prototype.success = function(fun) {
		fun && this.successPool.push(fun);
		return this;
	};
	Request.prototype.error = function(fun) {
		fun && this.errorPool.push(fun);
		return this;
	};
	Request.prototype.complete = function(fun) {
		fun && this.completePool.push(fun);
		return this;
	};
	/**
	 * 发送请求虚方法
	 */
	Request.prototype.send = function(){
		var pool = this._beforeRequestPlugins, request = this;
		TUtil.object.each(pool, function(item) {
			item.apply(request, [request]);
		});
		clearTimeout(this._tmr);

		this._send();

		var me = this;
		this._tmr = setTimeout(function() {//debugger
			var response = new Response(TUtil.JSON.stringify({
				code: -999,//-998,前端错误码统一-999，用subcode区分
				subcode : 3,
				message: "请求超时",
				data: me.getRequestInstance().responseText
			}), me.getRequestInstance().status, me.seq, me);
			var pool = me._beforeResponsePlugins, request = me;
			TUtil.object.each(pool, function(item) {
				item.apply(request, [response, request]);
			});

			me.onError(response);
			me.abort();
		}, 10000);

		pool = this._afterRequestPlugins, request = this;
		TUtil.object.each(pool, function(item) {
			item.apply(request, [request]);
		});
		return this;
	};
	Request.prototype._send = TUtil.EMPTY_FUN;
	Request.prototype.abort = TUtil.EMPTY_FUN;
	Request.prototype.onCode = function(code, fun){
		if(code && fun) {
			this["code_"+code] = fun;
		}
		return this;
	};
	Request.prototype.getRequestInstance = function(arg){return{responseText:"-",status:""}};
	Request.prototype._onCallback = TUtil.EMPTY_FUN;
	Request.prototype.onCallback = function() {
		clearTimeout(this._tmr);

		var arg = arguments, ins = this.getRequestInstance(arg), responseText = ins.responseText,
			response = new Response(responseText, ins.status, this.seq, this);

		var pool = this._beforeResponsePlugins, request = this;
		TUtil.object.each(pool, function(item) {
			item.apply(request, [response, request]);
		});

		this._onCallback.apply(this, [response, request]);

//		pool = this._afterResponsePlugins, request = this;
//		TUtil.object.each(pool, function(item) {
//			item.apply(request, [response, request]);
//		});

		return this;
	},
	Request.prototype.onSuccess = function(response) {
		//成功的返回码上报
//		this.config.valueStat && new ValueStat(this.uri, 1, response.subcode, response._et - this._st, this.config.sucRate);

		var pool = this.successPool, request = this;
		TUtil.object.each(pool, function(item) {
			item(response, request);
		});

		this.onComplete(response);
	};
	Request.prototype.onError = function(response) {
//		this.config.valueStat && new ValueStat(this.uri, 2, response.subcode, response._et - this._st, this.config.errRate);
		//登录特殊逻辑 -->  提取到common.js
//		var u=location.href;
//		if(response.code == -3000 && confirm('您现在处于未登录状态，请先登录')){
//			if(u.indexOf("sid=")<0){
//				u=u.replace(/\?/, "?sid=&");
//			}
//			location.href = 'http://pt.3g.qq.com/s?aid=touchLogin&t=qzone&bid_code=qzoneLogin&go_url=' + encodeURIComponent(u);
//			return;
//		}
//		var pool = this._beforeResponsePlugins, request = this;
//		if(this.code!=-999) {
//			TUtil.object.each(pool, function(item) {
//				item.apply(request, [response, request]);
//			});
//		}

		var pool = this.errorPool, request = this;
		TUtil.object.each(pool, function(item) {
			item(response, request);
		});

		this.onComplete(response);
	};
	Request.prototype.onComplete = function(response) {//debugger
		var pool = this.completePool, request = this;
		TUtil.object.each(pool, function(item) {
			item(response, request);
		});

		var pool = this._afterResponsePlugins, request = this;
		TUtil.object.each(pool, function(item) {
			item.apply(request, [response, request]);
		});

//		response.dispose();
	};
	Request.prototype.dispose = function() {
		for (var i in this) {
			this[i] = null;
		}
	};
	Request.prototype._beforeRequestPlugins=[];//请求发起前插件
	Request.prototype._afterRequestPlugins=[];//请求发起后插件
	Request.prototype._beforeResponsePlugins=[];//处理响应前插件
	Request.prototype._afterResponsePlugins=[];//处理响应后插件
	Request._cgi_base = location.protocol + "//" + location.host;


	/**
	 * 响应抽象类
	 * @param respData
	 * @param status
	 * @param seq
	 */
	var Response = function(respData, status, seq, origReq) {
		this.status = status || -1;
		this.code = -1;
		this.data = null;
		this._et = new Date().getTime();
		this.seq = seq || -1; //响应时序
		this.origReq=origReq||{};
		try{
			this.parseData(respData);
		}catch(ex){
			this.parseData('{"code":1, "message":"数据异常"}');
		}

		if (this.code && Response[this.code]) {
			Response[this.code](this.data, this.dataText);
		}
	};
	Response.prototype.parseData = function(rd) {//debugger
		this.dataText = rd;
		var _ref={};
		// 用户搞火星文,有控制字符会有bug
		try {
			var dt = this.dataEntity = TUtil.JSON.parse(rd || '{}', _ref);
		} catch(ex) {
			var dt = this.dataEntity = TUtil.JSON.parse(rd.replace(/[\x00-\x1F\x7F-\x9F]/g,"") || '{}', _ref);
		}

		this.data = dt.data || null;
		this.code = dt.code !== undefined ? ~~dt.code : -999;

		this.subcode = ~~dt.subcode;
		if(!this.subcode){
			if(rd===""){
				this.subcode = -1999997;//返回内容为空
				try{
					if(this.origReq.xhr.getAllResponseHeaders()){
						this.subcode = -1999996;//响应体为空
					}else{
						this.subcode = -1999995;//响应头响应体都为空(无法触达的分支)
					}
				}catch(e){}
			}else if(this.status >= 500){
				this.subcode = 7;
			}else if(this.status >= 400){
				this.subcode = 8;
			}else if(dt.subcode === undefined){
				this.subcode = -1999999;
			}else if(_ref.message){
				this.subcode = 1;//数据异常
			}else{
	//			this.subcode = ~~dt.subcode;
			}
		}
		this.message = dt.message || "";
	};
	Response.prototype.stringifyData = function() {
		return this.dataText;
	};
	Response.prototype.dispose = function() {
		for (var i in this) {
			this[i] = null;
		}
	};


	var Ajax = TUtil.extend(function() {
		Request.apply(this, arguments);

		this.xhr = createXHRInstance();
	}, Request);
	TUtil.object.extend(Ajax.prototype, {
		getRequestInstance : function(xhr, seq) {//debugger
			return {responseText:this.xhr.responseText.replace(/^_Callback\(|\);\n$/g, ''), status:this.xhr.readyState==4?this.xhr.status:-504};
		},
		_send: function() { //debugger
			var xhr = this.xhr,
				method = this.method,
				//				fmt = this.fmt,
				me = this,
				paras = TUtil.QueryString.stringify(me.paras),
				uri = (method == "post"||!paras) ? this.uri : this.uri.indexOf("?") < 0 ? this.uri + '?' + paras : this.uri + '&' + paras;


			xhr.onreadystatechange = function() {
//				alert(xhr.readyState);
				if (xhr.readyState === 4) {
					me.onCallback(xhr, me);
					//					if(xhr.status === 200 || xhr.status === 204) {
					//						var responseText = xhr.responseText;
					//						me.onSuccess(new Response(responseText, xhr.status, fmt));
					//					} else {
					//						me.onError(new Response("{}", xhr.status));
					//					}
				}
			};

			xhr.open(method, uri, !this.sync);
			try {
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			} catch (e) {}
			try {
				xhr.send(paras || null);
			} catch (e) {
				var response = new Response(TUtil.JSON.stringify({
					code: -999,
					subcode : 5,
					message: e.message,
					data: xhr.responseText
				}), xhr.status, me.seq, me);
				var pool = me._beforeResponsePlugins, request = me;
				TUtil.object.each(pool, function(item) {
					item.apply(request, [response, request]);
				});

				me.onError(response);
			}

			return this;
		},
		_onCallback : function(response, request) {//debugger
			var xhr = this.xhr;
			var responseText = xhr.responseText,
				response = response||new Response(responseText, xhr.status, this.seq, this);

			if (xhr.status == 200 || xhr.status == 204 || xhr.status == 304 || xhr.status === 0) {//兼容cache，没有ie的场景，不比较1223
				/**
				 * 绑定oncode回调
				 */
				if(this["code_"+response.code]) {
					this["code_"+response.code](response);
					this.onComplete(response);
				}else{
					!~~response.code ? this.onSuccess(response) : this.onError(response);
				}
			} else {
				response = new Response(" ", xhr.status, this.seq, this);
				this.onError(response);
			}

		},
		abort: function() {
			clearTimeout(this._tmr);
			this.xhr.abort();
		}
	});

	Ajax.get = function(url, paras, succCb, errCb, compCb) {
		return new Ajax(url, paras, "get").success(succCb).error(errCb).complete(compCb).send();
	};
	Ajax.post = function(url, paras, succCb, errCb, compCb) {
		return new Ajax(url, paras, "post").success(succCb).error(errCb).complete(compCb).send();
	};
	Ajax.beforeRequest = function(fun){
		fun && Ajax.prototype._beforeRequestPlugins.push(fun);
	};
	Ajax.afterRequest = function(fun){
		fun && Ajax.prototype._afterRequestPlugins.push(fun);
	};
	Ajax.beforeResponse = function(fun){
		fun && Ajax.prototype._beforeResponsePlugins.push(fun);
	};
	Ajax.afterResponse = function(fun){
		fun && Ajax.prototype._afterResponsePlugins.push(fun);
	};
	Ajax.detachPlugins = function(handler, fun) {
		var pool = Ajax.prototype["_"+handler+"Plugins"];
		if(pool) {
			pool.splice(pool.indexOf(fun), 1);
		}
	}

	var createXHRInstance = window.XMLHttpRequest ?
	function() {
		return new window.XMLHttpRequest();
	} : function() {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	};

	tutil.Ajax = Ajax;
}(TUtil);

!function(tutil){
	var imported = {}	//导入的script
		, importedQueue = {};	//导入script回调队列
	tutil.imports = function(urls, scb) {
//		if(!urls instanceof Array){
//			urls = [urls];
//		}
		if(!urls) {
			scb && scb();
			return;
		}

		if(!imported[urls]) {
//			importedQueue[urls]=[];
			var script = imported[urls] = document.createElement("script");
			script.type = "application/javascript";
			!importedQueue[urls] && (importedQueue[urls] = [scb]);
			TUtil.event.on(script, "load", function(){
				script.setAttribute("loaded", 1);
				var fn;
				while(fn = importedQueue[urls].shift()){
					fn();
				}
			});
//			script.onload=scb;
			script.src = (urls.indexOf('http://') != 0 ?  PathUtil.getCPath() + urls :urls) + (window.g_App.js_version.indexOf("?")>-1?window.g_App.js_version:"?"+window.g_App.js_version);;
			document.body.appendChild(script);
		}else	if(imported[urls].getAttribute("loaded")) {
			scb && scb();
		}else{
			scb&&importedQueue[urls].push(scb);
		}

	};

//	QZTouch.dom.ready(function(){
		var scripts = document.getElementsByTagName("script"), sct;
		for(var i=0;i<scripts.length;i++){
			sct = scripts[i];
			if(sct.src) {
				imported[sct.src] = sct;
			}
		}
//	});
}(TUtil);

/**********************TUtil.event**************************/
!function(tutil) {
	//事件绑定 支持自定义事件
	var eventPool = {},
		specialEvents = {},
		eid = 0;
	specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

	// emulates the 'defaultPrevented' property for browsers that have none


	function fix(event) {
		if (!('defaultPrevented' in event)) {
			event.defaultPrevented = false
			var prevent = event.preventDefault
			event.preventDefault = function() {
					this.defaultPrevented = true
					prevent.call(this)
				}
		}
	}

	function $Event(type, props) {
		var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
		if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
		event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
		return event
	}
	var loadReg = /complete|loaded|interactive/;
	tutil.event = {
		on: function(els, events, fn) {
			//单个元素
			if (els && els.nodeType && els.nodeType === 1 || els == window || els == document) {
				els = [els];
			} else if (tutil.object.getType(els) === 'nodelist') {
				els = tutil.array.toArray(els);
			} else if (tutil.object.getType(els) === 'array') {} else {
				return false;
			}
			events = events.split(' ');
			els.forEach(function(el) {
				el.eid = el.eid || ++eid;
				eventPool[eid] = eventPool[eid] || {};
				events.forEach(function(event){
					eventPool[eid][event] = eventPool[eid][event] || [];
					eventPool[eid][event].push(fn);
					el.addEventListener(event, fn, false);
				})
			})
		},

		off: function(els, event, fn) {
			if (els && els.nodeType && els.nodeType === 1 || els == window || els == document) {
				els = [els];
			} else if (tutil.object.getType(els) === 'nodelist') {
				els = tutil.array.toArray(els);
			} else if (tutil.object.getType(els) === 'array') {} else {
				return false;
			}

			els.forEach(function(el) {
				if (typeof fn == 'undefined') {
					eventPool[el.eid] && eventPool[el.eid][event] && eventPool[el.eid][event].forEach(function(fn) {
						el.removeEventListener(event, fn, false);
					})
				} else {
					el.removeEventListener(event, fn, false);
				}
			})
		},

		trigger: function(els, event, data) {
			if (els && els.nodeType && els.nodeType === 1 || els == window || els == document) {
				els = [els];
			} else if (tutil.object.getType(els) === 'nodelist') {
				els = tutil.array.toArray(els);
			} else if (tutil.object.getType(els) === 'array') {} else {
				return false;
			}
			if (typeof event == 'string') event = $Event(event);
			fix(event);
			event.data = data;
			els.forEach(function(el) {
				el.dispatchEvent(event);
			})
		},

		ready: function(fn) {
			if (loadReg.test(document.readyState)) fn()
			else document.addEventListener('DOMContentLoaded', function() {
				fn()
			}, false)
		},
		load: function(fn) {
			if (loadReg.test(document.readyState)) return fn();
			TUtil.event.on(window, 'load', function() {
				fn();
			});
		},

		resize : (function(){
			var resizeTimer = null;
			var resizeFunc = [];
			var resizeHandle = function(e){
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function(){
					e.width = Math.max(window.innerWidth, document.body.clientWidth);
					e.height = window.innerHeight; 
					resizeFunc.forEach(function(fn){
						fn(e);
					})
				}, 300);
			};
			'onorientationchange' in window ? window.addEventListener('orientationchange', resizeHandle, false) : window.addEventListener('resize', resizeHandle, false);
			return function(fn){
				resizeFunc.push(fn);
			}
		})(),
		delegate : function() {
			return function(dCot, sel, event, fn, selDisable){
				tutil.event.on(dCot, event, function(ee){

					var filterDoms = [];
					//转成数组
					if (dCot && dCot.nodeType && dCot.nodeType === 1 || dCot == window || dCot == document) {
						dCot = [dCot];
					} else if (TUtil.object.getType(dCot) === 'nodelist') {
						dCot = TUtil.array.toArray(dCot);
					} else if (TUtil.object.getType(dCot) === 'array') {} else {
						dCot = [document]
					}
					dCot.forEach(function(el){
						filterDoms = filterDoms.concat(TUtil.lang.isString(sel)?[].slice.call(el.querySelectorAll(sel)):$$(sel, el));
					});

					var target = ee.srcElement||ee.target;
					var _idx = filterDoms.indexOf(target);
					if(_idx<0){
						for(var _j= 0, _jl=filterDoms.length, dom;_j<_jl;_j++) {
							dom = filterDoms[_j];
							if(dom.contains(target)){
								_idx = _j;
								break;
							}
						}
					}
					if(_idx>-1) {
						var fDom = filterDoms[_idx];
						var disDoms = [];
						dCot.forEach(function(el){
							disDoms = disDoms.concat($$(selDisable, el));
						})
						if(disDoms.indexOf(fDom)>-1) return;//选择器与dis选择器同一级的情况
						for(var _k= 0, _kl = disDoms.length, dom;_k<_kl;_k++) {
							dom = disDoms[_k];
							if(dom.contains(target)) {
								return;
							}
						}
						fn.apply(fDom, [ee, target]);
					}
				});
			}
		}(),
		getEvent:function (evt) {
			var evt = window.event || evt || null, c, _s = tutil.event.getEvent, ct = 0;
			if (!evt) {
				c = arguments.callee;
				while (c && ct < 6) {
					if ((evt = c.arguments[0]) && (typeof(evt.button) != "undefined" && typeof(evt.ctrlKey) != "undefined")) {
						break;
					}
					++ct;
					c = c.caller;
				}
			}
			return evt;
		}
	};

	//webview 高度修正

	//Zepto touch
	var touch = {},
		touchTimeout, tapTimeout, swipeTimeout, longTapDelay = 750,
		longTapTimeout

	function parentIfText(node) {
		return 'tagName' in node ? node : node.parentNode
	}

	function swipeDirection(x1, x2, y1, y2) {
		var xDelta = Math.abs(x1 - x2),
			yDelta = Math.abs(y1 - y2)
			return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
	}

	function longTap() {
		longTapTimeout = null
		if (touch.last) {
			tutil.event.trigger(touch.el, 'longTap')
			touch = {}
		}
	}

	function cancelLongTap() {
		if (longTapTimeout) clearTimeout(longTapTimeout)
		longTapTimeout = null
	}

	function cancelAll() {
		if (touchTimeout) clearTimeout(touchTimeout)
		if (tapTimeout) clearTimeout(tapTimeout)
		if (swipeTimeout) clearTimeout(swipeTimeout)
		if (longTapTimeout) clearTimeout(longTapTimeout)
		touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
		touch = {}
	}


	tutil.event.ready(function() {
		var now, delta

		tutil.event.on(document.body, 'touchstart', function(e) {
			now = Date.now()
			delta = now - (touch.last || now)
			touch.el = parentIfText(e.touches[0].target);
			touchTimeout && clearTimeout(touchTimeout)
			touch.x1 = e.touches[0].pageX
			touch.y1 = e.touches[0].pageY
			if (delta > 0 && delta <= 250) touch.isDoubleTap = true
			touch.last = now
			touch.isMove = false;
			longTapTimeout = setTimeout(longTap, longTapDelay)
		});

		tutil.event.on(document.body, 'touchmove', function(e) {
			cancelLongTap()
			touch.isMove = true;
			touch.x2 = e.touches[0].pageX
			touch.y2 = e.touches[0].pageY
		})

		tutil.event.on(document.body, 'touchend', function(e) {
			cancelLongTap()

			// swipe
			if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

			swipeTimeout = setTimeout(function() {
				tutil.event.trigger(touch.el, 'swipe');
				tutil.event.trigger(touch.el, 'swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
				touch = {}
			}, 0)

			// normal tap
			else if ('last' in touch && !touch.isMove)

			// delay by one tick so we can cancel the 'tap' event if 'scroll' fires
			// ('tap' fires before 'scroll')
			tapTimeout = setTimeout(function() {

				// trigger universal 'tap' with the option to cancelTouch()
				// (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
				var event = $Event('tap')
				event.cancelTouch = cancelAll
				tutil.event.trigger(touch.el, event);

				// trigger double tap immediately
				if (touch.isDoubleTap) {
					tutil.event.trigger(touch.el, 'doubleTap');
					touch = {};
				}

				// trigger single tap after 250ms of inactivity
				else {
					touchTimeout = setTimeout(function() {
						touchTimeout = null
						tutil.event.trigger(touch.el, 'singleTap')
						touch = {}
					}, 250)
				}

			}, 0)

		})
		tutil.event.on(document.body, 'touchcancel', cancelAll);
		tutil.event.on(window, 'scroll', cancelAll)
	})
}(TUtil);


/**
 * 动画
 * 只支持对元素的单个动画 多动画不支持
 */
(function(tutil) {

	var animateId = 0;

	var animatePool = {};
	var clearProperties = {};
	clearProperties['webkitTransitionProperty'] =
	clearProperties['webkitTransitionDuration'] = 
	clearProperties['webkitTransitionTimingFunction'] = '';

	//驼峰变-
	function camelToDash(str){
		return str.replace(/([a-z])([A-Z])/g,function($0,$1, $2){
			return $1 + '-' + $2.toLowerCase();
		}).replace(/(?!-)webkit/g, '-webkit');
	}

	tutil.animate = function(el, prop, duration, ease, callback) {
		return new fx(el, prop, duration, ease, callback);
	}

	tutil.animateStop = function(el, goEnd) {
		var fx = animatePool[el['data-animate']];
		var prop = TUtil.object.extend({}, clearProperties),
			transforms;
		if (fx) {
			clearTimeout(fx.timer);
			if (goEnd) {
				TUtil.object.extend(prop, fx.endProperties);
			} else {
				var comp = document.defaultView.getComputedStyle(el);
				for (var key in fx.properties) {
					if (supportedTransforms.test(key)) {
						prop['webkitTransform'] = comp['webkitTransform'];
					} else prop[key] = comp[key]
				}
			}
			TUtil.dom.setStyle(el, prop);
			delete animatePool[el['data-animate']];
		}
	}

	//transforms样式抓去
	var supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i;
	var use3d = /^((translate|rotate|scale)(Z|3d)|matrix(3d))$/i;

	//3D检测
	var has3d = "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix();

	var fx = function(el, properties, duration, ease, callback) {
		var transforms, cssProperties = {}, isuse3d = false,
			key, that = this
			duration = typeof duration == 'undefined' ? 400 : duration;
		this.el = el;
		this.id = animateId++;
		this.endProperties = {};
		this.properties = properties;
		this.el['data-animate'] = this.id;
		this.callback = callback;
		animatePool[this.id] = this;

		// CSS transitions
		for (key in properties) {
			if (supportedTransforms.test(key)) {
				transforms || (transforms = [])
				transforms.push(key + '(' + properties[key] + ')')
				if (!isuse3d && use3d.test(key)) {
					isuse3d = true;
				}
			} else this.endProperties[key] = cssProperties[key] = properties[key]
		}
		//相关测试 http://jsperf.com/translate3d-vs-xy/ 
		if(has3d && transforms && !isuse3d) {
			transforms.push('translateZ(0)');
			this.endProperties['translateZ'] = properties['translateZ'] = 0;
			cssProperties['webkitBackfaceVisibility'] = 'hidden';
		}
		if (transforms) this.endProperties['webkitTransform'] = cssProperties['webkitTransform'] = transforms.join(' ')

		//对于没有延迟的直接触发结束
		//作用类似setStyle
		if (duration == 0) {
			el.clientLeft;
			TUtil.dom.setStyle(el, cssProperties);
			that.callback && that.callback.call(that.el, []);
			return;
		}else{
			//设置transition
			//这里要取过滤后的 而且要把驼峰转为dash
			if(duration > 0){
				cssProperties['webkitTransitionProperty'] = camelToDash(Object.keys(cssProperties).join(', '))
				cssProperties['webkitTransitionDuration'] = duration / 1000 + 's'
				cssProperties['webkitTransitionTimingFunction'] = (ease || 'linear')
			}
			that.timer = setTimeout((function(that) {
				return function() {
					TUtil.dom.setStyle(el, clearProperties);
					that.callback && that.callback.call(that.el, []);
				}
			})(that), duration)

			//加个setTimeout 同步中多次setstyle会被合并 导致不渲染动画
			//20120919 改用获取clientLeft触发样式reflow 保证动画这里能渲染
			//http://gent.ilcore.com/2011/03/how-not-to-trigger-layout-in-webkit.html
			el.clientLeft;
			TUtil.dom.setStyle(el, cssProperties);
		}
		return this
	}
})(TUtil);

/**
 * css
 */
(function(tutil) {
	var _tmpDiv = document.createElement("div");
	tutil.dom = {
		hasClass : _tmpDiv.classList ? function(el,cls){
			return el.classList.contains(cls);
		} : function (el,cls) {
        	return el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
        },
         
        addClass : _tmpDiv.classList ? function(el,cls){
			el.classList.add(cls);
		} : function (el,cls) {
        	if (!this.hasClass(el,cls)) el.className += " "+cls;
        },
        removeClass :  _tmpDiv.classList ? function(el,cls){
			el.classList.remove(cls);
		} : function(el,cls) {
        	if (this.hasClass(el,cls)) {
            	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
            	//bug 这里removeClass('b') 会把 class="a b c" 变成class="ac"
            	//el.className=el.className.replace(reg,'')
        		el.className=el.className.replace(reg,' ');
        	}
        },
		getStyle: function(el, property) {
			if (!el || el.nodeType == 9) {
				return null;
			}

			var computed = document.defaultView.getComputedStyle(el, ''),
				value = "";

			switch (property) {
			case "float":
				property = "cssFloat";
				break;
			case "opacity":
				return parseFloat(computed[property]);
				break;
			case "backgroundPositionX":
				// 只有ie和webkit浏览器支持
				property = "backgroundPosition";
				return computed[property].split(" ")[0];
				break;
			case "backgroundPositionY":
				// 只有ie和webkit浏览器支持
				property = "backgroundPosition";
				return computed[property].split(" ")[1];
				break;
			}

			return computed[property];
		},
		setStyle: function(el, properties, value) {
			if (el.nodeType != 1) {
				return false;
			}

			var tmp, bRtn = true,
				w3cMode = (tmp = document.defaultView) && tmp.getComputedStyle,
				rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
			if (typeof(properties) == 'string') {
				tmp = properties;
				properties = {};
				properties[tmp] = value;
			}

			for (var prop in properties) {
				value = properties[prop];
				if (prop == 'float') {
					prop = "cssFloat";
				} else if (prop == 'backgroundPositionX' || prop == 'backgroundPositionY') {
					tmp = prop.slice(-1) == 'X' ? 'Y' : 'X';
					var v = tutil.dom.getStyle(el, "backgroundPosition" + tmp);
					prop = 'backgroundPosition';
					typeof(value) == 'number' && (value = value + 'px');
					value = tmp == 'Y' ? (value + " " + (v || "top")) : ((v || 'left') + " " + value);
				}
				if (typeof el.style[prop] != "undefined") {
					el.style[prop] = value + (typeof value === "number" && !rexclude.test(prop) ? 'px' : '');
					bRtn = bRtn && true;
				} else {
					bRtn = bRtn && false;
				}
			}
			return bRtn;
		},
		appendString : function(dom, str) {//debugger
			_tmpDiv.innerHTML = str;
			var frag = document.createDocumentFragment(), _tmp;
			while(_tmp = _tmpDiv.firstChild) {
				frag.appendChild(_tmp);
			}

			dom.appendChild(frag);
		},
		prependString : function(dom, str){
			_tmpDiv.innerHTML = str;
			var frag = document.createDocumentFragment(), _tmp;
			while(_tmp = _tmpDiv.firstChild) {
				frag.appendChild(_tmp);
			}

			dom.firstChild ? dom.insertBefore(frag, dom.firstChild) : dom.appendChild(frag);;
		},
		getScreenWidth : function(){
			return screen.width * this.getPixelRatio();;
		},
		getScreenHeight:function(){
			return screen.height * this.getPixelRatio();
		},
		getPixelRatio : function(){
			return  window.devicePixelRatio ? window.devicePixelRatio : 1;
		},
		//find the node in  the directly closet parentNodes,haven't pass unit test yet.
		//usage:TUtil.dom.closet(el,'.feed-mod');
		closest: function(elem,selector,context){
		  var ctx = context||document,
		  	  nodeLists = [].slice.call(ctx.querySelectorAll(selector)),
	      	  node = elem;
	      while (node && !TUtil.lang.inArray(nodeLists,node)){
	      	node = node !== context  && node.parentNode;
	      }
	      return node
    	}
	}
})(TUtil);

(function(){
	TUtil.img = {
		
	}
})(TUtil);

/**
 * 统计统一上报
 * @param url
 * @param t
 * @param opts
 */
TUtil.pingSender = function (url, t, opts) {
	var _s = TUtil.pingSender, iid, img;
	if (!url) {
		return;
	}
	opts = opts || {};
	iid = "sndImg_" + _s._sndCount++;
	img = _s._sndPool[iid] = new Image();
	img.iid = iid;
	img.onload = img.onerror = img.ontimeout = (function (t) {
		return function (evt) {
			evt = evt || window.event || {type:'timeout'};
			void(typeof(opts[evt.type]) == 'function' ? setTimeout((function (et, ti) {
				return function () {
					opts[et]({'type':et, 'duration':((new Date()).getTime() - ti)});
				};
			})(evt.type, t._s_), 0) : 0);
			TUtil.pingSender._clearFn(evt, t);
		};
	})(img);
	(typeof(opts.timeout) == 'function') && setTimeout(function () {
		img.ontimeout && img.ontimeout({type:'timeout'});
	}, (typeof(opts.timeoutValue) == 'number' ? Math.max(100, opts.timeoutValue) : 5000));
	void((typeof(t) == 'number') ? setTimeout(function () {
		img._s_ = (new Date()).getTime();
		img.src = url;
	}, (t = Math.max(0, t))) : (img.src = url));
};
TUtil.pingSender._sndPool={};
TUtil.pingSender._sndCount=0;
TUtil.pingSender._clearFn = function (evt, ref) {
	var _s = TUtil.pingSender;
	if (ref) {
		_s._sndPool[ref.iid] = ref.onload = ref.onerror = ref.ontimeout = ref._s_ = null;
		delete _s._sndPool[ref.iid];
		_s._sndCount--;
		ref = null;
	}
};

/*TUtil.pingPoster todo*/
//TUtil.pingPoster = function(){
//	var Poster = function(url, t){
//		var tmp = url.split("?");
//		this.cgi = tmp[0];
//		this.para = tmp[1]||"";
//	}
//	Poster.prototype.send = function(){
//		var form = document.createElement("form");
//	}
//
//	return function(url, t){
//
//	}
//}();

//speed


TUtil.data = (function(){
	var dataCache = {};
	return {
		get : function(key){
			return dataCache[key];
		},
		set : function(key, value){
			dataCache[key] = value;
			return true;
		},

		del : function(key){
			dataCache[key] = null;
			delete dataCache[key];
			return true;
		}
	}
})();

/**
 * ua
 */
(function (tutil){
	var _re = /(\d)+/g;

	function verFormat(v) {
		return v.replace(_re, function(_1, _2){var ret=_1;if(_1.length<2){ret='0'+_1};return ret;})
	}

	tutil.ua = {
		Android : 0,
		iPhone : 0,
		compare : function(va, vb) {
			va = String(va), vb = String(vb);
			va=verFormat(va);
			vb=verFormat(vb);

			return va==vb
							?0
							:va>vb
								?1:-1;
		}
	};

	var reg = /(android|iphone)(?:[^\d])*([\d._]+)/i;
	var reg_ = /_/g;
	var mat = navigator.userAgent.match(reg);
	if(mat) {
		TUtil.ua[mat[1]] = mat[2].replace(reg_, ".");
	}

})(TUtil);
(function (tutil){
	var rafHandle = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) { return setTimeout(callback, 1); };
	})()
	tutil.requestAnimationFrame = function(callback){
		rafHandle(callback);
	}
})(TUtil);