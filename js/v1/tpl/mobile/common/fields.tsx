// 使用antd mobile 里面的组件
const fields = {
    input: {
        typeName: '输入框',
        type: 'input',
        valueType: 'string',
    },
    textarealtem: {
        typeName: '多行文本',
        type: 'textarealtem',
        valueType: 'string',
    },
    select: {
        typeName: '下拉单选',
        type: 'select',
        valueType: '[string]',
    },
    selectMultiple: {
        typeName: '下拉多选',
        type: 'selectMultiple',
        valueType: '[string]',
    },
    radio: {
        typeName: '单选框',
        type: 'radio',
        valueType: 'boolean',
    },
    checkbox: {
        typeName: '复选框',
        type: 'checkbox',
        valueType: 'boolean',
    },
    calendar: {
        typeName: '日历选择器',
        type: 'calendar',
        valueType: '[Date, Date] | [Date]',
    },
    switchBtn: {
        typeName: '滑动开关',
        type: 'switchBtn',
        valueType: 'boolean',
    },
    address: {
        typeName: '地址',
        type: 'address',
        valueType: '[string]',
    },
    date: {
        typeName: '日期选择（年月日）',
        type: 'date',
        valueType: 'Date',
    },
    time: {
        typeName: '日期选择（时分秒）',
        type: 'time',
        valueType: 'Date',
    },
    dateTime: {
        typeName: '输日期选择（年月日时分秒）入框',
        type: 'dateTime',
        valueType: 'Date',
    },
    imageUpload: {
        typeName: '图片上传',
        type: 'imageUpload',
        valueType: '[{id: string,url: string}]',
    },
    imageUploadMultiple: {
        typeName: '多张图片上传',
        type: 'imageUploadMultiple',
        valueType: '[{id: string,url: string}]',
    },
    stepper: {
        typeName: '步进器',
        type: 'stepper',
        valueType: 'number',
    },
    hidden: {
        typeName: '隐藏选项',
        type: 'hidden',
        valueType: 'any',
    },
};
