module.exports = {
  "parser": "babel-eslint",
  "extends": "eslint:recommended",
  "ecmaFeatures":{
    "jsx":true,
    "modules":true
  },
  "plugins": [
    "react"
  ],
  "env":{
    "browser":true,
    "node":true,
    "es6":true
  },
  "globals":{
    "window":true,
    "document":true,
    "$":true
  },
  'root': true,
  "rules": {
    "strict": 0,//不检测严格模式
    "valid-jsdoc": 2,//检测js文档注释
    "react/jsx-uses-react": 2,//react引入必须使用
    "react/jsx-uses-vars": 2,//Prevent variables used in JSX to be incorrectly marked as unused
    "react/react-in-jsx-scope": 2,// Prevent missing React when using JSX
    'accessor-pairs': 2,
    'array-bracket-newline': 0, //数组方括号前后的换行符使用规则
    'array-bracket-spacing': 0,//数组方括号前后的空格使用规则
    // "arrow-body-style": ["error", "always"],//箭头函数规则
    "default-case": 2,//require default cases
    "handle-callback-err": 2,// // callback 中的 err、error 参数和变量必须被处理
    "jsx-quotes": [2, 'prefer-single'],//jsx 语法中，属性的值必须使用双引号
    "keyword-spacing": 2,//关键字前后必须有空格
    // "new-cap": 2,//new关键字后类名应首字母大写
    "no-await-in-loop": 2,//禁止将 await 写在循环里
    "no-array-constructor": 2,// 禁止使用 Array 构造函数，使用 Array(num) 直接创建长度为 num 的数组时可以
    "no-catch-shadow": 2,//catch中不得使用已定义的变量名
    "no-class-assign": 2,//class定义的类名不得与其它变量重名
    "no-empty-character-class": 2,//正则表达式中禁止出现空的字符集[]
    "no-console": 0,//disallow the use of console
    "no-debugger": 1,
    "no-duplicate-imports": 2,//禁止重复 import
    "no-empty-function": 2,//禁止空的function
    "no-eval": 2,//禁止使用 eval
    "no-extra-bind": 2,//禁止额外的 bind
    "no-extra-parens": 2,//禁止额外的括号，仅针对函数体
    "no-floating-decimal": 2,//不允许使用 2. 或 .5 来表示数字，需要用 2、2.0、0.5 的格式
    "no-implied-eval": 2,//禁止在 setTimeout 和 setInterval 中传入字符串，因会触发隐式 eval
    "no-implicit-globals": 2,//禁止隐式定义全局变量
    "no-label-var": 2,//label 不得与已定义的变量重名
    "no-iterator": 2,//禁止使用 __iterator__
    "no-lone-blocks": 2,//禁止使用无效的块作用域
    "no-loop-func": 2,//禁止 for (var i) { function() { use i } }，使用 let 则可以
    "no-mixed-operators": [2, {//禁止使用混合的逻辑判断，必须把不同的逻辑用圆括号括起来
      "groups": [
        ["&&", "||"]
      ]
    }],
    "no-multi-assign": 2,//禁止连等赋值
    "no-multi-spaces": 2,//禁止使用连续的空格
    "no-multi-str": 2,//禁止使用 \ 来定义多行字符串，统一使用模板字符串来做
    "no-multiple-empty-lines": [2, {
      max: 3, // // 连续空行的数量限制,文件内最多连续 3 个
      maxEOF: 1, // 文件末尾最多连续 1 个
      maxBOF: 1 // 文件头最多连续 1 个
    }],
    "no-new-object": 2,//禁止使用 new Object
    "no-new-symbol": 2,//禁止使用 new Symbol
    "no-new-require": 2,//禁止使用 new require
    "no-new-wrappers": 2,//禁止 new Boolean、Number 或 String
    "no-new": 2,//禁止 new 一个类而不存储该实例
    "no-octal": 2,//禁止使用0开头的数字表示八进制
    "no-path-concat": 2,//禁止使用 __dirname + 'file' 的形式拼接路径，应该使用 path.join 或 path.resolve 来代替
    "no-param-reassign": 2,//禁止对函数的参数重新赋值
    "no-return-assign": 2,//禁止在return中赋值
    "no-return-await": 2,//禁止在 return 中使用 await
    "no-script-url": 2,//禁止 location.href = 'javascript:void'
    "no-self-compare": 2,//禁止自己与自己作比较
    "no-sequences": 2,//禁止逗号操作符
    "no-shadow-restricted-names": 2,//禁止使用保留字作为变量名
    "no-shadow": 2,//禁止在嵌套作用域中出现重名的定义
    "no-template-curly-in-string": 2,//禁止普通字符串中出现模板字符串语法
    // 禁止行尾空格
    "no-trailing-spaces": [2, {
      "skipBlankLines": true, // 不检查空行
      "ignoreComments": true // 不检查注释
    }],
    "no-undef-init": 2,//禁止将 undefined 赋值给变量
    "no-undefined": 2,//禁止使用 undefined
    "no-unmodified-loop-condition": 2,//循环体内必须对循环条件进行修改
    "no-unneeded-ternary": [2, { 'defaultAssignment': false }],//禁止不必要的三元表达式
    // 禁止出现无用的表达式
    "no-unused-expressions": [2,
      {
        'allowShortCircuit': true, // 允许使用 a() || b 或 a && b()
        'allowTernary': true, // 允许在表达式中使用三元运算符
        'allowTaggedTemplates': true, // 允许标记模板字符串
      }
    ],
    // 禁止在变量被定义之前使用它
    "no-use-before-define": [2,
      {
        'functions': false, // 允许函数在定义之前被调用
        'classes': false, // 允许类在定义之前被引用
      }
    ],
    "no-useless-call": 2,//禁止不必要的 call 和 apply
    "no-useless-computed-key": 2,//禁止使用不必要计算的key，如 var a = { ['0']: 0 }
    "no-useless-concat": 2,//禁止不必要的字符串拼接
    "no-useless-constructor": 2,//禁止无用的构造函数
    "no-useless-rename": 2,//禁止无效的重命名，如 import {a as a} from xxx
    "no-var": 1,// 禁止使用 var，必须用 let 或 const,现在很多文件使用，先提示
    "no-void": 2,//禁止使用void
    'no-warning-comments': 1, // 禁止注释中出现 TODO 或 FIXME，用这个来提醒开发者，写了 TODO 就一定要做完
    'no-whitespace-before-property': 2,// 禁止属性前出现空格，如 foo. bar()
    "nonblock-statement-body-position": 2,//禁止 if 语句在没有花括号的情况下换行
    // 字符串必须使用单引号
    // "quotes": [1, "single", {
    //   'avoidEscape': true, // 允许包含单引号的字符串使用双引号
    //   'allowTemplateLiterals': true, // 允许使用模板字符串
    // }],
    "rest-spread-spacing":2,//...后面不允许有空格
    "semi-style":[2, 'last'],//禁止行首出现分号
    "semi":2,//行尾必须使用分号结束
    "space-infix-ops":2,//操作符前后要加空格
    // new, delete, typeof, void, yield 等表达式前后必须有空格，-, +, --, ++, !, !! 等表达式前后不许有空格
    "space-unary-ops": [2, {
      'words': true,
      'nonwords': false,
    }],
    "wrap-iife":[2, 'inside'],//自执行函数必须使用圆括号括起来，如 (function(){do something...})()
  }
};
