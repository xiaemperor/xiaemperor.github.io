/**
 * 声明全局变量boxNumber, 用于控制生成几宫格，gameDifficulty游戏难度，gamePattern游戏模式
 */
// var boxNumber = 9, imgPic = "tsdl.jpg", gamePattern = "img";
var boxNumber = 9, imgPic = "songxiao.JPG", gamePattern = "img";


/**
 * 声明全局变量boxPosition，为数组，用于记录每个Box的位置
 */
var boxPosition;

/**
 * 声明全局变量moveCount，用于记录步数
 */
var moveCount = 0;

var score9="score9"
var score16="score16"
var score25="score25"

/**
 * 下拉框绑定函数，设置boxNumber并生成游戏界面
 */
function selectChange() {
    var $select = $("select");
    $select.change(function() {
        //初始化BoxNumber
        boxNumber = parseInt($select.eq(0).find("option:selected").val());
        imgPic = $select.eq(1).find("option:selected").val();
        //生成宫格
        generate();
    });
}

/**
 * 生成游戏界面
 * 
 */
function generate() {
    remove();
    generateBoxPositionArr();
    //generateInOrder();
    imgSplit();
     setTimeout(function(){
         arrangeAtRandom();
         moveWhenClick();
     }, 200);
}

/**
 * 删除之前container中所有的Box
 */
function remove() {
    var $container = $("#container");
    $container.empty();
}

/**
 * 初始化boxPosition数组
 */
function generateBoxPositionArr() {
    //初始化BoxPosition数组
    boxPosition = new Array(boxNumber);
    for(var i = 0; i < boxNumber; ++i) {
        boxPosition[i] = i;
    }
}

/**
 * 按照次序生成宫格
 */
function generateInOrder() {
    var $container = $("#container");
    var sideLength = getSideLength();                                 //获得box的边长，确定boxNumber的情况下加载一次即可
    for (var i = 0; i < boxNumber; ++i) {
        var $div;
        var x = parseInt(i / Math.sqrt(boxNumber));                   //获得box的x轴坐标
        var y = i % Math.sqrt(boxNumber);                             //获得box的y轴坐标
        $div = $("<div class=\"box\">" + (i + 1) + "</div>");
        $div.css({ "height": sideLength + "%", "width": sideLength + "%" });
        $div.css({ "top": getTopAndLeft(x, y, sideLength)[0] + "%", "left": getTopAndLeft(x, y, sideLength)[1] + "%" });
        $container.append($div);
    }
    //将最后一个宫格隐藏，用于位置交换
    $(".box:last").attr("id", "specialBox");
}

/**
 * 获取每个box的top值和left值
 * 
 * @return [top, left] 每个box的top值和left值
 */
function getTopAndLeft(x, y, sideLength) {
    var top = x * sideLength + 2 * (x + 1);
    var left = y * sideLength + 2 * (y + 1);
    return [top, left];
}

/**
 * 根据boxNumber获取每个宫格的边长
 * 
 * @return sideLength 边长
 */
function getSideLength() {
    var sqrt = parseInt(Math.sqrt(boxNumber));
    var boxInterval = sqrt + 1;
    var sideLength = parseFloat((100 - (boxInterval * 2))/sqrt);
    return sideLength;
}

/**
 * 将宫格随机打乱
 * 
 */
function arrangeAtRandom() {
    var difficulty = 200;
    for(var i = 0; i < difficulty; ++i) {
        //获取当前可移动的box
        var $specialBox = $("#specialBox");

        var specialBoxIndexInHtml = $(".box").index($specialBox);
        var specialBoxIndexInArr = boxPosition[specialBoxIndexInHtml];


        var surroundBoxIndex = new Array(4);
        var sqrt = parseInt(Math.sqrt(boxNumber));
        surroundBoxIndex[0] = (specialBoxIndexInArr >= sqrt) ? (specialBoxIndexInArr - sqrt) : (-1);          //具体解释见getMoveDirection()函数
        surroundBoxIndex[1] = ((specialBoxIndexInArr + 1) % sqrt != 0) ? (specialBoxIndexInArr + 1) : (-1);
        surroundBoxIndex[2] = (specialBoxIndexInArr <= (boxNumber - sqrt)) ? (specialBoxIndexInArr + sqrt) : (-1);
        surroundBoxIndex[3] = (specialBoxIndexInArr % sqrt != 0) ? (specialBoxIndexInArr - 1) : (-1);
        //随机选取一个移动
        var randomIndexInArr = -1, randomIndexInHtml;
        while (randomIndexInArr == -1) {
            var random = parseInt(Math.random() * surroundBoxIndex.length);
            randomIndexInArr = surroundBoxIndex[random];
        }
        for (var j = 0; j < boxNumber; ++j)
            if(randomIndexInArr == boxPosition[j])
                randomIndexInHtml = j;
        move($(".box").eq(randomIndexInHtml), false);
    }
}

