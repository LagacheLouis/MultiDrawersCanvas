window.onload = function(){
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let localPlayer = {x: 0, y: 0};

    class OnlinePlayer{
        constructor(id,x,y){
            this.id = id;
            this.x = x;
            this.y = y;
            this.delta = 0;
            this.renderPos = {x: x, y: y};
            this.oldRenderPos = {x: 0,y :0};
            this.color = getRandomColor();
        }
        set(x,y){
            this.x = x;
            this.y = y;
        }

        update(){
            this.oldRenderPos = {x:this.renderPos.x,y:this.renderPos.y};
            this.renderPos.x += (this.x - this.renderPos.x) * 0.3;
            this.renderPos.y += (this.y - this.renderPos.y) * 0.3;
            this.draw();
        }

        draw(){
            ctx.beginPath();
            ctx.moveTo(this.oldRenderPos.x,this.oldRenderPos.y);
            ctx.lineTo(this.renderPos.x,this.renderPos.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 10;
            ctx.stroke();
            drawCircle(this.renderPos.x,this.renderPos.y,this.color);
        }
    }

    let online_players = new Array();
    function setOnlinePlayer(player){
      //  if(player.id != myToken){
            for(let i = 0; i < online_players.length; i++){
                if(online_players[i].id == player.id){
                    online_players[i].set(player.x,player.y);
                    return;
                }
            }
            online_players.push(new OnlinePlayer(player.id,player.x,player.y));
       // }
    }

    function drawCircle(x,y,color){
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0,0,5,0,2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    drawCircle(window.innerWidth/2,window.innerHeight/2);

    let deltaTime = 0;
    let lastCalledTime = Date.now();
    function update(){
       // ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.rect(0,0,window.innerWidth,window.innerHeight);
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.01;
        ctx.fill();
        ctx.globalAlpha = 1;
        deltaTime = (Date.now() - lastCalledTime)/1000;
        lastCalledTime = Date.now();

       // drawCircle(localPlayer.x,localPlayer.y,"green");

        online_players.forEach((player)=>{
            player.update();
        });
      
        requestAnimationFrame(update);
    }
    update();

    let socket = io.connect("/");
    let myToken = null;


    socket.on("token",function(token){
        myToken = token;
    });

    socket.on("player_update",function(player){
        console.log("test");
        setOnlinePlayer(player);
    });

    socket.on("player_exit",function(id){
        for(let i = 0;i<online_players.length;i++){
            if(online_players[i].id == id)
                online_players.splice(i,1);
        }     
    });

    setInterval(function(){
        socket.emit("clientUpdate",localPlayer);
    },1000/30);

    window.onmousemove = function(e){
        localPlayer.x = e.clientX;
        localPlayer.y = e.clientY;
    }
    
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }