# Music Player Next Song Functionality Tests

This directory contains comprehensive test suites for testing the next song functionality of the MusicPlayer component across all types of songs, genres, languages, and playback modes.

## Files Overview

- `MusicPlayer.test.manual.ts` - Complete test scenarios and specifications
- `MusicPlayer.test.runner.ts` - Test execution framework for browser
- `README.MusicPlayer.Tests.md` - This documentation file

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Open the Application

Navigate to `http://localhost:3000` in your browser.

### 3. Open Browser Developer Tools

Press `F12` or `Ctrl+Shift+I` to open the developer console.

### 4. Load Test Suite

The test suite is automatically loaded when the page loads. You'll see:

```
🎵 Music Player Test Suite loaded!
💡 Available commands:
   - MusicPlayerTests.quickTests.testBasicNextSong()
   - MusicPlayerTests.quickTests.testShuffleMode()
   - MusicPlayerTests.quickTests.testGenreConsistency()
   - MusicPlayerTests.quickTests.runAllTests()
   - MusicPlayerTests.testUtils.checkMusicPlayerPresence()
   - MusicPlayerTests.testUtils.simulateNextSongClick()
   - MusicPlayerTests.testUtils.monitorSongChanges()
   - MusicPlayerTests.testUtils.testKeyboardShortcuts()
```

## Test Categories

### 🎯 High Priority Tests (Must Pass)

1. **Basic Next Song Functionality**
   - Sequential playlist navigation
   - Progress bar reset
   - Current song indicator updates

2. **Shuffle Mode**
   - Random song selection
   - No repeated songs until all played
   - Shuffle indicator visibility

3. **Repeat Modes**
   - Repeat OFF - stops at end
   - Repeat ALL - loops playlist
   - Repeat ONE - repeats current song

4. **Genre Consistency**
   - Rap songs play similar rap songs
   - Pop songs maintain pop genre
   - Language consistency maintained

### 🎵 Genre-Specific Tests

- **Rap/Hip-Hop**: Eminem, Drake, Kanye West, etc.
- **Pop**: Taylor Swift, Justin Bieber, Ariana Grande
- **Rock**: Metallica, AC/DC, Nirvana, Queen
- **Electronic/Dance**: Calvin Harris, David Guetta, Skrillex
- **Bollywood**: Hindi romantic, dance, sad songs
- **Lo-fi**: Chill music, study beats

### 🌍 Language Tests

- **English**: Pop, rock, rap, electronic
- **Hindi**: Bollywood, devotional, rap
- **Mixed**: Cross-language consistency

## Running Tests

### Quick Test Commands

```javascript
// Test basic next song functionality
MusicPlayerTests.quickTests.testBasicNextSong()

// Test shuffle mode
MusicPlayerTests.quickTests.testShuffleMode()

// Test genre consistency across all genres
MusicPlayerTests.quickTests.testGenreConsistency()

// Run all high-priority tests
MusicPlayerTests.quickTests.runAllTests()
```

### Utility Functions

```javascript
// Check if MusicPlayer is present on page
MusicPlayerTests.testUtils.checkMusicPlayerPresence()

// Simulate next song button click
MusicPlayerTests.testUtils.simulateNextSongClick()

// Monitor song changes in real-time
MusicPlayerTests.testUtils.monitorSongChanges()

// Test keyboard shortcuts
MusicPlayerTests.testUtils.testKeyboardShortcuts()
```

## Manual Testing Steps

### 1. Basic Next Song Test

1. Open Music Player
2. Search for "english pop songs"
3. Add 3-5 songs to playlist
4. Start playing first song
5. Click next song button (▶▶)
6. Verify:
   - Second song starts playing
   - Progress bar resets to 0:00
   - Current song indicator updates
   - No errors in console

### 2. Shuffle Mode Test

1. Enable shuffle mode (shuffle icon)
2. Click next song multiple times
3. Verify:
   - Songs play in random order
   - No song repeats until all played
   - Shuffle icon is highlighted

### 3. Genre Consistency Test

1. Search for "english rap songs"
2. Add rap songs to playlist
3. Play a rap song
4. Click next song
5. Verify:
   - Next song is also rap/hip-hop
   - Maintains similar mood/energy
   - Language remains English

### 4. Repeat Mode Test

1. Set repeat mode to "ALL"
2. Play through entire playlist
3. Verify:
   - After last song, playlist loops to first
   - No interruption in playback

### 5. Edge Cases

1. **Empty Playlist**: Try next song with no songs
2. **Single Song**: Test with only one song
3. **Queue Priority**: Add songs to queue, verify they play first
4. **Network Issues**: Test with slow/poor connection

## Test Results

After running tests, results are automatically exported as JSON:

```javascript
// Access test results
const results = MusicPlayerTests.runner.exportResults()
console.log(results)
```

Results include:
- Pass/fail counts
- Detailed test logs
- Performance metrics
- Error descriptions

## Browser Compatibility

Tested on:
- ✅ Chrome 120+
- ✅ Firefox 115+
- ✅ Safari 17+
- ✅ Edge 120+

## Performance Benchmarks

- Next song change: < 500ms
- Auto-population: < 2 seconds
- Search response: < 1 second
- Playlist rendering: < 100ms

## Troubleshooting

### Common Issues

1. **Test suite not loading**
   - Ensure browser console is open
   - Check for JavaScript errors
   - Verify MusicPlayer component is rendered

2. **Next song not working**
   - Check playlist has songs
   - Verify audio context is allowed
   - Check network connectivity

3. **Genre consistency failing**
   - Ensure songs have proper metadata
   - Check API response format
   - Verify inference algorithm

### Debug Commands

```javascript
// Check current playlist
console.log('Current playlist:', playlist)

// Check current song
console.log('Current song:', currentSong)

// Check next song logic
console.log('Available songs:', playlist.filter(song => !playedSongs.has(song.id)))

// Monitor API calls
// Open Network tab in DevTools to see API requests
```

## Contributing

When adding new tests:

1. Add test scenario to `NEXT_SONG_TEST_SCENARIOS` array
2. Include proper preconditions, steps, and expected results
3. Set appropriate priority level
4. Test across different browsers
5. Update this documentation

## Test Coverage

Current test coverage includes:

- ✅ Basic playback controls
- ✅ Shuffle and repeat modes
- ✅ Genre-based recommendations
- ✅ Language consistency
- ✅ Queue management
- ✅ Keyboard shortcuts
- ✅ Fullscreen mode
- ✅ Auto-play functionality
- ✅ Edge cases and error handling
- ✅ Performance testing
- ✅ Cross-browser compatibility

## Future Enhancements

- Automated test execution
- Visual regression testing
- Performance monitoring
- Accessibility testing
- Mobile device testing