/**
 * 在用户的点击下移动box
 */
function moveWhenClick() {
    var $box = $(".box");
    for (var i = 0; i < boxNumber; ++i) {
        var moveBox = $box[i];
        //触发点击事件
        moveBox.onclick = function () {
            move($(this), true);
        }
    }
}

/**
 * 判断指定box是否可以移动在可以移动的情况下移动box
 * 
 * @param $moveBox 要移动的box对象; isClicked 是否是用户点击
 */
function move($moveBox, isClicked) {
    var moveDirectionNumber = getMoveDirection($moveBox);
    if (moveDirectionNumber) {                                          //根据移动方向的值检查是否满足移动条件
        var specialBox = $("#specialBox").get(0);                       //获取特殊占位box
        var top = parseFloat($moveBox.get(0).style.top);                  //获取当前点击的box的相关属性
        var left = parseFloat($moveBox.get(0).style.left);
        var sideLength = parseFloat($moveBox.get(0).style.width);

        //根据不同的移动方向来移动元素
        if (moveDirectionNumber == 1)
            top = top - sideLength - 2;
        else if (moveDirectionNumber == 2)
            left = left + sideLength + 2;
        else if (moveDirectionNumber == 3)
            top = top + sideLength + 2;
        else
            left = left - sideLength - 2;
        $moveBox.get(0).style.top = top + "px";
        $moveBox.get(0).style.left = left + "px";

        //在数组中将两个box交换位置
        var boxIndexInHtml = $(".box").index($moveBox);
        var boxIndexInArr = boxPosition[boxIndexInHtml];
        var specialBoxIndexInHtml = $(".box").index($("#specialBox"));
        var specialBoxIndexInArr = boxPosition[specialBoxIndexInHtml];
        boxPosition[boxIndexInHtml] = specialBoxIndexInArr;
        boxPosition[specialBoxIndexInHtml] = boxIndexInArr;


        //对用户点击进行处理
        if (isClicked) {                 
            //记录移动步数
            ++moveCount;
            showSteps();
            //检查最终结果
           check();
        }
    }
}

/**
 * 获取当前元素可以移动的方向
 * 
 * @param $moveBox 移动的盒元素
 * @return 0，1，2，3，4 分别代表不能移动、上、右、下、左
 */
function getMoveDirection($moveBox) {
    //获取到指定moveBox在html中和在数组中的位置索引
    var boxIndexInHtml = $(".box").index($moveBox);
    var boxIndexInArr = boxPosition[boxIndexInHtml];
    //获取指定movebox上右下左box中的数字
    var surroundBoxIndex = new Array(4);
    var sqrt = parseInt(Math.sqrt(boxNumber));
    surroundBoxIndex[0] = (boxIndexInArr >= sqrt) ? (boxIndexInArr - sqrt) : (-1);              //若moveBox在第一行，则不可以向上移动
    surroundBoxIndex[1] = ((boxIndexInArr + 1) % sqrt != 0) ? (boxIndexInArr + 1) : (-1);       //若moveBox在最后一列，则不可以向右移动
    surroundBoxIndex[2] = (boxIndexInArr <= (boxNumber - sqrt)) ? (boxIndexInArr + sqrt) : (-1);    //若moveBox在最后一行，则不可以向下移动
    surroundBoxIndex[3] = (boxIndexInArr % sqrt != 0) ? (boxIndexInArr - 1) : (-1);             //若moveBox在第一列，则不可以向左移动
    //将surroundBoxIndex中的值与specialBox比较，若相等则代表当前$moveBox可以移动，返回移动方向
    for (var i = 0; i < 4; ++i) {
        if (surroundBoxIndex[i] != -1) {                                //判断surroundBoxIndex是否越界
            var specialBoxIndexInHtml = $(".box").index($("#specialBox"));
            var specialBoxIndexInArr = boxPosition[specialBoxIndexInHtml];
            if (surroundBoxIndex[i] == specialBoxIndexInArr) {          //判断周围box是否为specialBox
                return i + 1;
            }
        }
    }
    return 0;
}

/**
 * 检查移动结果
 */
