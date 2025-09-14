'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  image: string;
  url: string;
  genre?: string;
  mood?: string;
  bpm?: number;
}

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState<'all' | 'songs' | 'artists' | 'albums' | 'recent' | 'favorites' | 'queue'>('all');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [currentQueue, setCurrentQueue] = useState<Song[]>([]);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [autoSimilar, setAutoSimilar] = useState(true);
  const [songDetailsCache, setSongDetailsCache] = useState<Record<string, any>>({});
  const [searchCache, setSearchCache] = useState<Record<string, Song[]>>({});

  const audioRef = useRef<HTMLAudioElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // JioSaavn API base URL
  const API_BASE = 'https://saavn.dev';

  // Infer genre, mood, bpm from song data
  const inferMetadata = (song: Song) => {
    const name = song.name.toLowerCase();
    const artist = song.artist.toLowerCase();
    let genre = 'Bollywood';
    let mood = 'Neutral';
    let bpm = 90;

    // Rap/Hip-Hop detection
    if (name.includes('rap') || name.includes('hip hop') || name.includes('hip-hop') ||
        name.includes('diss') || name.includes('track') || name.includes('beat') ||
        name.includes('flow') || name.includes('bars') || name.includes('freestyle') ||
        name.includes('cypher') || name.includes('spit') || name.includes('lyric') ||
        name.includes('hook') || name.includes('verse') || name.includes('chorus') ||
        artist.includes('eminem') || artist.includes('drake') || artist.includes('kanye') ||
        artist.includes('jay-z') || artist.includes('nas') || artist.includes('snoop') ||
        artist.includes('50 cent') || artist.includes('game') || artist.includes('ice cube') ||
        artist.includes('tupac') || artist.includes('biggie') || artist.includes('notorious') ||
        artist.includes('nicki') || artist.includes('cardi') || artist.includes('doja cat') ||
        artist.includes('travis scott') || artist.includes('post malone') || artist.includes('lil wayne')) {
      genre = 'Rap/Hip-Hop';
      mood = 'Confident';
      bpm = 95;
    }
    // Pop detection
    else if (name.includes('pop') || name.includes('hit') || name.includes('chart') ||
             artist.includes('justin') || artist.includes('taylor') || artist.includes('ariana') ||
             artist.includes('billie') || artist.includes('olivia') || artist.includes('dua lipa') ||
             artist.includes('harry') || artist.includes('adele')) {
      genre = 'Pop';
      mood = 'Upbeat';
      bpm = 110;
    }
    // Rock detection
    else if (name.includes('rock') || name.includes('metal') || name.includes('punk') ||
             name.includes('guitar') || name.includes('band') ||
             artist.includes('metallica') || artist.includes('ac/dc') || artist.includes('nirvana') ||
             artist.includes('queen') || artist.includes('led zeppelin') || artist.includes('pink floyd')) {
      genre = 'Rock';
      mood = 'Energetic';
      bpm = 130;
    }
    // Electronic/Dance detection
    else if (name.includes('electronic') || name.includes('edm') || name.includes('house') ||
             name.includes('techno') || name.includes('dubstep') || name.includes('remix') ||
             artist.includes('avicii') || artist.includes('calvin harris') || artist.includes('david guetta') ||
             artist.includes('skrillex') || artist.includes('marshmello')) {
      genre = 'Electronic/Dance';
      mood = 'Energetic';
      bpm = 128;
    }
    // Bollywood specific detection
    else if (name.includes('love') || name.includes('pyar') || name.includes('romantic') || name.includes('dil')) {
      genre = 'Bollywood Romantic';
      mood = 'Romantic';
      bpm = 80;
    } else if (name.includes('dance') || name.includes('party') || name.includes('dhoom') || name.includes('bhangra')) {
      genre = 'Bollywood Dance';
      mood = 'Energetic';
      bpm = 120;
    } else if (name.includes('sad') || name.includes('breakup') || name.includes('tear') || name.includes('gham')) {
      genre = 'Bollywood Sad';
      mood = 'Sad';
      bpm = 70;
    } else if (name.includes('happy') || name.includes('joy') || name.includes('khushi')) {
      mood = 'Happy';
      bpm = 100;
    } else if (name.includes('chill') || name.includes('lofi') || name.includes('relax')) {
      genre = 'Lo-fi';
      mood = 'Chill';
      bpm = 75;
    }

    // Artist-based genre override
    if (artist.includes('lata') || artist.includes('mohammed rafi') || artist.includes('kishore')) {
      genre = 'Classic Bollywood';
    }

    return { genre, mood, bpm };
  };

  // Find similar songs based on current song
  const findSimilarSongs = useCallback(async (song: Song) => {
    if (!song) return [];

    try {
      let similarQueries: string[] = [];

      // Base queries that work for all genres
      similarQueries.push(song.name); // Same song name (different versions)

      // Genre-specific queries
      if (song.genre) {
        if (song.genre === 'Rap/Hip-Hop') {
          similarQueries.push(
            'rap songs',
            'hip hop tracks',
            'rap music',
            'hip hop beats',
            'rap freestyle'
          );
        } else if (song.genre === 'Pop') {
          similarQueries.push(
            'pop songs',
            'pop music',
            'top hits',
            'pop chart',
            'popular songs'
          );
        } else if (song.genre === 'Rock') {
          similarQueries.push(
            'rock songs',
            'rock music',
            'rock band',
            'guitar rock',
            'classic rock'
          );
        } else if (song.genre === 'Electronic/Dance') {
          similarQueries.push(
            'electronic music',
            'dance music',
            'edm songs',
            'electronic beats',
            'club music'
          );
        } else if (song.genre.includes('Bollywood')) {
          // Bollywood specific queries
          similarQueries.push(
            `${song.genre} songs`,
            `${song.mood || 'popular'} bollywood songs`,
            'bollywood music',
            'indian songs',
            'hindi songs'
          );
        } else {
          // Fallback for other genres
          similarQueries.push(
            `${song.genre} songs`,
            `${song.mood || 'popular'} songs`,
            `${song.genre} music`
          );
        }
      } else {
        // Fallback when genre is undefined
        similarQueries.push(
          'popular songs',
          'top hits',
          'trending music'
        );
      }

      // Remove duplicates and empty strings
      similarQueries = Array.from(new Set(similarQueries.filter(q => q && q.trim().length > 0)));

      const similarSongs: Song[] = [];

      for (const query of similarQueries.slice(0, 5)) { // Limit to 5 queries for maximum variety
        try {
          const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}&limit=20`);
          if (!response.ok) continue;

          const data = await response.json();
          if (data.success && data.data?.songs?.results) {
            const songs = data.data.songs.results
              .filter((s: any) => s.id !== song.id && s.primaryArtists !== song.artist && s.album !== song.album) // Exclude current song, same artist, and same album
              .slice(0, 12) // Limit to 12 per query
              .map((s: any) => {
                const song = {
                  id: s.id,
                  name: s.title,
                  artist: s.primaryArtists || 'Unknown Artist',
                  album: s.album || 'Unknown Album',
                  duration: 0,
                  image: s.image?.[2]?.url || s.image?.[0]?.url || '',
                  url: ''
                };
                const metadata = inferMetadata(song);
                return { ...song, ...metadata };
              });

            similarSongs.push(...songs);
          }
        } catch (error) {
          // Error fetching similar songs
        }
      }

      // Remove duplicates and limit to 50 similar songs
      const uniqueSongs = similarSongs.filter((song, index, self) =>
        index === self.findIndex(s => s.id === song.id)
      ).slice(0, 50);

      return uniqueSongs;
    } catch (error) {
      return [];
    }
  }, [API_BASE]);

  // Auto-populate playlist with similar songs
  const autoPopulateSimilarSongs = useCallback(async () => {
    if (!currentSong || !autoSimilar) return;

    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const remainingSongs = playlist.length - currentIndex - 1;

    // If fewer than 10 songs remaining, add similar songs
    if (remainingSongs < 10) {
      const similarSongs = await findSimilarSongs(currentSong);

      if (similarSongs.length > 0) {
        setPlaylist(prev => {
          // Filter out songs already in playlist
          const newSongs = similarSongs.filter(song =>
            !prev.some(existing => existing.id === song.id)
          );
          return [...prev, ...newSongs];
        });
      }
    }
  }, [currentSong, playlist, autoSimilar, findSimilarSongs]);

  // Search songs with caching
  const searchSongs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Check cache first
    if (searchCache[query]) {
      setSearchResults(searchCache[query]);
      setIsSearching(false);
      setSearchError(null);
      setShowSearchHistory(false);
      addToSearchHistory(query);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setShowSearchHistory(false);

    try {
      // Add limit parameter to reduce API response size
      const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}&limit=20`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.songs && data.data.songs.results) {
        const songs = data.data.songs.results.slice(0, 20).map((song: any) => ({
          id: song.id,
          name: song.title,
          artist: song.primaryArtists || 'Unknown Artist',
          album: song.album || 'Unknown Album',
          duration: 0,
          image: song.image?.[2]?.url || song.image?.[0]?.url || '',
          url: ''
        }));

        // Cache the results
        setSearchCache(prev => {
          const newCache = { ...prev, [query]: songs };
          // Clear cache if it gets too large
          if (Object.keys(newCache).length > 50) {
            // Keep only the 20 most recent searches
            const recentQueries = Object.keys(newCache).slice(-20);
            const filteredCache: Record<string, Song[]> = {};
            recentQueries.forEach(q => {
              if (newCache[q]) filteredCache[q] = newCache[q];
            });
            return filteredCache;
          }
          return newCache;
        });
        setSearchResults(songs);
        addToSearchHistory(query);
      } else {
        setSearchResults([]);
        setSearchError('No results found. Try different keywords.');
      }
    } catch (error) {
      setSearchResults([]);
      setSearchError('Failed to search. Please check your connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSearchError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      setShowSearchHistory(false);
      searchTimeoutRef.current = setTimeout(() => {
        searchSongs(query);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchHistory(true);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (!searchQuery.trim() && searchHistory.length > 0) {
      setShowSearchHistory(true);
    }
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    // Delay hiding to allow click on history items
    setTimeout(() => setShowSearchHistory(false), 150);
  };

  // Select from search history
  const selectFromHistory = (query: string) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
    searchSongs(query);
  };

  // Clear search history
  const clearSearchHistory = () => {
    saveSearchHistory([]);
    setShowSearchHistory(false);
  };

  // Play song
  const playSong = useCallback(async (song: Song) => {
    setIsLoading(true);
    try {
      if (audioRef.current) {
        let songData: any;
        if (songDetailsCache[song.id]) {
          songData = songDetailsCache[song.id];
        } else {
          // Fetch song details to get download URL
          setIsFetchingDetails(true);
          try {
            const response = await fetch(`${API_BASE}/api/songs?ids=${song.id}`);
            const data = await response.json();
            if (data.success && data.data && data.data[0]) {
              songData = data.data[0];
              setSongDetailsCache(prev => ({ ...prev, [song.id]: songData }));
            } else {
              setIsLoading(false);
              return;
            }
          } catch (fetchError) {
            setIsLoading(false);
            return;
          } finally {
            setIsFetchingDetails(false);
          }
        }

        const downloadUrl = songData.downloadUrl?.[4]?.url || songData.downloadUrl?.[0]?.url || '';

        if (!downloadUrl) {
          setIsLoading(false);
          return;
        }

        const updatedSong = {
          ...song,
          name: songData.name,
          artist: songData.artists.primary.map((a: any) => a.name).join(', '),
          album: songData.album.name,
          duration: songData.duration,
          image: songData.image?.[2]?.url || songData.image?.[0]?.url || song.image,
          url: downloadUrl
        };

        // Infer and add metadata
        const metadata = inferMetadata(updatedSong);
        Object.assign(updatedSong, metadata);

        audioRef.current.src = downloadUrl;
        audioRef.current.volume = volume / 100;

        try {
          await audioRef.current.play();
          setCurrentSong(updatedSong);
          setIsPlaying(true);

          // Add to recently played
          addToRecentlyPlayed(updatedSong);
        } catch (playError) {
          throw playError;
        }
      }
    } catch (error) {
      // Handle play error silently
    } finally {
      setIsLoading(false);
    }
  }, [volume, API_BASE, songDetailsCache]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
      if (!audioRef.current || !currentSong) return;
  
      try {
          if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
          } else {
              await audioRef.current.play();
              setIsPlaying(true);
          }
      } catch (error) {
          // Handle toggle error silently
      }
  }, [isPlaying, currentSong]);

  // Play from queue
  const playFromQueue = useCallback((index: number) => {
    if (index >= 0 && index < currentQueue.length) {
      const song = currentQueue[index];
      playSong(song);
      // Remove played song from queue
      setCurrentQueue(prev => prev.filter((_, i) => i !== index));
    }
  }, [currentQueue, playSong]);

  // Skip to next song
   const nextSong = useCallback(async () => {
     // If playlist is empty but queue has songs, play from queue
     if (playlist.length === 0 && currentQueue.length > 0) {
       playFromQueue(0);
       return;
     }

     if (playlist.length === 0) {
       // If no playlist but we have a current song, find similar songs
       if (currentSong) {
         const similarSongs = await findSimilarSongs(currentSong);
         if (similarSongs.length > 0) {
           setPlaylist(similarSongs);
           playSong(similarSongs[0]);
           return;
         }
       }
       return;
     }

    let nextIndex;
    if (isShuffle) {
      // Random song (excluding current if possible)
      const availableIndices = playlist
        .map((_, index) => index)
        .filter(index => playlist[index].id !== currentSong?.id);

      if (availableIndices.length === 0) {
        // If no other songs available, play random including current
        nextIndex = Math.floor(Math.random() * playlist.length);
      } else {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    } else {
      // For normal mode, also use random to prevent looping
      const availableIndices = playlist
        .map((_, index) => index)
        .filter(index => playlist[index].id !== currentSong?.id);

      if (availableIndices.length === 0) {
        // If no other songs available, play random including current
        nextIndex = Math.floor(Math.random() * playlist.length);
      } else {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    }

    if (nextIndex >= 0 && nextIndex < playlist.length) {
      playSong(playlist[nextIndex]);

      // Auto-populate similar songs if enabled
      if (autoSimilar) {
        autoPopulateSimilarSongs();
      }
    }
  }, [playlist, currentSong, playSong, isShuffle, currentQueue, playFromQueue, autoSimilar, autoPopulateSimilarSongs, findSimilarSongs]);

  // Skip to previous song
  const prevSong = useCallback(() => {
    // If playlist is empty but queue has songs, play from queue
    if (playlist.length === 0 && currentQueue.length > 0) {
      playFromQueue(0);
      return;
    }

    if (playlist.length === 0) {
      return;
    }

    if (isShuffle) {
      // In shuffle mode, previous plays a random song (could be same as current)
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playSong(playlist[randomIndex]);
      return;
    }

    const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
    let prevIndex;

    if (currentIndex === -1) {
      // Current song not found in playlist, start from last
      prevIndex = playlist.length - 1;
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }

    if (prevIndex >= 0 && prevIndex < playlist.length) {
      playSong(playlist[prevIndex]);
    }
  }, [playlist, currentSong, playSong, isShuffle, currentQueue, playFromQueue]);

  // Toggle shuffle mode
  const toggleShuffle = useCallback(() => {
      setIsShuffle(!isShuffle);
  }, [isShuffle]);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
      setRepeatMode(prev => {
          if (prev === 'off') return 'all';
          if (prev === 'all') return 'one';
          return 'off';
      });
  }, []);
  
  // Full-screen state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFallbackFullScreen, setIsFallbackFullScreen] = useState(false);
  
  // Toggle full-screen
  const toggleFullScreen = useCallback(async () => {
      try {
          if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
              setIsFullScreen(true);
              setIsFallbackFullScreen(false);
          } else {
              await document.exitFullscreen();
              setIsFullScreen(false);
              setIsFallbackFullScreen(false);
          }
      } catch (error) {
          // Handle full-screen error silently
          // Fallback for browsers that don't support full-screen API
          setIsFallbackFullScreen(!isFallbackFullScreen);
          setIsFullScreen(!isFullScreen);
      }
  }, [isFullScreen, isFallbackFullScreen]);

  // Add song to playlist
  const addToPlaylist = (song: Song) => {
    setPlaylist(prev => {
      if (!prev.find(s => s.id === song.id)) {
        const newPlaylist = [...prev, song];
        return newPlaylist;
      }
      return prev;
    });
  };

  // Remove from playlist
  const removeFromPlaylist = (songId: string) => {
    setPlaylist(prev => prev.filter(song => song.id !== songId));
  };

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('musicPlayerSearchHistory');
    if (history) {
      const parsed = JSON.parse(history);
      setSearchHistory(Array.isArray(parsed) ? parsed.slice(0, 10) : []);
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (history: string[]) => {
    localStorage.setItem('musicPlayerSearchHistory', JSON.stringify(history));
    setSearchHistory(history);
  };

  // Add to search history
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    saveSearchHistory(newHistory);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setShowSearchHistory(false);
    // Clear search cache to free memory
    setSearchCache({});
  };

  // Periodic cache cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSearchCache(prev => {
        if (Object.keys(prev).length > 30) {
          // Keep only the 15 most recent searches
          const recentQueries = Object.keys(prev).slice(-15);
          const filteredCache: Record<string, Song[]> = {};
          recentQueries.forEach(q => {
            if (prev[q]) filteredCache[q] = prev[q];
          });
          return filteredCache;
        }
        return prev;
      });
    }, 300000); // Clean up every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  // Debug current state (removed console.log for production)

  // Clear search cache if it gets too large
  const clearSearchCache = () => {
    if (Object.keys(searchCache).length > 50) {
      setSearchCache({});
    }
  };

  // Add to favorites
  const addToFavorites = (song: Song) => {
    setFavorites(prev => {
      if (!prev.find(fav => fav.id === song.id)) {
        return [...prev, song];
      }
      return prev;
    });
  };

  // Remove from favorites
  const removeFromFavorites = (songId: string) => {
    setFavorites(prev => prev.filter(song => song.id !== songId));
  };

  // Check if song is favorite
  const isFavorite = (songId: string) => {
    return favorites.some(song => song.id === songId);
  };

  // Add to recently played
  const addToRecentlyPlayed = (song: Song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(rp => rp.id !== song.id);
      return [song, ...filtered].slice(0, 20); // Keep only last 20
    });
  };

  // Add to queue
  const addToQueue = (song: Song) => {
    setCurrentQueue(prev => [...prev, song]);
  };

  // Remove from queue
  const removeFromQueue = (index: number) => {
    setCurrentQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Play from queue (moved to top for dependency order)

  // Memoize search results to avoid re-computing on every render
  const memoizedSearchResults = useMemo(() => {
    return searchResults.slice(0, 20).map((song) => ({
      ...song,
      image: song.image || '/api/placeholder/32/32'
    }));
  }, [searchResults]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        // Repeat current song
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (repeatMode === 'all' || playlist.length > 1) {
        // Play next song (repeat all or just next in playlist)
        nextSong();
      } else if (autoPlayNext && currentQueue.length > 0) {
        // Auto-play next from queue
        playFromQueue(0);
      } else if (autoSimilar && currentSong) {
        // Auto-populate similar songs and play next
        autoPopulateSimilarSongs().then(() => {
          if (playlist.length > 0) {
            nextSong();
          }
        });
      }
      // If repeat is off, no playlist, and no queue, do nothing
    };
    const handleVolumeChange = () => setVolume(audio.volume * 100);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [currentSong, nextSong, repeatMode, playlist.length, autoPlayNext, currentQueue.length, playFromQueue, autoSimilar, autoPopulateSimilarSongs]);

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle progress bar change
  const handleProgressChange = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when player is open and not typing in input
      if (!isOpen || e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            nextSong();
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            prevSong();
          }
          break;
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleShuffle();
          }
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleRepeat();
          }
          break;
        case 'Escape':
          if (isFullScreen || isFallbackFullScreen) {
            if (isFullScreen) {
              toggleFullScreen();
            } else {
              setIsFallbackFullScreen(false);
            }
          } else {
            setIsOpen(false);
          }
          break;
        case 'KeyF':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullScreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
}, [isOpen, nextSong, prevSong, togglePlayPause, toggleShuffle, toggleRepeat, toggleFullScreen, isFullScreen, isFallbackFullScreen]);

