export const formattedSeconds = (seconds: number) =>
  Math.floor(seconds / 60) + ':' + ('0' + (seconds % 60)).slice(-2)
