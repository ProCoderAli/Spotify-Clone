let Left = document.querySelector('.left');
let Right = document.querySelector('.right');
let songCards = document.querySelector('.songcards');
let PlayPauseBtn = document.querySelector('.playpausebtn');
let seekbar = document.querySelector('.seekbar');
let progress = document.querySelector('.progress');
let circle = document.querySelector('.circle');
let volumeBtn = document.querySelector('.volumeBtn');
let Songduration = document.querySelector('.duration');
let songInfo = document.querySelector('.songinfo');
let SongCardList = document.querySelector('.list');
let previous = document.querySelector('.previous');
let next = document.querySelector('.next');

let currentSong;
let songs = [];
//For Mosue Right Click
document.addEventListener('contextmenu', function(event) {
    console.log("Don't try to Hack us");
    event.preventDefault();
});

// Menu button event listener
document.querySelector('.menu').addEventListener('click', () => {
    Left.style.display = "block";
    Right.style.display = "none";
});

// Close button event listener
document.querySelector('.close').addEventListener('click', () => {
    Left.style.display = "none";
    Right.style.display = "block";
});

// Folder names
let folderName = ['Happy Songs', 'Peaceful Naats', 'Sleep Songs'];

// Function to create folder cards
function createCards() {
    let cardHtml = '';
    folderName.forEach(folderName => {
        cardHtml += `
        <div class="playcard" data-folder="${folderName}">
            <img class="image" width="180px" height="190px" src="playlist/${folderName}/photo.jpg" alt="">
            <div class="playicon">
                <img width="21px" class="cardplay" src="/svg/cardplay.svg" alt="">
            </div>
            <h2 class="card">${folderName}</h2>
            <p class="card">ALi Haider</p>
        </div>
        `;
    });
    songCards.innerHTML = cardHtml;
    // Trigger the click event on the first card
    let cards = document.querySelectorAll('.playcard');
    cards.forEach(card => {
        card.addEventListener('click', async () => {
            SongCardList.innerHTML = ''
            let folderName = card.getAttribute('data-folder');
            await fetchAndPlaySongs(folderName);
            let songs = await getsongs(folderName);
            let songUL;
            for (const url of songs) {
                songUL = (url.split('songs/')[1]).replaceAll('%20', '')
                SongCardList.innerHTML += `
            <li class="licard" data-song-url="${url}">
               <img class="invert music-icon" src="svg/music.png" alt="">
               <p class="songcardText">${songUL}</p>
               <img class="invert play-icon" src="svg/playBtn.png" alt="">
            </li> 
               `
            }
            attachClickListeners(); // Attach click listeners after cards are generated
        });
    });
}

function attachClickListeners() {
    let songCards = document.querySelectorAll('.licard');
    songCards.forEach(card => {
        card.addEventListener('click', async () => {
            currentSong.pause()
            const songURL = card.getAttribute('data-song-url');
            currentSong = new Audio(songURL);
            let currentSongText = currentSong.src.split('songs/')[1].replaceAll('%20', '')
            songInfo.innerHTML = currentSongText
            currentSong.play();
            PlayPauseBtn.src = '/svg/pause-button.png';
            PlayPauseBtn.removeEventListener('click', togglePlayPause);
            PlayPauseBtn.addEventListener('click', togglePlayPause);

            currentSong.addEventListener('timeupdate', () => {
                let duration = secondToMinuteSecond((currentSong.duration).toFixed(2));
                let currentTime = secondToMinuteSecond((currentSong.currentTime).toFixed(0));
                let time = `${currentTime}/${duration}`;
                Songduration.innerHTML = time;
                let progressPercentage = (currentSong.currentTime / currentSong.duration) * 100;
                progress.style.width = progressPercentage + '%';
                circle.style.left = progressPercentage + '%';
            });
            // Use songURL to play the song associated with the clicked card
        });
    });
    // For space button click song play
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (currentSong.paused) {
                currentSong.play();
                PlayPauseBtn.src = '/svg/pause-button.png';
            } else {
                currentSong.pause()
                PlayPauseBtn.src = '/svg/play.svg';
            }
            e.preventDefault()
        }
    })
}

createCards(); // Call createCards function to generate cards and attach click listeners

// Function to fetch songs from a folder
async function getsongs(folderName) {
    try {
        let response = await fetch(`/playlist/${folderName}/songs`);
        if (!response.ok) {
            throw new Error('Failed to fetch songs');
        }
        let html = await response.text();
        let div = document.createElement('div');
        div.innerHTML = html;
        let songLinks = div.querySelectorAll('a[href$=".mp3"]');
        let songsArray = Array.from(songLinks).map(link => link.href);
        return songsArray;
    } catch (error) {
        console.error('Error fetching songs:', error.message);
        return [];
    }
}

