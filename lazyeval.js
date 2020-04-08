(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(factory);
    } else if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      root.LazyEval = factory();
    }
  })(this, function() {
      
    var NOT_RESOLVE_TAG = 'LazyObjectNotResolve'

    function eval(data) {
        if(data.ret != NOT_RESOLVE_TAG) {
            return data.ret;
        }
        var obj1 = data.obj1;
        var obj2 = data.obj2;
        var obj3 = data.obj3;
        var op = data.op;
        var ret = data.ret;
        if(typeof obj1 == 'function' && obj1.LazyObject === true) {
            obj1 = obj1.eval();
        }
        if(typeof obj2 == 'function' && obj2.LazyObject === true) {
            obj2 = obj2.eval();
        }
        if(typeof obj3 == 'function' && obj3.LazyObject === true) {
            obj3 = obj3.eval();
        }
        if(op == 'func') {
            ret =  obj1.apply(obj3,obj2);
        } else if(op == '+') {
            ret = obj1 + obj2;
        } else if(op == '-') {
            ret = obj1 - obj2;
        } else if(op == '*') {
            ret = obj1 * obj2;
        } else if(op == '/') {
            ret = obj1 / obj2;
        } else if(op == '%') {
            ret = obj1 % obj2;
        } else if(op == '==') {
            ret = obj1 == obj2;
        } else if(op == '===') {
            ret = obj1 === obj2;
        } else if(op == '!==') {
            ret = obj1 !== obj2;
        } else if(op == '&&') {
            ret = obj1 && obj2;
        } else if(op == '||') {
            ret = obj1 || obj2;
        } else if(op == '!') {
            ret = !obj1;
        } else if(op == '!=') {
            ret = obj1 != obj2;
        } else if(op == '>') {
            ret = obj1 > obj2;
        } else if(op == '<') {
            ret = obj1 < obj2;
        } else if(op == '>=') {
            ret = obj1 >= obj2;
        } else if(op == '<=') {
            ret = obj1 <= obj2;
        } else if(op == '>>') {
            ret = obj1 >> obj2;
        } else if(op == '>>>') {
            ret = obj1 >>> obj2;
        } else if(op == '<<') {
            ret = obj1 << obj2;
        } else if(op == '&') {
            ret = obj1 & obj2;
        } else if(op == '|') {
            ret = obj1 | obj2;
        } else if(op == '~') {
            ret = ~obj1;
        }
        if(ret == NOT_RESOLVE_TAG) {
            return undefined
        }
        data.ret = ret;
        return ret;
    }
    
    var handler = {
        get: function(target,key,p) {
            if(key == Symbol.toPrimitive) {
                var obj = eval(target.evaldata);
                return function(hint) {
                    if(hint == 'number' || 'default') {
                        var r = obj.valueOf();
                        if(typeof r == 'number') {
                            return r
                        } else {
                            return obj.toString();
                        }
                    } else if(hint == 'string') {
                        return obj.toString();
                    }
                }
            } else if(key == 'eval') {
                return function() {
                    var ret = eval(target.evaldata);
                    while(ret.LazyObject === true) {
                        ret = ret.eval();
                    }
                    return ret;
                }
            } else if(key == 'LazyObject') {
                return true;
            } else {
                var obj = eval(target.evaldata);
                if(typeof obj[key] == 'function') {
                    return function() {
                        if(this == p) {
                            return obj[key].apply(obj,arguments);
                        } else {
                            return obj[key].apply(this,arguments);
                        }
                    }
                } else {
                    return obj[key];
                }
            }
        },
        set: function(target,key,value) {
            var obj = eval(target.evaldata);
            obj[key] = value;
            return value;
        },
        apply: function(target, thisArg, argumentsList) {
            var obj = eval(target.evaldata);
            return obj.apply(thisArg,argumentsList)
        },
        construct: function(target, argumentsList, newTarget) {
            var obj = eval(target.evaldata);
            return new obj(...argumentsList)
        },
        has: function(target,key) {
            var obj = eval(target.evaldata);
            return key in obj;
        },
        deleteProperty: function(target, key) {
            var obj = eval(target.evaldata);
            return delete obj[key];
        },
        getPrototypeOf: function(target) {
            var obj = eval(target.evaldata);
            return Object.getPrototypeOf(obj);
        },
        setPrototypeOf: function(target,newProto) {
            var obj = eval(target.evaldata);
            Object.setPrototypeOf(obj, newProto);
            return true;
        },
        getOwnPropertyDescriptor: function(target, key) {
            var obj = eval(target.evaldata);
            return Object.getOwnPropertyDescriptor(obj,key);
        },
        defineProperty: function(target, key, descriptor) {
            var obj = eval(target.evaldata);
            Object.defineProperty(obj, key, descriptor);
            return true;
        }
    }

    function LazyFactory(op,obj1,obj2,obj3){
        var targetobj = function() {};
        var evaldata = { op, obj1, obj2, obj3 };
        evaldata.ret = NOT_RESOLVE_TAG;
        targetobj.evaldata = evaldata;
        var p =  new Proxy(targetobj,handler);
        return p;
    }
    
    function LazyEval(func) {
        return function() {
            return LazyFactory('func',func,arguments,this);
        }
    }
    
    var ops = ['+','-','*','/','%','==','===','!=','!==','>','<','>=','<=','>>','<<','>>>','&','|','~','&&','||','!'];
    ops.forEach(function(op){
        LazyEval[op] = function(a,b) {
            return LazyFactory(op,a,b)
        }
    });

    return LazyEval;
  })
