/**
 * World-aware visual themes for Relate
 *
 * The world should influence the visual atmosphere,
 * but NEVER overpower the actual analogy.
 */

const WORLD_THEMES = {
  City: {
    accent: '#5B4FCF',
    nodeBorder: '#5B4FCF',
    edgeColor: '#7167C9',

    nodeBackground: '#F8F7FF',
    nodeHighlight: '#ECE9FF',
     pattern: 'grid',
    decoration: 'city',
    displayName: 'City',
  },

  Kitchen: {
    accent: '#D96B32',
    nodeBorder: '#D96B32',
    edgeColor: '#E58B5D',

    nodeBackground: '#FFF9F2',
    nodeHighlight: '#FBE8D8',

    decoration: 'kitchen',
    displayName: 'Kitchen',
  },

  Restaurant: {
    accent: '#E05A50',
    nodeBorder: '#E05A50',
    edgeColor: '#E47D73',

    nodeBackground: '#FFF8F4',
    nodeHighlight: '#FCE4DD',

    decoration: 'restaurant',
    displayName: 'Restaurant',
  },

  Sports: {
    accent: '#159E9B',
    nodeBorder: '#159E9B',
    edgeColor: '#49B5B1',

    nodeBackground: '#F3FBFA',
    nodeHighlight: '#DDF3F1',

    decoration: 'sports',
    displayName: 'Sports',
  },

  Movies: {
    accent: '#6845C7',
    nodeBorder: '#6845C7',
    edgeColor: '#8970D5',

    nodeBackground: '#F8F5FF',
    nodeHighlight: '#EDE6FF',

    decoration: 'movies',
    displayName: 'Movies',
  },

  Space: {
    accent: '#5866C7',
    nodeBorder: '#5866C7',
    edgeColor: '#7E89D8',

    nodeBackground: '#F5F6FF',
    nodeHighlight: '#E5E8FF',

    decoration: 'space',
    displayName: 'Space',
  },

  Nature: {
    accent: '#3E8A55',
    nodeBorder: '#3E8A55',
    edgeColor: '#68A878',

    nodeBackground: '#F5FAF5',
    nodeHighlight: '#E1F0E3',

    decoration: 'nature',
    displayName: 'Nature',
  },

  Factory: {
    accent: '#69717A',
    nodeBorder: '#69717A',
    edgeColor: '#9299A0',

    nodeBackground: '#F6F7F7',
    nodeHighlight: '#E6E9EA',

    decoration: 'factory',
    displayName: 'Factory',
  },

  Library: {
    accent: '#8A6638',
    nodeBorder: '#8A6638',
    edgeColor: '#A88A62',

    nodeBackground: '#FCF8F0',
    nodeHighlight: '#F1E7D5',

    decoration: 'library',
    displayName: 'Library',
  },
}

const FALLBACK_THEME = {
  accent: '#5424C7',
  nodeBorder: '#5424C7',
  edgeColor: '#8060D8',

  nodeBackground: '#FAF8FF',
  nodeHighlight: '#EEE8FF',

  decoration: 'minimal',
  displayName: 'Relate',
}

export function getWorldTheme(worldName) {
  if (!worldName || typeof worldName !== 'string') {
    return FALLBACK_THEME
  }

  const normalizedName = worldName.toLowerCase()

  for (const [key, theme] of Object.entries(WORLD_THEMES)) {
    if (key.toLowerCase() === normalizedName) {
      return theme
    }
  }

  return FALLBACK_THEME
}

export function getAllWorldThemes() {
  return WORLD_THEMES
}

export function getWorldNames() {
  return Object.keys(WORLD_THEMES)
}

export default {
  getWorldTheme,
  getAllWorldThemes,
  getWorldNames,
  FALLBACK_THEME,
}