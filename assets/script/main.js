const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE = 'Sunny_Player';

const playList = $('.playlist');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const cdThumb = $('.cd-thumb');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');



const app = {

    currentIndex: 0,

    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE)) || {},

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE, JSON.stringify(this.config));
    },

    songs: [
        {
            name: 'Và khi ta ngả nghiêng',
            singer: 'Trang',
            path: './assets/music/VaKhiTaNgaNghieng-Trang-6147781.mp3',
            image: './assets/img/vakhitanganghien.jpg'
        },
        {
            name: 'Ai biết',
            singer: 'Wean',
            path: './assets/music/aibiet.mp3',
            image: './assets/img/aibiet.jpg'
        },
        {
            name: 'Blue Tequila',
            singer: 'Táo',
            path: './assets/music/BlueTe.mp3',
            image: './assets/img/bluete.jpg'
        },
        {
            name: 'Chờ ngày lời hứa nở hoa',
            singer: 'Nguyên Hà',
            path: './assets/music/Chongaynohoa.mp3',
            image: './assets/img/chongayloihuanohoa.jpg'
        },
        {
            name: 'Hơn em chỗ nào',
            singer: 'Thùy Tiên',
            path: './assets/music/Honemchonao.mp3',
            image: './assets/img/honemchonao.jpg'
        },
        {
            name: 'Mưa tháng sáu',
            singer: 'Văn Mai Hương',
            path: './assets/music/Muathang6.mp3',
            image: './assets/img/muathang6.jpg'
        },
        {
            name: 'Nàng thơ',
            singer: 'Hoàng Dũng',
            path: './assets/music/Nangtho.mp3',
            image: './assets/img/nangtho.jpg'
        },
        {
            name: 'Sài Gòn đau lòng quá',
            singer: 'Sunny',
            path: './assets/music/Saigondaulongqua.mp3',
            image: './assets/img/saigondaulongqua.jpg'
        },
    ],

    render: function(){
        const htmls = this.songs.map((song, Index) => {
            return `
            <div class="song ${Index === this.currentIndex ? 'active' : ''} "data-index="${Index}">
                <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        })
        playList.innerHTML = htmls.join('');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },

    loadCurrentSong: function(){
        const heading = $('header h2');
        const audio = $('#audio');
        // document.getElementById('audio').volume = 0.5;

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        audio.volume = 1;
    },

    handleEvent: function(){
        const _this = this;
        const cd = $('.cd');
        const cdWidth = cd.offsetWidth;

        // Xu ly cd quay va dung: 

        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 100000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        document.onscroll = function(){
           const newWidth = cdWidth - window.scrollY;
           if(newWidth > 0){
                cd.style.width = newWidth + 'px';
                cd.style.opacity = newWidth / cdWidth;
           } else {
                cd.style.width = 0;
           }
        }

        // Khi tien do bai hat thay doi --> tra ve currentTime 
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xu ly nut play:
        playBtn.onclick = function(){
            if(_this.isPlaying){ 
                audio.pause();
            } else {
                audio.play();
            }
        }

        // khi bai hat dc nghe
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // khi bai hat dc pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();

        }

        // Xu ly khi tua song
        progress.oninput = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            console.log(seekTime);
            audio.currentTime = seekTime;
        };

        // Xu ly khi an nut next 
        nextBtn.onclick = function(){
            if(_this.isRandom) {
                _this.random()
            } else {
                _this.nextSong()
            }
            audio.play();
            _this.render();
            cdThumbAnimate.cancel();
        }

        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.random()
            }else{
                _this.preSong();
            }
            audio.play();
            _this.render();
            
            cdThumbAnimate.cancel();
        };

        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle('active', _this.isRandom);
        };

        // Xu ly phat lai 1 bai hat 
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };

        // Xu ly next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                setTimeout(function(){
                    audio.play();
                }, 3000)
            }else{
            _this.nextSong();
            audio.play();}  
        };

        // Lang nghe hanh vi click vao play list
        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
           
            if (
                songNode ||
                e.target.closest('not(.option)')
            ){
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }

    },

    random: function() {
        let newIndex; 
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex == this.currentIndex );

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    preSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },


    scrollToActiveSong: function() {
        setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior: smooth,
                block:'nearest',
            });
        }, 500);
    },

    start: function () {
        this.defineProperties(); 
        this.handleEvent();
        this.loadCurrentSong();   
        this.render();
    }
}

app.start();
console.log(audio.volume);
