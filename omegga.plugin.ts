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
    
    let tickRate:number = 50;
    let transitionTime:number = 6000;

    this.omegga.on('cmd:geti',
    async (speaker: string) => {
      const player = this.omegga.getPlayer(speaker);
      Omegga.whisper(player, intensity.toString());
    });

    this.omegga.on('cmd:setweather',
    async (speaker: string, input: string) => {
      const player = this.omegga.getPlayer(speaker);
      if(player.isHost()){
        console.log(input);
        setWeather(parseWeather(input));
      }
    });

    this.omegga.on('cmd:tickrate',
    async (speaker: string, input: string) => {
      if(this.omegga.getPlayer(speaker).isHost()){
        tickRate = parseInt(input);
      }
    });

    this.omegga.on('cmd:transitiontime',
    async (speaker: string, input: string) => {
      if(this.omegga.getPlayer(speaker).isHost()){
        transitionTime = parseInt(input);
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
        weatherTick();
      }
    });

    this.omegga.on('cmd:tr',
    async (speaker: string, input: string) => {
      if(this.omegga.getPlayer(speaker).isHost()){
        startTransition(intensity, parseFloat(input));
      }
    });

    const MidAll = (message: string) => {
      for(const p of Omegga.players){
        Omegga.middlePrint(p, message);
      }
    }

    const startTransition = async (ystart: number, ystop: number) => {
      if(ystart != ystop){
        transitionTick(ystart, (ystop - ystart), 0.0);
      }
      
    }

    const transitionTick = async (ystart: number, ystop: number, x: number) => {
      if(x <= 1){
      intensity = (Math.sin(x) * ystop) + ystart;
      Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: intensity, cloudCoverage: intensity}}}})
      setTimeout(async () => {await transitionTick(ystart, ystop, x + (tickRate/transitionTime));}, tickRate); 
      } else {
        Omegga.whisper('orion', `x = ${x.toString()}, sin = ${((Math.sin(x) * ystop) + ystart)}`);
      }
    }

    const weatherTick = async () => {
      if (weatherStatus) {
        let min:number = -0.2;
        let max:number = +0.2;
        intensity += (Math.random() * (max - min)) + min;
        if(intensity < 0) intensity = 0;
        if(intensity > 1) intensity = 1;
        Omegga.loadEnvironmentData({data:{groups:{Sky:{weatherIntensity: intensity, cloudCoverage: intensity}}}})
        setTimeout(async () => {await weatherTick();}, 500); 
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

    return { registeredCommands: ['setweather', 'weatherstart', 'weatherstop', 'tr', 'tickrate', 'transitiontime'] };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
