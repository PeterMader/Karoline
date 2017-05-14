# Karoline
The Karoline Programming Language Interpreter.

Example:

```
procedure testproc
  print("Hello, I'm in the test procedure!")
  repeat 4 times
    setmark
    turnleft
    deletemark
    step
  *repeat
*procedure

print('Hello, world!')

repeat 2 times
  print("Hello, I'm in the loop!")
  testproc
*repeat
```

Variables and constants:
```
procedure test
  const a = 34
  print(a)
  a = a + 1
  print(a)
*procedure

var a = 12
print(a)
a = 2
print(a)
test()
print(a)
```

Objects:
```
const obj = new Object()

obj.property = 'hello world!'
obj.method = procedure m
  print("I'm in the method!")
*procedure

procedure printTheProperty
  print(obj.property)
*procedure

printTheProperty()
obj.method()
```

Function expressions:
```
const fn = function test ()
  return 42
*function

print(fn, fn())


print(function test ()
  return 42
*function, function test ()
  return 42
*function())
```