// Main function
async function main() {
    createCards();
    // Event listener for volume change
    songVolume.addEventListener('click', () => {
        currentSong.volume = songVolume.value / 100;
        updateVolumeIcon();
    });

    // Event listener for volume button click
    volumeBtn.addEventListener('click', () => {
        if (currentSong.volume > 0) {
            songVolume.value = 0;
            currentSong.volume = 0;
        } else {
            songVolume.value = 30;
            currentSong.volume = 0.3;
        }
        updateVolumeIcon();
    });

    // Function to update volume icon
    function updateVolumeIcon() {
        if (currentSong.volume > 0) {
            volumeBtn.src = 'svg/volume.png';
        } else {
            volumeBtn.src = 'svg/mute.png';
        }
    }

    // Event listener for seek bar click
    seekbar.addEventListener('click', (e) => {
        let seekbarRect = seekbar.getBoundingClientRect();
        let clickX = e.clientX - seekbarRect.left;
        let seekbarWidth = seekbarRect.width;
        let seekPercentage = (clickX / seekbarWidth) * 100;
        progress.style.width = seekPercentage + '%';
        circle.style.left = seekPercentage + '%';
        currentSong.currentTime = (seekPercentage / 100) * currentSong.duration;
    });
}

// Event listener for play/pause button click
function togglePlayPause() {
    if (currentSong.paused) {
        currentSong.play();
        PlayPauseBtn.src = '/svg/pause-button.png';
    } else {
        currentSong.pause();
        PlayPauseBtn.src = '/svg/play.svg';
    }
}

// Function to convert seconds to minute:second format
function secondToMinuteSecond(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    let formattedTime = minutes + ':' + (remainingSeconds < 10 ? '0' : '')

        + remainingSeconds;
    return formattedTime;
}

// Event listener for DOMContentLoaded event
document.addEventListener('DOMContentLoaded', main);

// Function to fetch and play songs from a folder
async function fetchAndPlaySongs(folderName) {
    if (currentSong) {
        currentSong.pause();
    }

    songs = await getsongs(folderName);
    if (songs.length > 0) {
        currentSong = new Audio(songs[0]);
        let currentSongText = currentSong.src.split('songs/')[1].replaceAll('%20', '')
        songInfo.innerHTML = currentSongText
        currentSong.play();
        PlayPauseBtn.src = '/svg/pause-button.png';

        PlayPauseBtn.removeEventListener('click', togglePlayPause);
        PlayPauseBtn.addEventListener('click', togglePlayPause);

        // Event listener for time update
        currentSong.addEventListener('timeupdate', () => {
            let duration = secondToMinuteSecond((currentSong.duration).toFixed(2));
            let currentTime = secondToMinuteSecond((currentSong.currentTime).toFixed(0));
            let time = `${currentTime}/${duration}`;
            Songduration.innerHTML = time;

            let progressPercentage = (currentSong.currentTime / currentSong.duration) * 100;
            progress.style.width = progressPercentage + '%';
            circle.style.left = progressPercentage + '%';
        });

        // Event listener for Previous
        previous.addEventListener('click', playPreviousSong);

        // Event listener for Next
        next.addEventListener('click', playNextSong);

    } else {
        console.error('No songs found in the folder.');
    }
}

function playNextSong() {
    if (currentSong && songs.length > 0) {
        let currentIndex = songs.indexOf(currentSong.src);
        let nextIndex = currentIndex + 1;
        if (nextIndex < songs.length) {
            let nextSong = songs[nextIndex];
            currentSong.src = nextSong;
            currentSong.play().catch(error => {
                console.error('Failed to play next song:', error);
            });
            updateSongInfo(nextSong);
            PlayPauseBtn.src = '/svg/pause-button.png'; // Update Play/Pause button icon
        } else {
            console.log('End of playlist');
        }
    }
}

function playPreviousSong() {
    if (currentSong && songs.length > 0) {
        let currentIndex = songs.indexOf(currentSong.src);
        let previousIndex = currentIndex - 1;
        if (previousIndex >= 0) {
            let previousSong = songs[previousIndex];
            currentSong.src = previousSong;
            currentSong.play().catch(error => {
                console.error('Failed to play previous song:', error);
            });
            updateSongInfo(previousSong);
            PlayPauseBtn.src = '/svg/pause-button.png'; // Update Play/Pause button icon
        } else {
            console.log('Start of playlist');
        }
    }
}

function updateSongInfo(songURL) {
    let currentSongText = songURL.split('songs/')[1].replaceAll('%20', '');
    songInfo.innerHTML = currentSongText;
}