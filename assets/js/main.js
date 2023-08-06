const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER    ";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const app = {
  currentIndex: 0,
  isPLaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: "Bắt vía",
      singer: "Hoàng Thùy Linh",
      path: "./assets/music/1.mp3",
      img: "./assets/img/1.jpg",
    },
    {
      name: "Cơn đau",
      singer: "Wren Evans",
      path: "./assets/music/2.mp3",
      img: "./assets/img/2.jpg",
    },
    {
      name: "Có Em",
      singer: "Madihu",
      path: "./assets/music/3.mp3",
      img: "./assets/img/3.jpg",
    },
    {
      name: "Missing You ",
      singer: "Vũ Thanh Vân",
      path: "./assets/music/4.mp3",
      img: "./assets/img/4.jpg",
    },
    {
      name: "Mỗi Khi Anh Nhìn Em ",
      singer: "Mỹ Anh",
      path: "./assets/music/5.mp3",
      img: "./assets/img/5.jpg",
    },
    {
      name: "Luôn Yêu Đời",
      singer: "Đen Vâu",
      path: "./assets/music/6.mp3",
      img: "./assets/img/6.jpg",
    },
    {
      name: "Trưa vắng",
      singer: "Bảo Anh",
      path: "./assets/music/7.mp3",
      img: "./assets/img/7.jpg",
    },
    {
      name: "Tình Em Là Đại Dương",
      singer: "Grey D",
      path: "./assets/music/8.mp3",
      img: "./assets/img/8.jpg",
    },
    {
      name: "Bài Ca Tình Yêu",
      singer: "Hoàng Dũng",
      path: "./assets/music/9.mp3",
      img: "./assets/img/9.jpg",
    },
    {
      name: "Anh Đánh Rơi Người Yêu Này",
      singer: "Andiez",
      path: "./assets/music/10.mp3",
      img: "./assets/img/10.jpg",
    },
  ],

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
        <div
          class="thumb"
          style="
            background-image: url('${song.img}');
          "
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
        `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvent: function () {
    const cdWidth = cd.offsetWidth;
    //Xử lý CD quay và dừng
    const cdThumbAnimte = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iteration: Infinity,
    });
    cdThumbAnimte.pause();
    //Xử lý phóng to thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Xử lý khi click play
    playBtn.onclick = function () {
      if (app.isPLaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    //Khi song được play
    audio.onplay = function () {
      app.isPLaying = true;
      player.classList.add("playing");
      cdThumbAnimte.play();
    };
    //Khi song bị pause
    audio.onpause = function () {
      app.isPLaying = false;
      player.classList.remove("playing");
      cdThumbAnimte.pause();
    };
    //Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    //Xử lý khi tua song
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };
    //Khi next song
    nextBtn.onclick = function () {
      if (app.isRandom) {
        app.randomSong();
      } else {
        app.nextSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };
    //Khi prev song
    prevBtn.onclick = function () {
      if (app.isRandom) {
        app.randomSong();
      } else {
        app.prevSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };
    //Xử lý bật tắt button random
    randomBtn.onclick = function () {
      app.isRandom = !app.isRandom;
      app.setConfig("isRandom", app.isRandom);
      randomBtn.classList.toggle("active", app.isRandom);
    };
    //Xủ lý phát lại bài hát khi ended
    repeatBtn.onclick = function () {
      app.isRepeat = !app.isRepeat;
      app.setConfig("isRepeat", app.isRepeat);
      repeatBtn.classList.toggle("active", app.isRepeat);
    };
    //Xử lý next song khi audio ended
    audio.onended = function () {
      if (app.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    //Lắng nghe hành vi người dùng khi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      const songOption = e.target.closest(".option");
      if (songNode || songOption) {
        //Xử lí khi click vào song
        if (songNode) {
          app.currentIndex = Number(songNode.dataset.index);
          app.loadCurrentSong();
          app.render();
          audio.play();
        }
        //Xử lí khi click vào option
        if (songOption) {
          console.log("options");
        }
      }
    };
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.img})`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  randomSong: function () {
    var newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  scrollToActiveSong() {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
  },
  start: function () {
    //Gán cấu hình vào app
    this.loadConfig();
    // Định nghĩa các thuộc tính cho object
    this.defineProperties();
    // Lắng nghe và xử lý các sự kiện (DOM Event)
    this.handleEvent();
    //Load thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();
    //Render playlist
    this.render();

    //Hiển thị trạng thái ban đầu của random và repeat
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
