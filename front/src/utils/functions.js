
/**
 * Get the time ago from a timestamp in seconds
 * @param {Number} timestamp Timestamp in seconds
 */
export function getTimeAgo(timestamp){
    let finalTimeAgo = `Hace`
    let secondsAgo
    let minutesAgo
    let hoursAgo
    let daysAgo
    const now = Math.floor(new Date().getTime() / 1000)
    secondsAgo = now - timestamp
    if (secondsAgo > 60){
      minutesAgo = Math.floor(secondsAgo / 60)
      secondsAgo = secondsAgo % 60
    }
    if (minutesAgo > 60){
      hoursAgo = Math.floor(minutesAgo / 60)
      minutesAgo = minutesAgo % 60
    }
    if (hoursAgo > 24){
      daysAgo = Math.floor(hoursAgo / 24)
      hoursAgo = hoursAgo % 24
    }
    finalTimeAgo += daysAgo ? ` ${daysAgo} días` : ''
    finalTimeAgo += hoursAgo ? ` ${hoursAgo} horas` : ''
    finalTimeAgo += minutesAgo ? ` ${minutesAgo} minutos` : ''
    finalTimeAgo += secondsAgo ? ` ${secondsAgo} segundos` : ''
    return finalTimeAgo
  }