import { useState, useEffect } from "react";
//importing all components
import Navbar from "./Components/Navbar";
import FilterSection from "./Components/FilterSection";
import CardsDisplay from "./Components/CardsDisplay";
// importing axios
import axios from "axios";
// importing stylesheet
import "./assets/styles/main.css";

function App() {
  //setting state
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("nearest");
  const [user, setUser] = useState({});

  const [narrAll, setNArrAll] = useState();
  const [uarrAll, setUArrAll] = useState();
  const [parrAll, setPArrAll] = useState();
  const [narrCur, setNArrCur] = useState();
  const [uarrCur, setUArrCur] = useState();
  const [parrCur, setPArrCur] = useState();

  const [stateArr, setStateArr] = useState();
  const [cityArr, setCityArr] = useState();
  const [fState, setFState] = useState("");
  const [fCity, setFCity] = useState("");
  const [map, setMap] = useState();

  useEffect(() => {
    async function fetchData() {
      //fetching user data
      await axios
        .get("https://assessment.api.vweb.app/user")
        .then(async (response) => {
          setUser(response.data);

          //fetching array of all objects
          await axios
            .get("https://assessment.api.vweb.app/rides")
            .then((res) => {
              const temp1 = res.data;
              const arr = res.data;
              let d;
              let user_d = response.data.station_code;

              //distance value for all objects
              for (let i = 0; i < arr.length; i++) {
                d = 10000000;
                for (let j = 0; j < arr[i].station_path.length; j++) {
                  if (Math.abs(arr[i].station_path[j] - user_d) < d) {
                    d = Math.abs(arr[i].station_path[j] - user_d);
                  }
                }
                temp1[i].distance = d;
              }

              //sorting by distance
              for (let i = 0; i < temp1.length; i++) {
                for (let j = 0; j < temp1.length; j++) {
                  if (temp1[i].distance < temp1[j].distance) {
                    let temp2 = temp1[i];
                    temp1[i] = temp1[j];
                    temp1[j] = temp2;
                  }
                }
              }

              setNArrAll(temp1);
              setNArrCur(temp1);

              //filtering upcoming and past rides
              const upcoming = temp1.filter((item) => {
                return new Date(item.date) - new Date() > 0;
              });
              const past = temp1.filter((item) => {
                return new Date(item.date) - new Date() < 0;
              });

              setUArrAll(upcoming);
              setUArrCur(upcoming);
              setPArrAll(past);
              setPArrCur(past);

              //fetching arrays of all states and cities
              const states = temp1.map((item) => {
                return item.state;
              });
              const cities = temp1.map((item) => {
                return item.city;
              });
              const statesUnique = [...new Set(states)];
              const citiesUnique = [...new Set(cities)];

              //creating an object to map state to city
              const stateMap = {};
              statesUnique.map((item) => {
                stateMap[item] = [];
              });
              for (let i = 0; i < arr.length; i++) {
                stateMap[arr[i].state].push(arr[i].city);
              }
              for (let i = 0; i < Object.keys(stateMap).length; i++) {
                stateMap[Object.keys(stateMap)[i]] = [
                  ...new Set(stateMap[Object.keys(stateMap)[i]]),
                ];
              }
              stateMap["all"] = citiesUnique;
              setMap(stateMap);
              setStateArr(statesUnique);
              setCityArr(citiesUnique);
            })
            .catch((error) => {
              console.log(error);
            });
        });
    }
    fetchData();
  }, []);

  useEffect(() => {
    //handling change in state filter
    let select = document.getElementById("citySelect");
    if (select !== null && select !== undefined) {
      select.value = "all";
    }

    if (fState !== "") {
      setCityArr(map[fState]);

      setNArrCur(narrAll.filter((item) => item.state === fState));
      setUArrCur(uarrAll.filter((item) => item.state === fState));
      setPArrCur(parrAll.filter((item) => item.state === fState));
    }
    if (fState === "all") {
      setCityArr(map[fState]);
      setNArrCur(narrAll);
      setUArrCur(uarrAll);
      setPArrCur(parrAll);
    }
  }, [fState, setFState]);

  useEffect(() => {
    //handling change in city filter
    if (fCity !== "") {
      setNArrCur(narrAll.filter((item) => item.city === fCity));
      setUArrCur(uarrAll.filter((item) => item.city === fCity));
      setPArrCur(parrAll.filter((item) => item.city === fCity));
    }

    if (fCity === "all") {
      if (fState !== "") {
        setNArrCur(narrAll.filter((item) => item.state === fState));
        setUArrCur(uarrAll.filter((item) => item.state === fState));
        setPArrCur(parrAll.filter((item) => item.state === fState));
      }
    }
  }, [fCity, setFCity]);

  return (
    <div className="App">
      <Navbar user={user} />
      <FilterSection
        filter={filter}
        setFilter={setFilter}
        show={show}
        setShow={setShow}
        uarr={uarrCur}
        parr={parrCur}
        states={stateArr}
        cities={cityArr}
        setFState={setFState}
        setFCity={setFCity}
      />
      <CardsDisplay
        array={narrCur}
        uarr={uarrCur}
        parr={parrCur}
        filter={filter}
      />
    </div>
  );
}

export default App;
