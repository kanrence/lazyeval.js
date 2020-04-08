LazyEval
========

lazyeval.js是一个对JavaScript函数和表达式进行惰性求值的库

简介
----

在JavaScript中，所有表达式和函数的运算都是立即执行的，若能对计算密集型的表达式或函数进行惰性求值，必将提升JavaScript运行时的性能。

让我们看一个例子：

```javascript
var fibonacci = LazyEval(function(n){
	return n<2 ? n : fibonacci(n-1) +  fibonacci(n-2);
});

function randomHandle(num1,num2) {
    if(Math.random() > 0.5) {
        return num1;
    }
    return num2;
}

function compareHandle(num1,num2) {
    if(num1 > 1000) {
        return num1;
    }
    return num2;
}

var ret1 = randomHandle(fibonacci(5), fibonacci(7));
console.log(ret1 + 1) //根据随机值，最终只会求值fibonacci(5)或fibonacc(7)中的一个，

var ret2 = compareHandle(fibonacci(17), fibonacci(8));
console.log(ret2 + 1) //由于fibonacci(17)>1000,所以这里只求值了fibonacci(17)
```

上面这个例子，不同的Handle使用不同的逻辑返回两个参数中的一个，而根据需求，最终只会使用其中一个斐波那契数，但若不使用惰性求值，在调用函数的时候，就会立即运行fibonacci两次求得两个斐波那契数。

惰性求值对象
-----------

使用LazyEval包装过的函数，运行后返回的是一个惰性求值对象(LazyObject),此外LazyEval库也封装了一组运算符，可以把表达式包装进一个惰性求值对象，这些运算符包括：+、-、*、/、%、==、===、!=、!==、>、<、>=、<=、>>、<<、>>>、&、|、~、&&、||、!，使用方法如下：

```javascript
var exp1 = LazyEval['+'](fibonacci(5), fibonacci(7)); //fibonacci(5)+fibonacci(7)的惰性求值包装

var exp2 = LazyEval['>'](fibonacci(5), 5); //fibonacci(5)>5的惰性求值包装
```

触发惰性求值对象进行求值
----------------------

以下情况可以触发惰性求值对象进行求值
- `lazyobj.eval()`: 调用惰性求值对象的eval方法。
```javascript
var exp1 = LazyEval['+'](fibonacci(5), fibonacci(7));
console.log(exp1.eval()); // 18
```

- 当惰性求值对象参与运算符运算而发生类型转换时，例如：`lazyobj > 5`，lazyobj内部会进行立即求值并返回求得的值
```javascript
var exp1 = LazyEval['+'](fibonacci(5), fibonacci(7));
console.log(exp1 < 30); // true
```

注意情况
--------
- 不要使用不会触发类型转换的运算符来直接运算惰性求值对象，如!、&&、||、===、!==来比较惰性求值对象,如要使用，请先eval()获取原值后进行比较
- 不要使用 == 来比较两个惰性求值的值，因为两个对象进行==运算不会触发类型转换，若要比较，先进行eval()求值
```javascript
var exp1 = LazyEval['+'](fibonacci(5), fibonacci(7));
var exp2 = LazyEval['+'](fibonacci(5), fibonacci(7));
console.log(exp1 == exp2) // false
console.log(exp1.eval() == exp2.eval()) //true
```
- 不支持对惰性求值对象使用Object.keys,Object.seal,Object.freeze,Object.isExtensible,Object.isFrozen,Object.isSealed,Object.entries,Object.fromEntries,Object.values,Object.preventExtension,如要使用，先使用eval()获得返回值后再使用