// Handle full-screen changes
useEffect(() => {
    const handleFullscreenChange = () => {
        const isCurrentlyFullScreen = !!document.fullscreenElement;
        setIsFullScreen(isCurrentlyFullScreen);
        if (!isCurrentlyFullScreen) {
            setIsFallbackFullScreen(false);
        }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, []);

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />

      {/* Music Player Button */}
      <motion.div
        className='fixed bottom-24 left-2 sm:bottom-28 sm:left-4 z-50'
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110'
        >
          {isOpen ? (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          ) : (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' />
            </svg>
          )}
        </button>

        {/* Now Playing Indicator */}
        {currentSong && (
          <motion.div
            className='absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <div className={`w-2 h-2 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
          </motion.div>
        )}
      </motion.div>

      {/* Music Player Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed bottom-36 left-2 sm:bottom-40 sm:left-4 z-50 w-96 sm:w-[28rem] lg:w-[32rem] max-h-[32rem] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-2xl overflow-hidden'
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className='bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-sm'>🎵 Music Player</h3>
                <button
                  onClick={toggleFullScreen}
                  className='text-white hover:bg-white/20 rounded-full p-1 transition-colors'
                  title='Full Screen'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className='text-white hover:bg-white/20 rounded-full p-1 transition-colors'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className='p-4 border-b border-[var(--card-border)]'>
              {/* Search Categories */}
              <div className='flex gap-2 mb-3'>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'songs', label: 'Songs' },
                  { key: 'artists', label: 'Artists' },
                  { key: 'albums', label: 'Albums' }
                ].map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSearchCategory(category.key as any)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      searchCategory === category.key
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className='relative'>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder={`Search ${searchCategory === 'all' ? 'songs, artists, albums...' : searchCategory}...`}
                  className='w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-4 py-3 pl-11 pr-20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
                <svg className='w-5 h-5 absolute left-3 top-3 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>

                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className='absolute right-12 top-3 text-gray-400 hover:text-gray-600 transition-colors'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>
                )}

                {/* Loading spinner */}
                {isSearching && (
                  <div className='absolute right-3 top-3'>
                    <div className='w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
                  </div>
                )}
              </div>

              {/* Search Error */}
              {searchError && (
                <div className='mt-2 text-red-500 text-xs'>
                  {searchError}
                </div>
              )}

              {/* Search History Dropdown */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className='absolute top-full left-0 right-0 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto'>
                  <div className='p-2 border-b border-[var(--card-border)] flex justify-between items-center'>
                    <span className='text-xs text-[var(--text-secondary)] font-medium'>Recent Searches</span>
                    <button
                      onClick={clearSearchHistory}
                      className='text-xs text-red-500 hover:text-red-600 transition-colors'
                    >
                      Clear All
                    </button>
                  </div>
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => selectFromHistory(query)}
                      className='w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-2'
                    >
                      <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      {query}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Song */}
            {currentSong && (
              <div className='p-3 border-b border-[var(--card-border)]'>
                <div className='flex items-center gap-3'>
                  <Image
                    src={currentSong.image || '/api/placeholder/40/40'}
                    alt={currentSong.name}
                    width={40}
                    height={40}
                    className='w-10 h-10 rounded object-cover'
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/40/40';
                    }}
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                      {currentSong.name}
                    </p>
                    <p className='text-xs text-[var(--text-secondary)] truncate'>
                      {currentSong.artist}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  className='mt-3 cursor-pointer'
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newTime = percentage * duration;
                    handleProgressChange(newTime);
                  }}
                >
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
                    <div
                      className='bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300'
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className='flex justify-between text-xs text-[var(--text-secondary)] mt-1'>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className='flex items-center justify-center gap-4 mt-3'>
                  {/* Shuffle Button */}
                  <button
                    onClick={toggleShuffle}
                    className={`text-[var(--text-primary)] hover:text-purple-500 transition-colors ${isShuffle ? 'text-purple-500' : ''}`}
                    title='Shuffle'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                  </button>

                  <button
                    onClick={prevSong}
                    className='text-[var(--text-primary)] hover:text-purple-500 transition-colors'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                    </svg>
                  </button>

                  <button
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50'
                  >
                    {isLoading ? (
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    ) : isPlaying ? (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 9v6m4-6v6' />
                      </svg>
                    ) : (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z' />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={nextSong}
                    className='text-[var(--text-primary)] hover:text-purple-500 transition-colors'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                  </button>

                  {/* Auto-play Button */}
                  <button
                    onClick={() => setAutoPlayNext(!autoPlayNext)}
                    className={`text-[var(--text-primary)] hover:text-green-500 transition-colors ${autoPlayNext ? 'text-green-500' : ''}`}
                    title={`Auto-play: ${autoPlayNext ? 'On' : 'Off'}`}
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                    </svg>
                  </button>

                  {/* Auto Similar Songs Button */}
                  <button
                    onClick={() => setAutoSimilar(!autoSimilar)}
                    className={`text-[var(--text-primary)] hover:text-blue-500 transition-colors ${autoSimilar ? 'text-blue-500' : ''}`}
                    title={`Auto Similar: ${autoSimilar ? 'On' : 'Off'}`}
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                    </svg>
                  </button>

                  {/* Repeat Button */}
                  <button
                    onClick={toggleRepeat}
                    className={`text-[var(--text-primary)] hover:text-purple-500 transition-colors ${repeatMode !== 'off' ? 'text-purple-500' : ''}`}
                    title={`Repeat ${repeatMode === 'off' ? 'Off' : repeatMode === 'one' ? 'One' : 'All'}`}
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                      {repeatMode === 'one' && (
                        <text x='12' y='16' fontSize='8' textAnchor='middle' fill='currentColor'>1</text>
                      )}
                    </svg>
                  </button>
                </div>

                {/* Volume */}
                <div className='flex items-center gap-2 mt-3'>
                  <svg className='w-4 h-4 text-[var(--text-secondary)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 12l-3.5 3.5V8.5L6.75 12z' />
                  </svg>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className='flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider'
                  />
                  <span className='text-xs text-[var(--text-secondary)] w-8'>{volume}%</span>
                </div>
              </div>
            )}

            {/* Recently Played & Favorites Tabs */}
            {!searchQuery && !isSearching && (
              <div className='border-b border-[var(--card-border)]'>
                <div className='flex gap-0'>
                  <button
                    onClick={() => setSearchCategory('recent')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      searchCategory === 'recent'
                        ? 'text-purple-500 border-b-2 border-purple-500'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Recently Played
                  </button>
                  <button
                    onClick={() => setSearchCategory('favorites')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      searchCategory === 'favorites'
                        ? 'text-purple-500 border-b-2 border-purple-500'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Favorites
                  </button>
                  <button
                    onClick={() => setSearchCategory('queue')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      searchCategory === 'queue'
                        ? 'text-purple-500 border-b-2 border-purple-500'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Queue ({currentQueue.length})
                  </button>
                </div>
              </div>
            )}

            {/* Recently Played */}
            {searchCategory === 'recent' && !searchQuery && recentlyPlayed.length > 0 && (
              <div className='max-h-64 overflow-y-auto'>
                <div className='p-3'>
                  <h4 className='text-sm font-medium text-[var(--text-primary)] mb-3'>Recently Played</h4>
                  {recentlyPlayed.slice(0, 10).map((song, index) => (
                    <div
                      key={`${song.id}-${index}`}
                      className='flex items-center gap-3 p-2 hover:bg-[var(--card-hover)] cursor-pointer rounded-lg transition-colors'
                      onClick={() => playSong(song)}
                    >
                      <Image
                        src={song.image || '/api/placeholder/32/32'}
                        alt={song.name}
                        width={32}
                        height={32}
                        className='w-8 h-8 rounded object-cover'
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/32/32';
                        }}
                        loading="lazy"
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                          {song.name}
                        </p>
                        <p className='text-xs text-[var(--text-secondary)] truncate'>
                          {song.artist}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFavorite(song.id)) {
                            removeFromFavorites(song.id);
                          } else {
                            addToFavorites(song);
                          }
                        }}
                        className={`text-lg transition-colors ${
                          isFavorite(song.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        ♥
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites */}
            {searchCategory === 'favorites' && !searchQuery && favorites.length > 0 && (
              <div className='max-h-64 overflow-y-auto'>
                <div className='p-3'>
                  <h4 className='text-sm font-medium text-[var(--text-primary)] mb-3'>Your Favorites</h4>
                  {favorites.slice(0, 10).map((song, index) => (
                    <div
                      key={`${song.id}-${index}`}
                      className='flex items-center gap-3 p-2 hover:bg-[var(--card-hover)] cursor-pointer rounded-lg transition-colors'
                      onClick={() => playSong(song)}
                    >
                      <Image
                        src={song.image || '/api/placeholder/32/32'}
                        alt={song.name}
                        width={32}
                        height={32}
                        className='w-8 h-8 rounded object-cover'
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/32/32';
                        }}
                        loading="lazy"
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                          {song.name}
                        </p>
                        <p className='text-xs text-[var(--text-secondary)] truncate'>
                          {song.artist}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromFavorites(song.id);
                        }}
                        className='text-red-500 hover:text-red-600 transition-colors'
                      >
                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queue */}
            {searchCategory === 'queue' && !searchQuery && currentQueue.length > 0 && (
              <div className='max-h-64 overflow-y-auto'>
                <div className='p-3'>
                  <h4 className='text-sm font-medium text-[var(--text-primary)] mb-3'>Play Queue</h4>
                  {currentQueue.slice(0, 10).map((song, index) => (
                    <div
                      key={`${song.id}-${index}`}
                      className='flex items-center gap-3 p-2 hover:bg-[var(--card-hover)] cursor-pointer rounded-lg transition-colors'
                      onClick={() => playFromQueue(index)}
                    >
                      <div className='w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-xs text-white font-bold'>
                        {index + 1}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                          {song.name}
                        </p>
                        <p className='text-xs text-[var(--text-secondary)] truncate'>
                          {song.artist}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(index);
                        }}
                        className='text-gray-400 hover:text-red-500 transition-colors'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {memoizedSearchResults.length > 0 && (
              <div className='max-h-48 overflow-y-auto'>
                {memoizedSearchResults.slice(0, 10).map((song) => (
                  <div
                    key={song.id}
                    className='flex items-center gap-3 p-3 hover:bg-[var(--card-hover)] cursor-pointer border-b border-[var(--card-border)] last:border-b-0'
                    onClick={() => playSong(song)}
                  >
                    <Image
                      src={song.image || '/api/placeholder/32/32'}
                      alt={song.name}
                      width={32}
                      height={32}
                      className='w-8 h-8 rounded object-cover'
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/32/32';
                      }}
                      loading="lazy"
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                        {song.name}
                      </p>
                      <p className='text-xs text-[var(--text-secondary)] truncate'>
                        {song.artist}
                      </p>
                    </div>
                    <div className='flex gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFavorite(song.id)) {
                            removeFromFavorites(song.id);
                          } else {
                            addToFavorites(song);
                          }
                        }}
                        className={`transition-colors ${
                          isFavorite(song.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        ♥
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToPlaylist(song);
                        }}
                        className='text-[var(--text-secondary)] hover:text-purple-500 transition-colors'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(song);
                        }}
                        className='text-[var(--text-secondary)] hover:text-green-500 transition-colors'
                        title='Add to Queue'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Playlist */}
            {playlist.length > 0 && (
              <div className='border-t border-[var(--card-border)]'>
                <div className='p-3 border-b border-[var(--card-border)]'>
                  <h4 className='text-sm font-medium text-[var(--text-primary)]'>Playlist ({playlist.length})</h4>
                </div>
                <div className='max-h-32 overflow-y-auto'>
                  {playlist.slice(0, 10).map((song) => (
                    <div
                      key={song.id}
                      className={`flex items-center gap-3 p-3 hover:bg-[var(--card-hover)] cursor-pointer ${
                        currentSong?.id === song.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                      }`}
                      onClick={() => playSong(song)}
                    >
                      <div className='w-8 h-8 rounded bg-[var(--card-bg)] flex items-center justify-center'>
                        {currentSong?.id === song.id && isPlaying ? (
                          <div className='flex gap-0.5'>
                            <div className='w-1 h-3 bg-purple-500 animate-pulse' />
                            <div className='w-1 h-2 bg-purple-500 animate-pulse' style={{ animationDelay: '0.1s' }} />
                            <div className='w-1 h-4 bg-purple-500 animate-pulse' style={{ animationDelay: '0.2s' }} />
                          </div>
                        ) : (
                          <svg className='w-4 h-4 text-[var(--text-secondary)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' />
                          </svg>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[var(--text-primary)] truncate'>
                          {song.name}
                        </p>
                        <p className='text-xs text-[var(--text-secondary)] truncate'>
                          {song.artist}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPlaylist(song.id);
                        }}
                        className='text-[var(--text-secondary)] hover:text-red-500 transition-colors'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!currentSong && memoizedSearchResults.length === 0 && playlist.length === 0 && (
              <div className='p-8 text-center'>
                <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center'>
                  <svg className='w-8 h-8 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' />
                  </svg>
                </div>
                <p className='text-[var(--text-secondary)] text-sm'>
                  Search for songs to start listening!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Player */}
      <AnimatePresence>
        {(isFullScreen || isFallbackFullScreen) && (
          <motion.div
            className='fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentSong ? (
              <div className='text-center text-white max-w-2xl mx-auto px-4'>
                {/* Album Art */}
                <motion.div
                  className='mb-8'
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Image
                    src={currentSong.image || '/api/placeholder/400/400'}
                    alt={currentSong.name}
                    width={400}
                    height={400}
                    className='w-80 h-80 mx-auto rounded-lg object-cover shadow-2xl'
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/400/400';
                    }}
                  />
                </motion.div>

                {/* Song Info */}
                <motion.div
                  className='mb-8'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className='text-4xl font-bold mb-2'>{currentSong.name}</h1>
                  <p className='text-xl text-gray-300 mb-2'>{currentSong.artist}</p>
                  <p className='text-lg text-gray-400'>{currentSong.album}</p>
                </motion.div>

                {/* Progress Bar */}
                <motion.div
                  className='w-full max-w-md mx-auto mb-8 cursor-pointer'
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newTime = percentage * duration;
                    handleProgressChange(newTime);
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <div
                      className='bg-white h-2 rounded-full transition-all duration-300'
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className='flex justify-between text-sm text-gray-400 mt-2'>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                  className='flex items-center justify-center gap-6 mb-8'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    onClick={toggleShuffle}
                    className={`text-white hover:text-purple-400 transition-colors ${isShuffle ? 'text-purple-400' : ''}`}
                    title='Shuffle'
                  >
                    <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                  </button>

                  <button
                    onClick={prevSong}
                    className='text-white hover:text-purple-400 transition-colors'
                    title='Previous'
                  >
                    <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                    </svg>
                  </button>

                  <button
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className='bg-white text-black w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50'
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isLoading ? (
                      <div className='w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin' />
                    ) : isPlaying ? (
                      <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 9v6m4-6v6' />
                      </svg>
                    ) : (
                      <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z' />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={nextSong}
                    className='text-white hover:text-purple-400 transition-colors'
                    title='Next'
                  >
                    <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                  </button>

                  <button
                    onClick={() => setAutoPlayNext(!autoPlayNext)}
                    className={`text-white hover:text-green-400 transition-colors ${autoPlayNext ? 'text-green-400' : ''}`}
                    title={`Auto-play: ${autoPlayNext ? 'On' : 'Off'}`}
                  >
                    <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                    </svg>
                  </button>

                  <button
                    onClick={() => setAutoSimilar(!autoSimilar)}
                    className={`text-white hover:text-blue-400 transition-colors ${autoSimilar ? 'text-blue-400' : ''}`}
                    title={`Auto Similar: ${autoSimilar ? 'On' : 'Off'}`}
                  >
                    <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                    </svg>
                  </button>

                  <button
                    onClick={toggleRepeat}
                    className={`text-white hover:text-purple-400 transition-colors ${repeatMode !== 'off' ? 'text-purple-400' : ''}`}
                    title={`Repeat ${repeatMode === 'off' ? 'Off' : repeatMode === 'one' ? 'One' : 'All'}`}
                  >
                    <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                      {repeatMode === 'one' && (
                        <text x='12' y='16' fontSize='8' textAnchor='middle' fill='currentColor'>1</text>
                      )}
                    </svg>
                  </button>
                </motion.div>

                {/* Volume */}
                <motion.div
                  className='flex items-center gap-4 max-w-md mx-auto mb-8'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <svg className='w-6 h-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 12l-3.5 3.5V8.5L6.75 12z' />
                  </svg>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className='flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer'
                  />
                  <span className='text-sm text-gray-400 w-8'>{volume}%</span>
                </motion.div>

                {/* Queue */}
                {playlist.length > 0 && (
                  <motion.div
                    className='w-full max-w-md mx-auto'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <h3 className='text-lg font-semibold text-white mb-4'>Up Next</h3>
                    <div className='max-h-48 overflow-y-auto space-y-2'>
                      {playlist.slice(0, 5).map((song, index) => (
                        <div
                          key={song.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            currentSong?.id === song.id ? 'bg-white/20' : 'hover:bg-white/10'
                          }`}
                          onClick={() => playSong(song)}
                        >
                          <div className='w-8 h-8 rounded bg-gray-600 flex items-center justify-center text-xs text-white'>
                            {index + 1}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-white truncate'>{song.name}</p>
                            <p className='text-xs text-gray-400 truncate'>{song.artist}</p>
                          </div>
                        </div>
                      ))}
                      {playlist.length > 5 && (
                        <p className='text-xs text-gray-400 text-center py-2'>
                          +{playlist.length - 5} more songs
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className='text-center text-white max-w-2xl mx-auto px-4'>
                <motion.div
                  className='mb-8'
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className='w-80 h-80 mx-auto rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl'>
                    <svg className='w-32 h-32 text-white/80' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' />
                    </svg>
                  </div>
                </motion.div>

                <motion.div
                  className='mb-8'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className='text-4xl font-bold mb-4'>🎵 Music Player</h1>
                  <p className='text-xl text-gray-300 mb-2'>No song selected</p>
                  <p className='text-lg text-gray-400'>Search and play your favorite songs!</p>
                </motion.div>

                {/* Quick Search in Full Screen */}
                <motion.div
                  className='w-full max-w-md mx-auto mb-8'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className='relative'>
                    <input
                      type='text'
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder='Search songs, artists...'
                      className='w-full bg-white/10 border border-white/20 text-white px-4 py-3 pl-12 pr-16 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm'
                    />
                    <svg className='w-6 h-6 absolute left-3 top-3.5 text-white/70' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>

                    {isSearching && (
                      <div className='absolute right-12 top-3.5'>
                        <div className='w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin' />
                      </div>
                    )}

                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className='absolute right-3 top-3.5 text-white/70 hover:text-white transition-colors'
                      >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    )}
                  </div>

                  {searchError && (
                    <div className='mt-4 text-red-400 text-sm'>
                      {searchError}
                    </div>
                  )}
                </motion.div>

                {/* Search Results in Full Screen */}
                {memoizedSearchResults.length > 0 && (
                  <motion.div
                    className='w-full max-w-2xl mx-auto'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className='text-lg font-semibold text-white mb-4'>Search Results</h3>
                    <div className='max-h-64 overflow-y-auto space-y-2'>
                      {memoizedSearchResults.slice(0, 8).map((song) => (
                        <div
                          key={song.id}
                          className='flex items-center gap-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors backdrop-blur-sm'
                          onClick={() => playSong(song)}
                        >
                          <Image
                            src={song.image || '/api/placeholder/48/48'}
                            alt={song.name}
                            width={48}
                            height={48}
                            className='w-12 h-12 rounded object-cover'
                            onError={(e) => {
                              e.currentTarget.src = '/api/placeholder/48/48';
                            }}
                          />
                          <div className='flex-1 min-w-0'>
                            <p className='text-base font-medium text-white truncate'>{song.name}</p>
                            <p className='text-sm text-gray-300 truncate'>{song.artist}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToPlaylist(song);
                            }}
                            className='text-white/70 hover:text-white transition-colors'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {memoizedSearchResults.length > 8 && (
                        <p className='text-sm text-gray-400 text-center py-2'>
                          +{memoizedSearchResults.length - 8} more results
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Playlist in Full Screen */}
                {playlist.length > 0 && (
                  <motion.div
                    className='w-full max-w-2xl mx-auto mt-8'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <h3 className='text-lg font-semibold text-white mb-4'>Your Playlist ({playlist.length})</h3>
                    <div className='max-h-48 overflow-y-auto space-y-2'>
                      {playlist.slice(0, 5).map((song, index) => (
                        <div
                          key={song.id}
                          className='flex items-center gap-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors backdrop-blur-sm'
                          onClick={() => playSong(song)}
                        >
                          <div className='w-8 h-8 rounded bg-gray-600 flex items-center justify-center text-xs text-white'>
                            {index + 1}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-base font-medium text-white truncate'>{song.name}</p>
                            <p className='text-sm text-gray-300 truncate'>{song.artist}</p>
                          </div>
                        </div>
                      ))}
                      {playlist.length > 5 && (
                        <p className='text-sm text-gray-400 text-center py-2'>
                          +{playlist.length - 5} more songs
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Close button */}
            <motion.button
              onClick={() => {
                if (isFullScreen) {
                  toggleFullScreen();
                } else {
                  setIsFallbackFullScreen(false);
                }
              }}
              className='absolute top-4 right-4 text-white hover:text-gray-300 transition-colors'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(MusicPlayer);