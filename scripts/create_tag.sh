#!/bin/bash
#author kingboy
#description: create tag list for update
#获取当前项目的配置名称
gitdir="front-end"
#要输出的目录路径
dir="./git/$gitdir"
#当前操作目录
pwdPath=$(pwd)
#判断是否有该目录没有则创建
if test -e ${dir}
then
    echo -e "${dir} exists!"
else
    mkdir -p $dir
    echo -e "${dir} create success！"
fi
# 拿到远程最新tag
git fetch -t -p -f
git pull
#拿出当前最大的版本号 如:v1.3
# tag=$(git describe --tags `git rev-list --tags --max-count=1`)
tag=$(git tag | sort -n -r -t 'v' -k 2 | head -n 1)
#截取字符串从1到3 如1.3
tagnum=${tag:1}
#tagnum=2.5
#版本号加1
s2=$(echo $tagnum+0.1 | bc)
#拼接v
newtag="v"${s2}
#打标签
git tag -a ${newtag} -m "${newtag}"
#推送到远端
git push origin --tags
#生成全量更新包
#zip -r ${dir}/last.zip *
#生成不同版本间的更新包
#-n按照数字排序   -r 翻转排序  -t 分隔符  -k以第几列排序
echo -e "----------------tag list---------------------"
git tag | sort -n -r -t 'v' -k 2 |tee ${dir}/tagList.log #生成所有tag
echo -e "----------------tag info---------------------"
git tag | sort -n -r -t 'v' -k 2 | head -n 1
echo "--------------v${tagnum}->->->->->->${newtag}--------------"
#删除版本信息文件
rm -rf ${dir}/update.json
#定义生成的版本个数
i=1
versionNumber=1
cat ${dir}/tagList.log | while read one
do
    cat ${dir}/tagList.log | while read two
    do
        #去掉自身和自身进行比较
        if test ${one} = ${two}
        then
            continue
        fi
        #-------------------------------
        #去掉重复的包   当新版不够10个的时候，会生成 v7-v6  v6-v7   ，加上之后就不会了
        #外层只要一个循环，所以不需要了
        #if test ${two:1:${#two}} -gt ${one:1:${#one}}
        #then
        #   continue
        #fi
        #---------------------------------------
        #生成版本包
        if test $[i] -le $[versionNumber]
        then
            # rm -rf  ${dir}/${one}-${two}
            # rm -rf ${dir}/${one}-${two}.zip
            # mkdir -p ${dir}/${one}-${two}/new
            # mkdir -p ${dir}/${one}-${two}/old
            # git diff ${two} ${one} --name-only | xargs zip ${dir}/${one}-${two}/new/${gitdir}.zip
            # unzip -o ${dir}/${one}-${two}/new/${gitdir}.zip -d ${dir}/${one}-${two}/new
            # rm -rf ${dir}/${one}-${two}/new/${gitdir}.zip
            # git checkout $two
            # git diff ${two} ${one} --name-only | xargs zip ${dir}/${one}-${two}/old/${gitdir}.zip
            # unzip -o ${dir}/${one}-${two}/old/${gitdir}.zip -d ${dir}/${one}-${two}/old
            # rm -rf ${dir}/${one}-${two}/old/${gitdir}.zip
            # cd ${dir}
            # zip  -rq ${one}-${two}.zip  ${one}-${two}
            # #发送到主机
            # scp ${one}-${two}.zip wuxin@10.100.65.175:/home/wuxin/share/export/${gitdir}
            # cd $pwdPath
            # #删除版本信息文件  已经放在上面进行处理了
            # #重建版本信息文件
            # #echo "{\"$two\":\"${one}-${two}.zip\"}," >> $dir/update.json
            git checkout master
        fi
        i=$(($i+1))
    done
    break
done
exit 0
