import { Fragment, useEffect, useState } from 'react'
import { formattedSeconds } from '../utils'
import Lap from './lap'

interface StopwatchProps {
  initialSeconds: number
}

const Stopwatch = ({ initialSeconds }: StopwatchProps): JSX.Element => {
  const [secondsElapsed, setSecondsElapsed] = useState(initialSeconds)
  const [lastClearedIncrementer, setLastClearedIncrementer] = useState<number>()
  const [laps, setLaps] = useState<number[]>([])
  const [incrementer, setIncrementer] = useState<number>()

  useEffect(() => {
    return () => clearInterval(incrementer)
  }, [incrementer])

  const handleStartClick = () => {
    const interval = setInterval(() => {
      setSecondsElapsed((prevState) => prevState + 1)
    }, 1000)

    setIncrementer(interval)
  }

  const handleStopClick = () => {
    clearInterval(incrementer)
    setLastClearedIncrementer(incrementer)
  }

  const handleResetClick = () => {
    clearInterval(incrementer)
    setSecondsElapsed(0)
    setLastClearedIncrementer(undefined)
    setLaps([])
    setIncrementer(undefined)
  }

  const handleLapClick = () => {
    setLaps([...laps, secondsElapsed])
  }

  const handleDeleteClick = (index: number) => {
    setLaps(laps.filter((_lap, lapIndex) => lapIndex !== index))
  }

  return (
    <div className="stopwatch">
      <h1 className="stopwatch-timer">{formattedSeconds(secondsElapsed)}</h1>

      {incrementer === lastClearedIncrementer ? (
        <button type="button" className="start-btn" onClick={handleStartClick}>
          start
        </button>
      ) : (
        <button type="button" className="stop-btn" onClick={handleStopClick}>
          stop
        </button>
      )}

      {Boolean(incrementer) && (
        <Fragment>
          {incrementer === lastClearedIncrementer ? (
            <button type="button" onClick={handleResetClick}>
              reset
            </button>
          ) : (
            <button type="button" onClick={handleLapClick}>
              lap
            </button>
          )}
        </Fragment>
      )}

      {laps.length > 0 && (
        <div className="stopwatch-laps">
          {laps.map((lap, i) => (
            <Lap
              key={i}
              index={i}
              lap={lap}
              onDelete={() => handleDeleteClick(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Stopwatch
