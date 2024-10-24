import { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaPlay, FaPause, FaArrowLeft } from 'react-icons/fa';
import { MdSettings, MdDarkMode, MdLightMode } from 'react-icons/md';
import { PiArrowLineRightFill } from 'react-icons/pi';
import useSound from 'use-sound';
import alarmSound from './assets/sounds/alarm.mp3';
import Logo from './assets/icons/timer.png';
import 'react-circular-progressbar/dist/styles.css';

function App() {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [pomodoro, setPomodoro] = useState('pomodoro');
  const [pomodoroRound, setPomodoroRound] = useState(1);
  const [start, setStart] = useState(false);
  const [nextRound, setNextRound] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pomodoroInputData, setPomodoroInputData] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [isDark, setIsDark] = useState(false);
  const [play] = useSound(alarmSound);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeRemaining((prevState) => {
        if (prevState === 0 || nextRound == true) {
          play();
          setStart(false);
          setPomodoro((prevState) => {
            if (prevState === 'pomodoro' && pomodoroRound % 4 === 0) {
              setPomodoroRound((prevState) => prevState + 1);
              return 'long break';
            } else if (prevState === 'pomodoro' && pomodoroRound % 4 !== 0) {
              setPomodoroRound((prevState) => prevState + 1);
              return 'short break';
            } else {
              return 'pomodoro';
            }
          });

          clearInterval(timerInterval);
          setNextRound(false);

          if (pomodoro === 'pomodoro' && pomodoroRound % 4 === 0) {
            return pomodoroInputData.longBreak * 60;
          } else if (pomodoro === 'pomodoro' && pomodoroRound % 4 !== 0) {
            return pomodoroInputData.shortBreak * 60;
          } else {
            return pomodoroInputData.pomodoro * 60;
          }
        } else if (start === false && !resetTimer) {
          clearInterval(timerInterval);
          return prevState;
        } else if (start === false && resetTimer) {
          clearInterval(timerInterval);
          if (pomodoro === 'pomodoro') {
            return pomodoroInputData.pomodoro * 60;
          } else if (pomodoro === 'short break') {
            return pomodoroInputData.shortBreak * 60;
          } else {
            return pomodoroInputData.longBreak * 60;
          }
        } else {
          return prevState - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [start, nextRound, pomodoroInputData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setPomodoroInputData((prevState) => {
      return {
        ...prevState,
        [name]: value > 0 && value < 60 ? value : 1,
      };
    });

    setStart(false);
    setResetTimer(true);
  };

  const restoreDefaultInputs = () => {
    setPomodoroInputData({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
    setStart(false);
    setResetTimer(true);
  };

  const startButton = () => {
    setStart((prevState) => !prevState);
    setResetTimer(false);
  };

  // for calculating the circle bar percentage
  const timeValue =
    pomodoro === 'pomodoro'
      ? pomodoroInputData.pomodoro * 60
      : pomodoro === 'short break'
      ? pomodoroInputData.shortBreak * 60
      : pomodoroInputData.longBreak * 60;

  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const timerMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const timerSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return (
    <>
      <div className='header'>
        <div className='header-title'>
          <img src={Logo} alt='logo' />
          <div onClick={() => setShowSettings(false)}>Pomodoro App</div>
        </div>
        <div className='header-icons'>
          <div onClick={() => setIsDark((prevState) => !prevState)}>
            {isDark ? <MdLightMode /> : <MdDarkMode />}
          </div>
          <MdSettings onClick={() => setShowSettings(true)} />
        </div>
      </div>
      {!showSettings ? (
        <div className='main'>
          <div className='main-top'>
            <div
              className={`${
                pomodoro !== 'pomodoro' ? 'break-color' : ''
              } top-text`}
            >
              {pomodoro === 'pomodoro'
                ? `WORK #${pomodoroRound}`
                : pomodoro.toUpperCase()}
            </div>
            {pomodoro !== 'pomodoro' ? (
              <CircularProgressbar
                value={(100 * timeRemaining) / timeValue}
                text={`${timerMinutes}:${timerSeconds}`}
              />
            ) : (
              <CircularProgressbar
                value={(100 * timeRemaining) / timeValue}
                text={`${timerMinutes}:${timerSeconds}`}
                styles={buildStyles({
                  textColor: '#ee6349',
                  pathColor: '#ee6349',
                })}
              />
            )}
          </div>
          <div
            className={`${
              pomodoro !== 'pomodoro' ? 'break-color' : ''
            } main-bottom`}
          >
            <button className='start-button' onClick={startButton}>
              {start ? <FaPause /> : <FaPlay />}
            </button>
            {start ? (
              <PiArrowLineRightFill
                className='arrow-icon'
                onClick={() => setNextRound(true)}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className='settings'>
          <div className='arrow-left' onClick={() => setShowSettings(false)}>
            <FaArrowLeft />
            <div>Return to Pomodoro</div>
          </div>
          <div className={`slider-div ${isDark ? 'dark' : ''}`}>
            <div>Work</div>
            <input
              name='pomodoro'
              className='input'
              type='number'
              min='1'
              max='59'
              value={pomodoroInputData.pomodoro}
              onChange={(e) => handleInputChange(e)}
            />
            <input
              name='pomodoro'
              className='slider'
              type='range'
              min='1'
              max='59'
              value={pomodoroInputData.pomodoro}
              onChange={(e) => handleInputChange(e)}
            />
          </div>

          <div className={`slider-div ${isDark ? 'dark' : ''}`}>
            <div>Short Break</div>
            <input
              name='shortBreak'
              className='input break'
              type='number'
              min='1'
              max='59'
              value={pomodoroInputData.shortBreak}
              onChange={(e) => handleInputChange(e)}
            />
            <input
              name='shortBreak'
              className='slider break'
              type='range'
              min='1'
              max='59'
              value={pomodoroInputData.shortBreak}
              onChange={(e) => handleInputChange(e)}
            />
          </div>

          <div className={`slider-div ${isDark ? 'dark' : ''}`}>
            <div>Long Break</div>
            <input
              name='longBreak'
              className='input break'
              type='number'
              min='1'
              max='59'
              value={pomodoroInputData.longBreak}
              onChange={(e) => handleInputChange(e)}
            />
            <input
              name='longBreak'
              className='slider break'
              type='range'
              min='1'
              max='59'
              value={pomodoroInputData.longBreak}
              onChange={(e) => handleInputChange(e)}
            />
          </div>

          <button className='default-button' onClick={restoreDefaultInputs}>
            Restore Defaults
          </button>
        </div>
      )}
    </>
  );
}

export default App;
