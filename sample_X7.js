'use strict';
 
// canvasの設定
const CANVAS = document.querySelector("canvas");
CANVAS.width = CANVAS.height = 512;
const ctx = CANVAS.getContext("2d");

const GOOL = false;

// 乱数生成
function rand(n) {
    return Math.floor(Math.random() * n);
}

// 迷路の横幅と高さを指定（奇数）
const width = 33, height = 33;
const maze = [];

// 迷路作成
// 迷路の2次元配列作成　壁は1、通路は0
function createMazeArray(height, width){
    // 迷路のベースを作る
    for(let y = 1; y < height+1; y++){
        maze[y] = [];
        for(let x = 1; x < width+1; x++){
            // 1行目と最終行、1列目と最終列は1
            if(y == 1 || y == height || x == 1 || x == width){
                maze[y][x] = 1;
            }
            // 奇数行の奇数列は1
            else if(y % 2 == 1 && x % 2 == 1){
                maze[y][x] = 1;
            }
            // そのほかは0
            else{
                maze[y][x] = 0;
            }
        }
    }
    // 奇数行の奇数列のみ処理
    for(let y = 3; y < height; y+=2){
        for(let x = 3; x < width; x+=2){
            // 棒を倒せる方向を配列にする
            // 右と下は全パターンでOK
            const direction = ["right", "down"];
            // 1回目なら上もOK
            if(y == 3){
                direction.push("up"); //upを一回目だけ追加
            }
            // 左が壁じゃなければ左もOK
            if(maze[y][x-1] == 0){
                direction.push("left");
            }
            switch (direction[rand(direction.length)]) {
                case "up":
                    maze[y-1][x] = 1;
                    break;
                case "right":
                    maze[y][x+1] = 1;
                    break;
                case "down":
                    maze[y+1][x] = 1;
                    break;
                case "left":
                    maze[y][x-1] = 1;
                    break;
            }
        }
    }
    // 入口と出口を作成
    maze[1][2] = 0;
    maze[height][width-1] = 0;
}

// 入力クラス
// up : 上キー
// left : 左キー
// down : 下キー
// right : 右キー
class Input{
	constructor() {
		this.up = false;
		this.left = false;
		this.down = false;
		this.right = false;
	}
	push_key(){
		addEventListener("keydown", () => {
			const key_code = event.keyCode;
			if(key_code === 37) this.left = true;
			if(key_code === 38) this.up = true;
			if(key_code === 39) this.right = true;
			if(key_code === 40) this.down = true;
			event.preventDefault();	//方向キーでブラウザがスクロールしないようにする
		}, false);
		addEventListener("keyup", () => {
			const key_code = event.keyCode;
			if(key_code === 37) this.left = false;
			if(key_code === 38) this.up = false;
			if(key_code === 39) this.right = false;
			if(key_code === 40) this.down = false;
		}, false);
	}
}

// inputオブジェクトの作成
let input = new Input();

//ゲームクラス
class Game{
    //ゴールしたときの処理
    gool_view(){
        ctx.clearRect(0,0,512,512);
        ctx.font = "8pt Arial";
        ctx.fillStyle = "red";
        ctx.fillText("G", 3, 10);
        ctx.fillText("O", 10, 15);
        ctx.fillText("O", 17, 20);
        ctx.fillText("L", 24, 25);
    }
}
//gameオブジェクトの生成
let game = new Game();

// プレイヤークラス
// x : プレイヤーのx座標
// y : プレイヤーのy座標
// r : プレイヤーの半径
// color : プレイヤーの色
class Player{
    constructor(canvas, x, y, r, color){
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color || 'red';
        this.speed = 0.1;
    }
    draw(){
        ctx.globalCompositeOperation = "source-over";//描写モードにする
        this.canvas.beginPath(); //パスの初期化
        this.canvas.fillStyle = this.color;//決めた色で塗りつぶす
        this.canvas.arc(this.x,this.y,this.r,0,2*Math.PI,true);//円を描く
        this.canvas.closePath(); //パスを閉じる
        this.canvas.fill();
    }
    move(){
        input.push_key();
        let x = this.x | 0;
        let y = this.y | 0;
        //方向キーが押されている場合は、playerが移動する
        if(input.up){
            y = (this.y - this.r*1.1-this.speed) | 0;
            if(maze[y][x] == 0){
            this.y -= this.speed;
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x,this.y+this.speed,this.r*1.1,0,2*Math.PI,true);                
            this.canvas.fill();
            }
        }
        if(input.down){
            y = (this.y + this.r*1.1+this.speed) | 0;
            if(maze[y][x] == 0){
            this.y += this.speed;
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x,this.y-this.speed,this.r*1.1,0,2*Math.PI,true);
            this.canvas.fill();
            }
        }
        if(input.right){
            x = (this.x + this.r*1.1+this.speed) | 0;
            if(maze[y][x] == 0){
            this.x += this.speed;
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x-this.speed,this.y,this.r*1.1,0,2*Math.PI,true);
            this.canvas.fill();
            }
        }
        if(input.left && maze[y][x] == 0){
            x = (this.x - this.r*1.1-this.speed) | 0;
            if(maze[y][x] == 0){
            this.x -= this.speed;
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x+this.speed,this.y,this.r*1.1,0,2*Math.PI,true);
            this.canvas.fill();
            }
        }
    }
    gool(){
        let x = this.x | 0;
        let y = this.y | 0;
        if(y == height && x == width-1){
            game.gool_view();
            GOOL = true;
        }
    }
}

let FRAME_RATE = 50; // フレームレート
let TIMER_ID = window.setInterval(main,1000/FRAME_RATE); // ループ処理(フレーム数はFRAME_RATE)


// プレイヤーのオブジェクトを作成
let player = new Player(ctx, 2.5, 1, 0.3, 'blue');

createMazeArray(height, width);

// メインループ
function main() {
    ctx.fillStyle = "purple";
    ctx.fillRect(width-1, height, 1, 1);

    // 迷路を表示
    addEventListener("load", ev => {
    // カンバスの大きさに合わせてサイズを拡大
    ctx.scale(CANVAS.width / width-1 , CANVAS.width / width-1);
    for(let y = 1; y < maze.length; y++){
        for(let x = 1; x < maze[y].length; x++){
            if(maze[y][x] == 1){
                ctx.fillStyle = "black";
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    }, false);
    
    player.move();
    player.draw();
    player.gool();

}
addEventListener('load', main(), false);