let currentSong = new Audio();
let songs;
let currfolder;
// this function converts seconds to minutes/seconds 
function secondsToMMSS(seconds) {
    // Round the seconds to the nearest whole number
    const roundedSeconds = Math.round(seconds);

    // Calculate the number of minutes
    const minutes = Math.floor(roundedSeconds / 60);

    // Calculate the remaining seconds
    const remainingSeconds = roundedSeconds % 60;

    // Format minutes and seconds as two-digit strings
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted string
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".au")) {
            songs.push(element.href.split(`/${folder}/`)[1])  //here .split is used for cutting songname in to pieces
        }
    }

    // Showing all songs in the playlist 
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li>
                <img class="invert" src="/images/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")} </div>
                    <div>Mohsin</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="/images/play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach eventlistner to each song 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()) //trim function is used for remove all fazool spaces before and after the API
        })
    })

    return songs

}

let playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "/images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    // document.querySelector(".songtime").innerHTML = "00 / 00"

}


async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
    
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            // console.log(folder);
            //  Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            let cardContainer = document.querySelector(".cardContainer")
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML +
            `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="54" height="54">
                        <!-- Circular background -->
                        <circle cx="12" cy="12" r="11" fill="#1ED760" />
                        <!-- SVG icon (black color) -->
                        <path d="M16.5 12L8.5 16.964V7.036L16.5 12Z" fill="#000000" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    };


    // Load the playlist whenever card the is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);  // here currentTarget id used for select entire element we have selected in `document.getElementsByClassName("card")`  or simple target sirf ossi element ko select karta hai jis py click hua ho jessy card ky andar h2 hai p hai img hai tou agr ham target likhen gy or h2 phy click karen gy toh sirf h2 hi select ho ga pura card element nahi.. 
            playMusic(songs[0])            
        })
    });
}
async function main() {

    // getting the list of all songs 
    // await getSongs("songs/ncs");
    await getSongs(`songs`);
    playMusic(songs[0], true)

    // Display all the albums on the page 
    displayAlbums()

    // attach an event listner to play, previous and next 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/images/play.svg"
        }
    })

    // Listen for timeUpdate event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMMSS(currentSong.currentTime)}
         / ${secondsToMMSS(currentSong.duration)}`
        document.querySelector(".circle").style.left = (
            currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

 
    // Applying the Eventlistner on hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Applying Eventlistner on close class 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Adding Event listner to previous button 
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    // Adding Event listner to next button 
    next.addEventListener("click", () => {
        currentSong.pause()   //idhar button ki svg ko play main karna hai abi uth kay
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    // Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add event listner to mute the track 
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if (e.target.src.includes("/images/volume.svg")) {
            e.target.src = e.target.src.replace("/images/volume.svg", "/images/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("/images/mute.svg", "/images/volume.svg")
            currentSong.volume = 0.50;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })


} main()







// GARBEGE DATA
// play first songs
// var audio = new Audio(songs[0]);
//   audio.play();

// audio.addEventListener("loadeddata", () => {
//     let duration = audio.duration;
//     console.log(audio.duration, audio.currentSrc, audio.currentTime);
//     // The duration variable now holds the duration (in seconds) of the audio clip
// });
