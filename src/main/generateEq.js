let getRandom = require('../ultils/getRandom');
const { operators } = require('../constant/constant');
let fs = require('fs');
/**
 * 生成等式
 * n:生成题目的条数
 * r:每个数值的范围
 */
function generate(n, r) {
  let showExercises = []; //写入txt文件里面的练习题
  let exercises = []; // 作为参数到计算结果的练习题
  let answers = [];
  for (let i = 0; i < n; i++) {
    let expression = ifLogical(r, exercises); //判断表达式是否符合逻辑 如果符合逻辑，就返回一个表达式
    let showExpression = expression.replace(/\//g, '÷').replace(/\*/g, '×'); //将* /替换
    // console.log(showExpression);
    let answer = eval(expression);
    showExercises.push({ key: i, expression: showExpression });
    exercises.push({ key: answer, expression });
    answers.push({ key: i, answer });
  }
  fs.writeFileSync('exercises.txt', JSON.stringify(showExercises));
}

// 生成运算符数组
function getOperators(n) {
  let arr = [];
  for (let i = 0; i < n; i++) {
    let random = getRandom(4);
    arr.push(operators[random]);
  }
  return arr;
}

// 根据运算符数组 生成一条表达式
// r:每个数值的范围 opArr:运算符数组
function generateEq(r, opArr) {
  let eq = ''; //等式
  let eqArr = [];
  let orginNum = getRandom(r);
  // console.log(opArr);
  if (opArr.length === 0) {
    eqArr.push(orginNum);
  } else {
    // let eqArr = [];
    eqArr.push(orginNum);
    for (let i = 0; i < opArr.length; i++) {
      eqArr.push(opArr[i]);
      // console.log(eqArr);
      if (opArr[i] === '/') {
        let rightNum = ifDevision(eqArr, i, r);
        eqArr.push(rightNum);
      }
      // else if (opArr === '-') {
      //   let rightNum = ifSubtract(eqArr, i, r);
      //   eqArr.push(rightNum);
      // }
      else {
        let rightNum = getRandom(r);
        eqArr.push(rightNum);
      }
    }
  }
  // console.log(eqArr.join(''));
  return eqArr.join('');
}

//如果操作符是除法，进行的判断 eq:目前的表达式数组 i:目前操作的操作符下标 r:数值范围
function ifDevision(eqArr, i, r) {
  // console.log(eqArr);
  let flag = true;
  let rightNum = getRandom(r);
  let index = i * 2; //在eqArr中的下标
  while (flag) {
    if (rightNum === 0 || eqArr[index] >= rightNum) {
      rightNum = getRandom(r);
      if (eqArr[index] === 9) {
        eqArr[index] = getRandom(r);
      }
    } else {
      flag = false; //当满足之后，flag为false 跳出循环
    }
  }
  return rightNum;
}

//如果操作符是减法
function ifSubtract(eqArr, i, r) {
  let flag = true;
  let index = i * 2;
  // console.log(index);
  let rightNum = getRandom(r);
  while (flag) {
    if (rightNum > eqArr[index]) {
      // console.log(index);
      rightNum = getRandom(eqArr[index]);
    } else {
      flag = false;
    }
  }
  return rightNum;
}

//判断生成的表达式是否合理(其实就是判断是否生成了负数，表达式是否相同) 如果合法，就将表达式返回
function ifLogical(r, exercises) {
  let operatorNum = getRandom(4); // 获取运算符个数
  //如果运算符个数为0 不符合条件 继续获取 operatorNum
  while (operatorNum === 0) {
    operatorNum = getRandom(4);
  }
  let opArr = getOperators(operatorNum); // 得到运算符数组
  let expression = generateEq(r, opArr);
  let flag = true;
  while (flag) {
    let answer = eval(expression);
    if (answer < 0 || isCommon(exercises, expression)) {
      // if (answer < 0) {
      let operatorNum = getRandom(4);
      opArr = getOperators(operatorNum);
      expression = generateEq(r, opArr);
    } else {
      flag = false;
    }
  }
  return expression;
}

// 判断表达式是否相同
function isCommon(exercises, expression) {
  // console.log(exercises, expression);
  let answer = eval(expression);
  let res = false;
  exercises.forEach((exercise) => {
    let exp = exercise.expression;
    let answer1 = eval(exp);
    if (answer1 === answer) {
      // console.log(exp);
      // 判断答案是否相同，如果相同，判断运算符号是否相同
      if (isOperatorCommon(exp, expression)) {
        //如果操作符相同，继续判断数字是否相同
        if (isNumberCommon(exp, expression)) {
          res = true;
          return;
        }
      }
    }
  });
  // 如果进行循环后都没有返回true 就返回false
  return res;
}

// 判断数字是否相同
function isNumberCommon(exp1, exp2) {
  let expArr1 = Array.from(exp1);
  let expArr2 = Array.from(exp2);
  if (expArr1.length === expArr2.length) {
    //如果数组长度相同，则进行判断里面的字符是否一样
    let expNumArr1 = expArr2Num(expArr1);
    let expNumArr2 = expArr2Num(expArr2);
    for (let i = 0; i < expNumArr1.length; i++) {
      if (expNumArr2.indexOf(expNumArr1[i]) === -1) {
        //如果找不到 说明不一样
        return false;
      }
    }
    // 循环后都没有返回false 说明有找到 所以返回true
    return true;
  } else {
    return false;
  }
}

//通过表达式获取数字
function expArr2Num(expArr) {
  // console.log(expArr);
  let arr = [];
  for (let i = 0; i < (expArr.length + 1) / 2; i++) {
    arr.push(expArr[2 * i]);
  }
  // console.log(arr);
  return arr;
}

//判断操作符是否相同
function isOperatorCommon(exp1, exp2) {
  let expArr1 = Array.from(exp1);
  let expArr2 = Array.from(exp2);
  if (expArr1.length === expArr2.length) {
    // 如果两个表达式的长度相等，继续判断
    let opArr1 = exp2OpArr(expArr1);
    let opArr2 = exp2OpArr(expArr2);
    // console.log(opArr1, '表达式1的运算符数组');
    // console.log(opArr2, '表达式2的运算符数组');
    for (let i = 0; i < opArr1.length; i++) {
      //判断两个数组是否相同
      if (opArr2.indexOf(opArr1[i]) === -1) {
        return false;
      }
    }
    //如果经历了一次for循环 都能找到 则返回true
    return true;
  } else {
    return false;
  }
}
//将表达式截取出运算符数组并返回
function exp2OpArr(expArr) {
  let opArr = [];
  let i = 0;
  for (i = 2 * i + 1; i < expArr.length; i = 2 * i + 1) {
    opArr.push(expArr[i]);
  }
  // console.log(opArr);
  return opArr;
}
module.exports = generate;