function check() {
    for(var i = 0; i < boxNumber; ++i) {
        if(boxPosition[i] != i) {
            return;
        }
    }

    // saveScore();
    //playVoice("media/1.mp3");
    setTimeout(function(){
        alert("成功啦!!!本次步数为:" + moveCount+",继续加油吧!!!");
        moveCount = 0;
        showSteps();
        arrangeAtRandom();
        // loadPhb();
    }, 600);
}

function checkOnly() {
    for(var i = 0; i < boxNumber; ++i) {
        if(boxPosition[i] != i) {
            alert("拼图还未完成,继续加油吧!")
            return;
        }
    }

}

function playVoice(file) {
    $('#voice').html('<audio controls="controls" id="audio_player" style="display:none;"> <source src="' + file + '" > </audio><embed id="MPlayer_Alert" src="' + file + '" loop="false" width="0px" height="0px" /></embed>');
}

/**
 * 重置函数
 */
function reset() {
    var $resetButton = $("#reset");
   // var $randomResetBotton = $("#randomReset");
    $resetButton.click(function() {
        //todo
        runTest();
        moveCount = 0;
        showSteps();
    });
    // $randomResetBotton.click(function() {
    //     var boxNumberArr = [9, 16, 25];
    //     var gameDifficultyArr = ["easy", "simple", "hard"];
    //     var gamePatternArr = ["number", "img"];
    //     var random1, random2, random3;
    //     random1 = parseInt(Math.random()*3);
    //     random2 = parseInt(Math.random()*3);
    //     random3 = parseInt(Math.random()*2);
    //     boxNumber = boxNumberArr[random1];
    //     gameDifficulty = gameDifficultyArr[random2];
    //     gamePattern = gamePatternArr[random3];
    //     runTest();
    //     moveCount = 0;
    //     showSteps();
    //     var $select = $("select");
    //     //todo
    // });
}

/**
 * 展示移动步数函数
 */
function showSteps() {
    var moveCountSpan = $("#showSteps span");
    moveCountSpan.text(moveCount);
}

/**
 * 测试函数
 */
function runTest() {
    //首次加载时，默认生成数字模式九宫格简单难度
    generate();

    //用户改变select值
    selectChange();

    //用户重置
    reset();
}



//切割图片
function imgSplit() {
    moveCount = 0;
    showSteps();

    img= "pic/"+imgPic;

    width = $("#container").width();
    height = $("#container").height();
    if(height===0){
        height=width;
    }

    lever=Math.sqrt(boxNumber);

    cellWidth = width/lever;
    cellHeight = height/lever;

    imgOrigArr = [];
    imgRandArr = [];
    $("#container").html("");

    var dd = (lever-1)+""+(lever-1);

    $("#targetPic").attr("src",img);
    for (var i = 0; i < lever; i++){
        for (var j = 0; j < lever; j++){
            imgOrigArr.push(i*lever+j);
            var bbb=i+""+j;

            if(dd==bbb) {
                $cell = $("<div id=\"specialBox\" class=\"box\">" + "</div>");
            }else{
                $cell = $("<div class=\"box\">" + "</div>");
            }

            $cell.attr("numm", bbb)
            $cell.css({width: cellWidth - 2, height: cellHeight - 2, left: j * cellWidth, top: i * cellHeight, background: "url('"+ img +"')", backgroundPosition: (-j)*cellWidth + 'px ' + (-i)*cellHeight + 'px'});
            $cell.css({backgroundSize:width});
            $("#container").append($cell);
        }
    }
}

function getScoreMsg(type){
    var array=[];
    $.ajax({
        type:"GET",
        url:"http://139.224.148.219/data?appID=itlab-wqs&type="+type,
        data:"",
        dataType:"json",
        async:false,
        success:function (msg) {
            array=JSON.parse(msg[0].data);
        },
        error:function(error){
            console.log(error);
          //  alert("系统错误,联系管理员！！！");
        }
    });
    return array;

}

// function loadPhb(){
//     var high=[];
//     var middle=[];
//     var easy=[];
//     $.ajax({
//         type:"GET",
//         url:"http://139.224.148.219/data?appID=itlab-wqs&type=score25",
//         data:"",
//         dataType:"json",
//         async:true,
//         success:function (msg) {
//             high=JSON.parse(msg[0].data);
//             $.ajax({
//                 type:"GET",
//                 url:"http://139.224.148.219/data?appID=itlab-wqs&type=score16",
//                 data:"",
//                 dataType:"json",
//                 //async:false,
//                 success:function (msg) {
//                     middle=JSON.parse(msg[0].data);
//                     $.ajax({
//                         type:"GET",
//                         url:"http://139.224.148.219/data?appID=itlab-wqs&type=score9",
//                         data:"",
//                         dataType:"json",
//                         //async:false,
//                         success:function (msg) {
//                             easy=JSON.parse(msg[0].data);
//                             high.sort(function (a,b) {
//                                 return parseInt(a.step)-parseInt(b.step);
//                             });

