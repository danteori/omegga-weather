import OmeggaPlugin, { OL, PS, PC } from 'omegga';

type Config = { foo: string };
type Storage = { bar: string };

enum WeatherState {
  Clear,
  LightRain,
  HeavyRain,
  Thunderstorm,
}

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  async init() {

    let weather:WeatherState = WeatherState.Clear;
    let weatherStatus:boolean = true;
    let intensity:number = 0.0;

    // Write your plugin!
    this.omegga.on('cmd:setweather',
    async (speaker: string, input: string) => {
      const player = this.omegga.getPlayer(speaker);
      if(player.isHost()){
        console.log(input);
        setWeather(parseWeather(input));
      }
    });

    this.omegga.on('cmd:weatherstop',
    async (speaker: string) => {
      if(this.omegga.getPlayer(speaker).isHost()){
        weatherStatus = false;
        setWeather(WeatherState.Clear);
      }
    });

    this.omegga.on('cmd:weatherstart',
    async (speaker: string) => {
      if(this.omegga.getPlayer(speaker).isHost()){
        weatherStatus = true;
        setTimeout(async () => {await weatherTick();}, 100);
      }
    });

    const MidAll = (message: string) => {
      for(const p of Omegga.players){
        Omegga.middlePrint(p, message);
      }
    }

    const weatherTick = async () => {
      intensity += (Math.random() * 0.2) - 0.1;
      Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: intensity, cloudCoverage: intensity}}}})
      if (weatherStatus) setTimeout(async () => {await weatherTick();}, 1000);
    }

    const parseWeather = (state: string) => {
      if(state == 'clear'){
        return WeatherState.Clear;
      } else if(state == 'lightrain') {
        return WeatherState.LightRain;
      } else if(state == 'heavyrain') {
        return WeatherState.HeavyRain;
      } else if(state == 'thunderstorm') {
        return WeatherState.Thunderstorm;
      }
      else{
        console.log(`No weather state found for input ${state}`);
        return WeatherState.Clear;
      }
    }

    const setWeather = (state: WeatherState) => {
      if(state == WeatherState.Clear){
        intensity = 0.0;
        MidAll('The weather has cleared up.');
      } else if (state == WeatherState.LightRain){
        intensity = 0.3;
        MidAll('light rain.');
      } else if (state == WeatherState.HeavyRain){
        intensity = 0.6;
        MidAll('heavy rain.');
      } else if (state == WeatherState.Thunderstorm){
        intensity = 1.0;
        MidAll('thunder');
      } else {
        console.log(`No weather state found for input.`);
      }

      Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: intensity, cloudCoverage: intensity}}}})
      
    }

    return { registeredCommands: ['setweather', 'weatherstart', 'weatherstop'] };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
