import 'dotenv/config'
import axios from "axios";

async function GetWeather(location) {
  if(location.length<2){
    location="London"
  }
  var data;
  try {
    const response = await axios.get("http://api.weatherapi.com/v1/current.json?",
      { params: { key: process.env.API_KEY, q: location } });
    const city = response.data.location.name;
    const temperature = response.data.current.temp_c;
    const forecast = response.data.current.condition.text;
    const text = city + ": " + forecast + ", " + temperature + "°C";
    const image = response.data.current.condition.icon;
    data = { text: text, image: image };
  } catch (error) {
    console.log(error);
  }
  return data;
}
export { GetWeather };