//                             middle.sort(function (a,b) {
//                                 return parseInt(a.step)-parseInt(b.step);
//                             });

//                             easy.sort(function (a,b) {
//                                 return parseInt(a.step)-parseInt(b.step);
//                             });
//                             var phb=high.concat(middle).concat(easy);
//                             var num=11;
//                             if(phb.length<10){
//                                 num=phb.length+1;
//                             }

//                             $("#ttbody").html("");
//                             for(var i=1;i<num;i++){
//                                 $line=$("<tr><td class=\"tabletd\">"+i+"</td>\n" +
//                                     "<td class=\"tabletd\">"+phb[i-1].name+"</td>\n" +
//                                     "<td class=\"tabletd\">"+phb[i-1].level+"</td>\n" +
//                                     "<td class=\"tabletd\">"+phb[i-1].pic+"</td>\n" +
//                                     "<td class=\"tabletd\">"+phb[i-1].step+"</td>\n" +
//                                     "</tr>");

//                                 $("#ttbody").append($line);

//                             }

//                         },
//                         error:function(error){
//                             console.log(error);
//                             //  alert("系统错误,联系管理员！！！");
//                         }
//                     });

//                 },
//                 error:function(error){
//                     console.log(error);
//                     //  alert("系统错误,联系管理员！！！");
//                 }
//             });

//         },
//         error:function(error){
//             console.log(error);
//             //  alert("系统错误,联系管理员！！！");
//         }
//     });

// }


function pullWindow(){

    // 获取弹窗
    var modal = document.getElementById('myModal');
    modal.style.display = "block";

    // 获取 <span> 元素，用于关闭弹窗 that closes the modal
    var beginBtn = document.getElementById("beginBtn");



// 点击 <span> (x), 关闭弹窗
    beginBtn.onclick = function() {
        //存用户
        var name = document.getElementById("nickName").value;
        if(name == "" || name == null || name == undefined){ // "",null,undefined
            return
        }
        //检查用户名

        var pattern=/^[a-zA-Z0-9_-]{3,9}$/;
        if(!pattern.test(name)){
            alert("用户名格式有误、字母+数字 3-9位");
            return;
        }

        window.sessionStorage.setItem('pt_nick_name', name);

        modal.style.display = "none";

    }

// 在用户点击其他地方时，关闭弹窗
//     window.onclick = function(event) {
//         if (event.target == modal) {
//             modal.style.display = "none";
//         }
//     }


}

// function saveScore(){
//     var type;
//     var level;
//     if(boxNumber===9){
//         type=score9;
//         level="简单";
//     }else if(boxNumber===16){
//         type=score16;
//         level="中级";

//     }else {
//         type=score25;
//         level="困难";
//     }

//     var picN;
//     if(imgPic==="tsdl.jpg"){
//         picN="通商大楼";
//     }else if(imgPic==="sj.jpg"){
//         picN="生机";
//     }else {
//         picN="拔河比赛";
//     }


//     var arrayE=getScoreMsg(type);
//     var name =  window.sessionStorage.getItem('pt_nick_name', name);
//     if(name == "" || name == null || name == undefined){ // "",null,undefined
//         alert("系统错误,联系管理员！！！");
//         return;
//     }

//     var msgInfo={
//         "name":name,
//         "level":level,
//         "pic":picN,
//         "step":moveCount+""
//     };
//     arrayE.push(msgInfo);
//     //排序
//     arrayE.sort(function (a,b) {
//         return parseInt(a.step)-parseInt(b.step);
//     });

//     if(arrayE.length>5){
//         arrayE.slice(0,5)
//     }

//     $.ajax({
//         type:"PUT",
//         url:"http://139.224.148.219/data?appID=itlab-wqs&type="+type,
//         data:JSON.stringify(arrayE),
//         headers: {
//             "Content-Type": "application/json"
//         },
//         dataType:"json",
//         async:false,
//         success:function (msg) {
//             console.log(msg)
//         },
//         error:function(){
//             alert("系统错误,联系管理员！！！");
//         }
//     });
// }

/**
 * 启动函数
 */
$(document).ready(function() {
    //检查
    // loadPhb();
    runTest();
    var name =  window.sessionStorage.getItem('pt_nick_name', name);
    if(name == "" || name == null || name == undefined){ // "",null,undefined
        //唤起窗口输入昵称
        pullWindow();
        return;
    }


});