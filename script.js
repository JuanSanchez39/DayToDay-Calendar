let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNumbers = {
  january: 01,
  february: 02,
  march: 03,
}


async function apiRequest() {
  var response = await fetch("https://date.nager.at/api/v3/publicholidays/2023/US");
  var jsonData = await response.json();
  return jsonData;
}

async function getMonthData() {
  var data = await apiRequest();
  var filterData = [];
  for (let i = 0; i < data.length; i++) {
    console.log(data[i].date[5] + data[i].date[6]);
    if (data[i].date[5] + data[i].date[6] === "05") {
      filterData.push(data[i])
    }
  }
  console.log(filterData);
}

getMonthData();

async function getDayData() {
  var data = await apiRequest();
  var filterData = [];
  for (let i = 0; i < data.length; i++) {
    console.log(data[i].date[5] + data[i].date[6]);
    if (data[i].date[8] + data[i].date[9] === "29") {
      filterData.push(data[i])
    }
  }
  console.log(filterData);
}

getDayData();

//Back-to-Top button event listener//
window.addEventListener('resize', function() {
var backButton = document.querySelector('blaze-back-to-top');
var isMobile = window.innerWidth <= 920;

if (isMobile) {
  backButton.style.display = 'block';
} else {
  backButton.style.display = 'none';
}
});

//Step 2 - Filter out holidays not in the current month
//Step 3 - Loop through all holidays for the current month
//Step 4 - Put them on the page in the correct place

function openModal(date) {
  clicked = date;

  const eventForDay = events.find(e => e.date === clicked);

  if (eventForDay) {
    document.getElementById('eventText').innerText = eventForDay.title;
    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
}

async function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  var data = await apiRequest();
  var monthHolidays = {}
  function getHolidays(monthNum) {
    const holidayArr = data.filter(holidayObj => holidayObj.date.split('-')[1] == monthNum);
    holidayArr.forEach(holidayObj => {
      monthHolidays[`${holidayObj.date.split('-')[2]}`] = holidayObj.localName;
    });
  };
  let monthNum = month < 9 ? `0${month + 1}` : month + 1;
  getHolidays(monthNum);

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText =
    `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const eventForDay = events.find(e => e.date === dayString);

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      if (eventForDay) {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.innerText = eventForDay.title;
        daySquare.appendChild(eventDiv);
      }

      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    for(const date in monthHolidays){
      if(date == i - paddingDays){
        const holidayText = document.createElement('span');
        holidayText.innerText = monthHolidays[date];
        daySquare.appendChild(holidayText);
      };
    };
    
    calendar.appendChild(daySquare);
  }
}

function closeModal() {
  eventTitleInput.classList.remove('error');
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  clicked = null;
  load();
}

function saveEvent() {
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove('error');

    events.push({
      date: clicked,
      title: eventTitleInput.value,
    });

    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
  } else {
    eventTitleInput.classList.add('error');
  }
}

function deleteEvent() {
  events = events.filter(e => e.date !== clicked);
  localStorage.setItem('events', JSON.stringify(events));
  closeModal();
}

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('deleteButton').addEventListener('click', deleteEvent);
  document.getElementById('closeButton').addEventListener('click', closeModal);
}

initButtons();
load();

/*Fetched NASA api and api key. Displayed api data.*/

const url = 'https://api.nasa.gov/planetary/apod?api_key='
const api_key = config.NASA_API_KEY

const fetchNASAData = async () => {
  try {
    const response = await fetch(`${url}${api_key}`)
    const data = await response.json()
    console.log('NASA APOD data', data)
    displayData(data)
  } catch (error) {
    console.log(error)
  }
}

const displayData = data => {
  document.getElementById('title').textContent = data.title
  document.getElementById('date').textContent = data.date
  document.getElementById('picture').src = data.hdurl
  document.getElementById('explanation').textContent = data.explanation
  
}

fetchNASAData()


