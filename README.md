# Stopwatch code review

The refactor in this repo uses functional components and hooks. The code review in the next section goes over what it will take to fix the issues in the current class-based component.

Get started:
```
npm install
npm run dev
```

Then go to http://localhost:5173/

## Code review

**Clear `setInterval` when component unmounts**

To avoid memory leaks, we should clear the current `setInterval` when the component unmounts:

```
componentWillUnmount() {
  clearInterval(this.state.incrementer)
}
```

**Functions are not referring to the correct execution context**

Using `this` in `handleStartClick` does not refer to the execution context of the outer scope. There are two ways we can fix this: using `.bind` or arrow functions. The second approach is often simpler and easier to implement. The same applies to the other functions as well.

**Move `incrementer` to component state**

Since `incrementer` is being referenced in the render method, it needs to be tracked in component state, otherwise the component won't know to re-render when it changes.

**Avoid using `this.forceUpdate()`**

We can avoid having to forcefully trigger a render if we keep `lap` in component state. We will also have to use `.filter` instead of `.splice` since we won't be mutating the array anymore:

```
handleLapClick = () => {
  this.setState({
    laps: [...this.state.laps, this.state.secondsElapsed]
  })
}

handleDeleteClick = (index: number) => {
  this.setState({
    laps: this.state.laps.filter((_lap, lapIndex) => lapIndex !== index)
  })
}
```

**Remove usages of `any` and add types for state**

```
interface StopwatchState {
  secondsElapsed: number
  lastClearedIncrementer: number | undefined
  laps: number[]
  incrementer: number | undefined
}

class Stopwatch extends Component<StopwatchProps, StopwatchState> { ... }
```

**`key` is missing when rendering the list of laps**

The `key` property is being placed within the `Lap` component, when it should be placed on the top level component within the `.map` function.

**The `stopwatch-laps` class should be within the conditional**

This can cause issues if `stopwatch-laps` has styling. If the laps list is not being rendered, then the styling for the wrapping element will still appear.

**Use one set of conditions to render the `reset` and `lap` buttons**

We can simplify the rendering of the `reset` and `lap` buttons by using a `Fragment`. This makes it easier to read since we don't have to mentally parse 2 separate sets of conditions. This also makes it so that it's not possible for both buttons to be rendered at the same time, in case of a logic error:

```
{secondsElapsed !== 0 && (
  <Fragment>
    {incrementer === lastClearedIncrementer ? (
      <button type="button" onClick={this.handleResetClick}>
        reset
      </button>
    ) : (
      <button type="button" onClick={this.handleLapClick}>
        lap
      </button>
    )}
  </Fragment>
)}
```

**Other changes**

- Small typo: `handleLabClick` -> `handleLapClick`
- We can clean up the `Lap` component by creating an interface and destructuring the props
- We should probably also reset `incrementer` and `lastClearedIncrementer` in `handleResetClick`. Even though it's not necessary now, it could cause problems down the line
- The type for `onDelete` throws a linting error: `Don't use {} as a type. {} actually means "any non-nullish value"`
- The condition of `this.laps` in the template will always return true for an array, even if it's empty. If we want to check whether an array has values, we can use `laps.length > 0`

## Refactored class-based component

This is what all the above changes look like when implemented:

```
import { Component, ClassAttributes, Fragment } from 'react'

const formattedSeconds = (seconds: number) =>
  Math.floor(seconds / 60) + ':' + ('0' + (seconds % 60)).slice(-2)

interface StopwatchProps extends ClassAttributes<Stopwatch> {
  initialSeconds: number
}

interface StopwatchState {
  secondsElapsed: number
  lastClearedIncrementer: number | undefined
  laps: number[]
  incrementer: number | undefined
}

class Stopwatch extends Component<StopwatchProps, StopwatchState> {
  constructor(props: StopwatchProps) {
    super(props)
    this.state = {
      secondsElapsed: props.initialSeconds,
      lastClearedIncrementer: undefined,
      laps: [],
      incrementer: undefined
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.incrementer)
  }

  handleStartClick = () => {
    const incrementer = setInterval(
      () =>
        this.setState({
          secondsElapsed: this.state.secondsElapsed + 1
        }),
      1000
    )

    this.setState({ incrementer })
  }

  handleStopClick = () => {
    clearInterval(this.state.incrementer)
    this.setState({
      lastClearedIncrementer: this.state.incrementer
    })
  }

  handleResetClick = () => {
    clearInterval(this.state.incrementer)
    this.setState({
      secondsElapsed: 0,
      lastClearedIncrementer: undefined,
      laps: [],
      incrementer: undefined
    })
  }

  handleLapClick = () => {
    this.setState({
      laps: [...this.state.laps, this.state.secondsElapsed]
    })
  }

  handleDeleteClick = (index: number) => {
    this.setState({
      laps: this.state.laps.filter((_lap, lapIndex) => lapIndex !== index)
    })
  }

  render() {
    const { secondsElapsed, lastClearedIncrementer, laps, incrementer } =
      this.state

    return (
      <div className="stopwatch">
        <h1 className="stopwatch-timer">{formattedSeconds(secondsElapsed)}</h1>

        {secondsElapsed === 0 || incrementer === lastClearedIncrementer ? (
          <button
            type="button"
            className="start-btn"
            onClick={this.handleStartClick}
          >
            start
          </button>
        ) : (
          <button
            type="button"
            className="stop-btn"
            onClick={this.handleStopClick}
          >
            stop
          </button>
        )}

        {secondsElapsed !== 0 && (
          <Fragment>
            {incrementer === lastClearedIncrementer ? (
              <button type="button" onClick={this.handleResetClick}>
                reset
              </button>
            ) : (
              <button type="button" onClick={this.handleLapClick}>
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
                onDelete={() => this.handleDeleteClick(i)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}

interface LapProps {
  index: number
  lap: number
  onDelete: () => void
}

const Lap = ({ index, lap, onDelete }: LapProps) => (
  <div className="stopwatch-lap">
    <strong>{index + 1}</strong>/ {formattedSeconds(lap)}
    <button onClick={onDelete}> X </button>
  </div>
)
```
