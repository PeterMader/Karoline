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

Go until you reach the wall:
```
repeat while not(wall)
  step
  print(not(wall))
*repeat
```
