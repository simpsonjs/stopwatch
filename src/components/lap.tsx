import { formattedSeconds } from '../utils'

interface LapProps {
  index: number
  lap: number
  onDelete: () => void
}

const Lap = ({ index, lap, onDelete }: LapProps): JSX.Element => (
  <div className="stopwatch-lap">
    <strong>{index + 1}</strong>/ {formattedSeconds(lap)}
    <button onClick={onDelete}> X </button>
  </div>
)

export default Lap
