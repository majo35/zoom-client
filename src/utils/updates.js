import { addMinutes, format } from 'date-fns'

const MINUTES_TO_CHECK_FOR_UPDATES = 120

// version from `version.json` - first param
// version in bundle file - second param
export const compareVersion = (latestVersion, localVersion) => {
  const versionsA = latestVersion.split(/\./g)
  const versionsB = localVersion.split(/\./g)
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift())
    const b = Number(versionsB.shift())
    if (a === b) {
      continue
    }
    return a > b || isNaN(b)
  }
  return false
}

// If no localstorage appVersion or checkForAppUpdatesAt have been set, then set them
export const setLocalStorageDateForUpdates = () => {
  if (window.localStorage.getItem('checkForAppUpdatesAt') === null) {
    window.localStorage.setItem(
      'checkForAppUpdatesAt',
      JSON.stringify(format(new Date(), 't'))
    )
  }
}

// This is useful for iOS due the cache when app is added to home screen.
export const checkIfUpdateIsNeeded = (latestVersion, localVersion) => {
  // Set new date/time for next update check
  window.localStorage.setItem(
    'checkForAppUpdatesAt',
    JSON.stringify(
      format(addMinutes(new Date(), MINUTES_TO_CHECK_FOR_UPDATES), 't')
    )
  )
  // If there is a new version available, so refresh page
  const shouldForceRefresh = compareVersion(latestVersion, localVersion)
  if (shouldForceRefresh) {
    // Reload page
    window.location.reload(true)
  }
}
