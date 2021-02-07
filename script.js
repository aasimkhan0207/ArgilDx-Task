const mainContent = document.getElementById("main-content");
const cardTemplate = document.getElementById("card-container");

// slider element
const slider = document.getElementById("slider");
const showSlider = document.getElementById("slider-point");

let data_all = [];
let screen_data = [];

// Pagination
function paginate() {
  var items = $(".card");
  var numItems = items.length;
  var perPage = 6;
  items.slice(perPage).hide();

  $("#pagination-view").pagination({
    items: numItems,
    itemsOnPage: perPage,
    prevText: "&laquo;",
    nextText: "&raquo;",
    onPageClick: function (pageNumber) {
      var showFrom = perPage * (pageNumber - 1);
      var showTo = showFrom + perPage;
      items.hide().slice(showFrom, showTo).show();
    },
  });
}

// Sorting
function sortData(arr, param) {
  if (param == "hp") {
    arr.sort((a, b) => b.Horsepower - a.Horsepower);
  } else {
    arr.sort((a, b) => b.Year - a.Year);
  }
}

function applySort() {
  let param = document.getElementById("main-sort").value;
  sortData(screen_data, param);
  displayContent(screen_data);
}

// Function Fetch
function fetchAPI(callback) {
  const api = "https://api.jsonbin.io/b/5ff7e18809f7c73f1b6f05e3/2";

  fetch(api, {
    method: "GET",
    headers: {
      "secret-key":
        " $2b$10$XnRQ8lXD0phXmFoYQp5.VOBeiO3TmKBs8hfmZ2Uw04Ju3rpP/Bi6i",
    },
  })
    .then((res) => res.json())
    .then(function (data) {
      return callback(false, data);
    })
    .catch(function (err) {
      console.log(err);
      return callback(true);
    });
}

// Function create a card
function createCard(car) {
  const {
    Capacity,
    Category,
    Fuel_type,
    Gearbox_type,
    Horsepower,
    Image,
    Name,
    Rate,
    Year,
  } = car;

  const clone = document.importNode(cardTemplate.content, true);
  clone.querySelector(".card-title").innerHTML = Name;
  clone.querySelector(".capacity").innerHTML = Capacity;
  clone.querySelector(".fuel-type").innerHTML = Fuel_type;
  clone.querySelector(".gearbox").innerHTML = Gearbox_type;
  clone.querySelector("img").src = Image;
  //   clone.querySelector(".").innerHTML = Category;
  clone.querySelector(".horsepower").innerHTML = Horsepower + "HP";
  //   clone.querySelector(".").innerHTML = Rate;
  clone.querySelector(".year").innerHTML = Year;
  return clone;
}

// clear mainContent DOM
function clearContainer() {
  let firstChild = mainContent.firstElementChild;
  while (firstChild) {
    mainContent.removeChild(firstChild);
    firstChild = mainContent.firstElementChild;
  }
}

// Function Display element on DOM
function displayContent(data) {
  clearContainer();
  data.forEach((car) => {
    const card = createCard(car);
    mainContent.appendChild(card);
  });

  paginate();
}

function max_min_val(arr) {
  if (!arr) {
    console.log("no result");
    return null;
  }

  let min = 1000000;
  let max = -1;

  arr.forEach((data) => {
    const { Horsepower } = data;
    if (Horsepower >= max) max = Horsepower;
    if (Horsepower <= min) min = Horsepower;
  });

  return { min: min, max: max };
}

// Function SetSlider
function setSlider() {
  //   if (!arr) return;

  const { min, max } = max_min_val(data_all);
  slider.setAttribute("min", min);
  slider.setAttribute("max", max);
  slider.setAttribute("val", 100);

  showSlider.innerHTML = min + " HP";
}

// SLIDER show
slider.oninput = function () {
  showSlider.innerHTML = `${this.value} HP`;
};

// Fetch All and Display
function loadCarsData() {
  fetchAPI((err, data) => {
    if (err) {
      console.log("data can't be loaded");
    } else {
      console.log(data);

      data_all = data.slice(); // clone to global var
      screen_data = data.slice();

      // sort by HP desc.
      //data.sort((a, b) => b.Horsepower - a.Horsepower);
      sortData(data, "hp");

      displayContent(data);
      document.getElementById("main-offer").innerHTML =
        "Available offers " + data.length;

      setSlider(data);
    }
  });
}

// FILTER
function applyFilter(event) {
  let fuelElement = document.getElementById("select-fuel-type");
  let gearElement = document.getElementById("select-gearbox");

  // Get values
  let selected_fuelType = fuelElement.value;
  let selected_gearbox = gearElement.value;

  // Get min and val
  let min = slider.getAttribute("min");
  let value = slider.value;

  // apply filters (fuel, gearbox)
  let filteredCar = data_all.filter((car) => {
    if (selected_fuelType === "none" && selected_gearbox === "none") {
      return car;
    }

    if (selected_fuelType == "none")
      return car.Gearbox_type == selected_gearbox;

    if (selected_gearbox == "none") return car.Fuel_type == selected_fuelType;
    else
      return (
        car.Gearbox_type == selected_gearbox &&
        car.Fuel_type == selected_fuelType
      );
  });

  // apply filter (range)
  filteredCar = filteredCar.filter((car) => {
    return car.Horsepower >= min && car.Horsepower <= value;
  });

  screen_data = filteredCar.slice();
  console.log(screen_data);

  // Display result
  displayContent(filteredCar);

  document.getElementById("main-offer").innerHTML =
    "Available offers " + filteredCar.length;
}

function main() {
  loadCarsData();
}

window.onload = main;
