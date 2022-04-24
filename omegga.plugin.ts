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
    let weatherStatus:boolean = false;
    // Write your plugin!
    this.omegga.on('cmd:setweather',
    async (speaker: string, input: string) => {
      const player = this.omegga.getPlayer(speaker);
      if(player.isHost()){
        console.log(input);
        setWeather(parseWeather(input));
      }
    });

    this.omegga.on('cmd:clear',
    async (speaker: string) => {
      if(this.omegga.getPlayer(speaker).isHost()){
        weatherStatus = false;
        setWeather(WeatherState.Clear);
      }
    });

    const MidAll = (message: string) => {
      for(const p of Omegga.players){
        Omegga.middlePrint(p, message);
      }
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
        Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: 0.0, cloudCoverage: 0.0}}}})
        MidAll('The weather has cleared up.');
      } else if (state == WeatherState.LightRain){
        Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: 0.2, cloudCoverage: 0.2}}}})
        MidAll('light rain.');
      } else if (state == WeatherState.HeavyRain){
        Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: 0.6, cloudCoverage: 0.6}}}})
        MidAll('heavy rain.');
      } else if (state == WeatherState.Thunderstorm){
        Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: 1, cloudCoverage: 1}}}})
        MidAll('thunder');
      } else {
        console.log(`No weather state found for input.`);
      }
      
    }

    return { registeredCommands: ['setweather', 'clear'] };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
